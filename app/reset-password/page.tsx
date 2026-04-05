'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [listo, setListo] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Procesar el hash con el token
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (type === 'recovery' && accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ error }) => {
          if (error) {
            setError('El enlace expiró. Solicita uno nuevo.')
          } else {
            setListo(true)
          }
        })
      } else {
        setError('Enlace inválido. Solicita un nuevo reset.')
      }
    } else {
      setError('No se encontró token. Solicita un nuevo reset.')
    }
  }, [])

  async function handleReset() {
    setError('')
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setMensaje('Contraseña actualizada. Redirigiendo...')
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '40px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #6c47ff, #4f8ef7)',
            borderRadius: '14px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px',
          }}>AT</div>
          <h1 style={{ color: 'white', margin: '0 0 4px', fontSize: '22px', fontWeight: 'bold' }}>
            Nueva contraseña
          </h1>
          <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
            Ingresa tu nueva contraseña
          </p>
        </div>

        {!listo && !error && (
          <p style={{ color: '#888', textAlign: 'center' }}>Verificando enlace...</p>
        )}

        {listo && (
          <>
            <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Nueva contraseña
            </label>
            <input
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres" type="password"
              style={inputStyle}
            />
            <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Confirmar contraseña
            </label>
            <input
              value={confirmar} onChange={e => setConfirmar(e.target.value)}
              placeholder="Repite tu contraseña" type="password"
              style={inputStyle}
            />
            <button onClick={handleReset} disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#2563eb88' : '#3b82f6',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}>
              {loading ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#f87171',
            fontSize: '13px', marginBottom: '16px'
          }}>{error}</div>
        )}
        {mensaje && (
          <div style={{
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#4ade80',
            fontSize: '13px', marginBottom: '16px'
          }}>{mensaje}</div>
        )}

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#555', margin: 0 }}>
          Avanch Technology SRL · Santo Domingo Este, RD
        </p>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: 'white',
  fontSize: '14px', marginBottom: '16px',
  outline: 'none', boxSizing: 'border-box',
}