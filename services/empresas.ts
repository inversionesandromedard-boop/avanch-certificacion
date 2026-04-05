import { createClient } from '@/lib/supabase/client'

export interface EmpresaInput {
  nombre: string
  rnc: string
  email?: string
  telefono?: string
  direccion?: string
}

export interface EmpresaCompleta {
  id: string
  nombre: string
  rnc: string
  email: string | null
  telefono: string | null
  direccion: string | null
  estado_certificacion: string
  created_by: string
  fecha_creacion: string
  updated_at: string
}

function validarRNC(rnc: string): boolean {
  const limpio = rnc.replace(/[-\s]/g, '')
  return /^\d{9}$/.test(limpio) || /^\d{11}$/.test(limpio)
}

function validarEmpresaInput(data: EmpresaInput): string | null {
  if (!data.nombre || data.nombre.trim().length < 2) {
    return 'El nombre de la empresa es obligatorio (mínimo 2 caracteres)'
  }
  if (!data.rnc) {
    return 'El RNC es obligatorio'
  }
  if (!validarRNC(data.rnc)) {
    return 'RNC inválido. Debe tener 9 dígitos (empresa) o 11 dígitos (persona física)'
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return 'Email inválido'
  }
  return null
}

export async function crearEmpresa(data: EmpresaInput): Promise<EmpresaCompleta> {
  const supabase = createClient()

  const errorValidacion = validarEmpresaInput(data)
  if (errorValidacion) throw new Error(errorValidacion)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autenticado. Inicia sesión para continuar.')

  const { data: existente } = await supabase
    .from('empresas')
    .select('id')
    .eq('rnc', data.rnc.replace(/[-\s]/g, ''))
    .maybeSingle()

  if (existente) throw new Error(`Ya existe una empresa registrada con RNC ${data.rnc}`)

  const { data: empresa, error: errorEmpresa } = await supabase
    .from('empresas')
    .insert([{
      nombre: data.nombre.trim(),
      rnc: data.rnc.replace(/[-\s]/g, ''),
      email: data.email?.trim() || null,
      telefono: data.telefono?.trim() || null,
      direccion: data.direccion?.trim() || null,
      created_by: user.id,
    }])
    .select()
    .single()

  if (errorEmpresa) throw new Error('No se pudo crear la empresa.')

  const { error: errorCert } = await supabase
    .from('certificaciones')
    .insert([{ empresa_id: empresa.id, created_by: user.id }])

  if (errorCert) {
    await supabase.from('empresas').delete().eq('id', empresa.id)
    throw new Error('Error al iniciar el proceso de certificación.')
  }

  const { data: pasos, error: errorPasos } = await supabase
    .from('pasos_certificacion')
    .select('id')
    .order('orden', { ascending: true })

  if (errorPasos || !pasos?.length) {
    await supabase.from('certificaciones').delete().eq('empresa_id', empresa.id)
    await supabase.from('empresas').delete().eq('id', empresa.id)
    throw new Error('Error al cargar los pasos de certificación.')
  }

  const { error: errorInsertPasos } = await supabase
    .from('empresa_pasos')
    .insert(pasos.map((p) => ({
      empresa_id: empresa.id,
      paso_id: p.id,
      estado: 'pendiente',
    })))

  if (errorInsertPasos) {
    await supabase.from('certificaciones').delete().eq('empresa_id', empresa.id)
    await supabase.from('empresas').delete().eq('id', empresa.id)
    throw new Error('Error al asignar los pasos de certificación.')
  }

  return empresa as EmpresaCompleta
}

export async function obtenerEmpresas(): Promise<EmpresaCompleta[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('fecha_creacion', { ascending: false })

  if (error) throw new Error('No se pudieron cargar las empresas')
  return (data || []) as EmpresaCompleta[]
}

export async function actualizarPaso(
  pasoId: string,
  estado: 'pendiente' | 'en_progreso' | 'completado',
  comentario?: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('empresa_pasos')
    .update({ estado, comentario: comentario || null, actualizado_por: user.id })
    .eq('id', pasoId)
    .select()
    .single()

  if (error) throw new Error('No se pudo actualizar el paso')
  return data
}