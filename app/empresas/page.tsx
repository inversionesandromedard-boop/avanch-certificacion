'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { crearEmpresa, obtenerEmpresas, type EmpresaInput, type EmpresaCompleta } from '@/services/empresas'

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<EmpresaCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState<EmpresaInput>({
    nombre: '', rnc: '', email: '', telefono: '', direccion: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else cargarEmpresas()
    })
  }, [])

  async function cargarEmpresas() {
    try {
      const data = await obtenerEmpresas()
      setEmpresas(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCrear() {
    setGuardando(true)
    setError('')
    try {
      await crearEmpresa(form)
      setMensaje('Empresa creada exitosamente')
      setMostrarForm(false)
      setForm({ nombre: '', rnc: '', email: '', telefono: '', direccion: '' })
      cargarEmpresas()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const estadoColor: Record<string, string> = {
    pendiente: '#888',
    en_proceso: '#f59e0b',
    certificada: '#22c55e',
  }

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
        <button onClick={() => router.push('/dashboard')} style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', padding: '8px 16px',
          borderRadius: '8px', cursor: 'pointer',
          fontSize: '13px', fontWeight: '600',
        }}>
          ← Dashboard
        </button>
      </nav>

      <main style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>
              Empresas
            </h1>
            <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
              Gestiona las empresas en proceso de certificación
            </p>
          </div>
          <button onClick={() => { setMostrarForm(!mostrarForm); setError('') }} style={{
            background: '#3b82f6', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '12px 20px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600',
          }}>
            {mostrarForm ? 'Cancelar' : '+ Nueva empresa'}
          </button>
        </div>

        {/* Formulario */}
        {mostrarForm && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '24px', marginBottom: '24px',
          }}>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 20px' }}>
              Nueva empresa
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Nombre de la empresa *', key: 'nombre', placeholder: 'Empresa SRL' },
                { label: 'RNC *', key: 'rnc', placeholder: '000-000000-0' },
                { label: 'Email', key: 'email', placeholder: 'contacto@empresa.com' },
                { label: 'Teléfono', key: 'telefono', placeholder: '809-000-0000' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                    {field.label}
                  </label>
                  <input
                    value={(form as any)[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '8px' }}>
              <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Dirección
              </label>
              <input
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                placeholder="Calle, ciudad, provincia"
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', padding: '10px 14px', color: '#f87171',
                fontSize: '13px', margin: '16px 0'
              }}>{error}</div>
            )}

            <button onClick={handleCrear} disabled={guardando} style={{
              background: guardando ? '#2563eb88' : '#3b82f6',
              color: 'white', border: 'none', borderRadius: '8px',
              padding: '12px 24px', cursor: guardando ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600', marginTop: '16px',
            }}>
              {guardando ? 'Guardando...' : 'Crear empresa'}
            </button>
          </div>
        )}

        {/* Mensaje éxito */}
        {mensaje && (
          <div style={{
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#4ade80',
            fontSize: '13px', marginBottom: '16px'
          }}>{mensaje}</div>
        )}

        {/* Lista de empresas */}
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Cargando empresas...</p>
        ) : empresas.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '48px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
            <p style={{ color: '#888', fontSize: '16px', margin: 0 }}>
              No hay empresas registradas aún
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {empresas.map((empresa) => (
              <div key={empresa.id} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <h3 style={{ color: 'white', margin: '0 0 4px', fontSize: '16px', fontWeight: '600' }}>
                    {empresa.nombre}
                  </h3>
                  <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>
                    RNC: {empresa.rnc} {empresa.email ? `· ${empresa.email}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    background: `${estadoColor[empresa.estado_certificacion]}22`,
                    border: `1px solid ${estadoColor[empresa.estado_certificacion]}44`,
                    color: estadoColor[empresa.estado_certificacion],
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                  }}>
                    {empresa.estado_certificacion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: 'white',
  fontSize: '14px', outline: 'none',
  boxSizing: 'border-box',
}