'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { actualizarPaso } from '@/services/empresas'

interface Paso {
  id: string
  estado: string
  comentario: string | null
  paso: {
    nombre: string
    descripcion: string
    orden: number
    requerido: boolean
  }
}

export default function DetalleCertificacionPage() {
  const [empresa, setEmpresa] = useState<any>(null)
  const [certificacion, setCertificacion] = useState<any>(null)
  const [pasos, setPasos] = useState<Paso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actualizando, setActualizando] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const empresaId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else cargarDatos()
    })
  }, [])

  async function cargarDatos() {
    try {
      const { data: emp } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .single()
      setEmpresa(emp)

      const { data: cert } = await supabase
        .from('certificaciones')
        .select('*')
        .eq('empresa_id', empresaId)
        .single()
      setCertificacion(cert)

     const { data: ps } = await supabase
  .from('empresa_pasos')
  .select(`
    id, estado, comentario,
    paso:pasos_certificacion (nombre, descripcion, orden, requerido)
  `)
  .eq('empresa_id', empresaId)
      setPasos((ps || []) as any)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function cambiarEstado(pasoId: string, nuevoEstado: 'pendiente' | 'en_progreso' | 'completado') {
    setActualizando(pasoId)
    try {
      await actualizarPaso(pasoId, nuevoEstado)
      await cargarDatos()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setActualizando(null)
    }
  }

  const estadoColor: Record<string, string> = {
    pendiente: '#888',
    en_progreso: '#f59e0b',
    completado: '#22c55e',
  }

  const estadoIcon: Record<string, string> = {
    pendiente: '⏸',
    en_progreso: '⏳',
    completado: '✅',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 32px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', height: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6c47ff, #4f8ef7)',
            borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 'bold', color: 'white',
          }}>AT</div>
          <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
            Avanch Certificación
          </span>
        </div>
        <button onClick={() => router.push('/certificaciones')} style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', padding: '8px 16px',
          borderRadius: '8px', cursor: 'pointer',
          fontSize: '13px', fontWeight: '600',
        }}>
          ← Certificaciones
        </button>
      </nav>

      <main style={{ padding: '32px' }}>

        {/* Header empresa */}
        {empresa && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '24px', marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px' }}>
                  {empresa.nombre}
                </h1>
                <p style={{ color: '#888', margin: '0 0 16px', fontSize: '14px' }}>
                  RNC: {empresa.rnc} {empresa.email ? `· ${empresa.email}` : ''}
                </p>
              </div>
            </div>

            {/* Barra de progreso */}
            {certificacion && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#aaa', fontSize: '14px' }}>Progreso general</span>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>
                    {certificacion.progreso}%
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${certificacion.progreso}%`, height: '100%',
                    background: certificacion.progreso === 100 ? '#22c55e' : '#3b82f6',
                    borderRadius: '6px', transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#f87171',
            fontSize: '13px', marginBottom: '16px'
          }}>{error}</div>
        )}

        {/* Pasos */}
        <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>
          Pasos de certificación
        </h2>

        <div style={{ display: 'grid', gap: '12px' }}>
          {pasos.map((p, index) => (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${p.estado === 'completado' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '12px', padding: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `${estadoColor[p.estado]}22`,
                  border: `2px solid ${estadoColor[p.estado]}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 'bold', color: estadoColor[p.estado],
                  flexShrink: 0,
                }}>
                  {index + 1}
                </div>
                <div>
                  <h3 style={{ color: 'white', margin: '0 0 4px', fontSize: '15px', fontWeight: '600' }}>
                    {estadoIcon[p.estado]} {p.paso.nombre}
                  </h3>
                  <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>
                    {p.paso.descripcion}
                  </p>
                </div>
              </div>

              {/* Selector de estado */}
              <select
                value={p.estado}
                disabled={actualizando === p.id}
                onChange={e => cambiarEstado(p.id, e.target.value as any)}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: estadoColor[p.estado],
                  padding: '8px 12px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', outline: 'none',
                  minWidth: '140px',
                }}>
                <option value="pendiente" style={{ background: '#1a1a2e', color: '#888' }}>⏸ Pendiente</option>
                <option value="en_progreso" style={{ background: '#1a1a2e', color: '#f59e0b' }}>⏳ En progreso</option>
                <option value="completado" style={{ background: '#1a1a2e', color: '#22c55e' }}>✅ Completado</option>
              </select>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}