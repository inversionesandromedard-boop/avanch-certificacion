'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface EmpresaConProgreso {
  id: string
  nombre: string
  rnc: string
  estado_certificacion: string
  progreso: number
}

export default function CertificacionesPage() {
  const [empresas, setEmpresas] = useState<EmpresaConProgreso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else cargarDatos()
    })
  }, [])

  async function cargarDatos() {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          id, nombre, rnc, estado_certificacion,
          certificaciones (progreso)
        `)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error

      const lista = (data || []).map((e: any) => ({
        id: e.id,
        nombre: e.nombre,
        rnc: e.rnc,
        estado_certificacion: e.estado_certificacion,
        progreso: e.certificaciones?.[0]?.progreso || 0,
      }))

      setEmpresas(lista)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
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

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>
            Certificaciones
          </h1>
          <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
            Seguimiento del proceso de certificación por empresa
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#f87171',
            fontSize: '13px', marginBottom: '16px'
          }}>{error}</div>
        )}

        {loading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Cargando...</p>
        ) : empresas.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '48px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: '#888', fontSize: '16px', margin: 0 }}>
              No hay certificaciones activas
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {empresas.map((empresa) => (
              <div key={empresa.id} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: 'white', margin: '0 0 4px', fontSize: '16px', fontWeight: '600' }}>
                      {empresa.nombre}
                    </h3>
                    <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>
                      RNC: {empresa.rnc}
                    </p>
                  </div>
                  <span style={{
                    background: `${estadoColor[empresa.estado_certificacion]}22`,
                    border: `1px solid ${estadoColor[empresa.estado_certificacion]}44`,
                    color: estadoColor[empresa.estado_certificacion],
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '600',
                  }}>
                    {empresa.estado_certificacion}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#aaa', fontSize: '13px' }}>Progreso</span>
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>
                      {empresa.progreso}%
                    </span>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px', height: '8px', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${empresa.progreso}%`,
                      height: '100%',
                      background: empresa.progreso === 100 ? '#22c55e' : '#3b82f6',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/certificaciones/${empresa.id}`)}
                  style={{
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    color: '#60a5fa', padding: '8px 16px',
                    borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '600',
                  }}>
                  Ver detalle →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}