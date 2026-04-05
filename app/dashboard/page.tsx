'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    en_proceso: 0,
    certificadas: 0,
    pendientes: 0,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        cargarStats()
      }
    })
  }, [])

  async function cargarStats() {
    const { data } = await supabase
      .from('empresas')
      .select('estado_certificacion')

    if (data) {
      const total = data.length
      const en_proceso = data.filter(e => e.estado_certificacion === 'en_proceso').length
      const certificadas = data.filter(e => e.estado_certificacion === 'certificada').length
      const pendientes = data.filter(e => e.estado_certificacion === 'pendiente').length
      setStats({ total, en_proceso, certificadas, pendientes })
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: 'system-ui, sans-serif'
    }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', padding: '8px 16px',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
          }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main style={{ padding: '32px' }}>

        {/* Bienvenida */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px' }}>
            Bienvenido al Panel de Certificación
          </h1>
          <p style={{ color: '#888', margin: 0, fontSize: '15px' }}>
            Gestiona el proceso de certificación electrónica e-CF de tus empresas
          </p>
        </div>

        {/* Tarjetas con datos reales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Empresas registradas', valor: stats.total, color: '#3b82f6', icon: '🏢' },
            { label: 'En proceso', valor: stats.en_proceso, color: '#f59e0b', icon: '⏳' },
            { label: 'Certificadas', valor: stats.certificadas, color: '#22c55e', icon: '✅' },
            { label: 'Pendientes', valor: stats.pendientes, color: '#888', icon: '📋' },
          ].map((card) => (
            <div key={card.label} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '24px',
              cursor: 'pointer',
            }} onClick={() => router.push('/empresas')}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: card.color, marginBottom: '4px' }}>
                {card.valor}
              </div>
              <div style={{ color: '#888', fontSize: '14px' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>
            Acciones rápidas
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/empresas')} style={{
              background: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '8px',
              padding: '12px 20px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
            }}>
              + Nueva empresa
            </button>
            <button onClick={() => router.push('/empresas')} style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white', borderRadius: '8px',
              padding: '12px 20px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
            }}>
              🏢 Ver empresas
            </button>
            <button onClick={() => router.push('/certificaciones')} style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white', borderRadius: '8px',
              padding: '12px 20px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
            }}>
              📋 Ver certificaciones
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}