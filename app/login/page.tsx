'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'registro'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  async function handleRegistro() {
    setLoading(true)
    setError('')
    if (!nombre || nombre.trim().length < 2) {
      setError('El nombre es obligatorio')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, telefono }
      }
    })
    if (error) {
      setError(error.message)
    } else {
      setMensaje('Revisa tu correo para confirmar tu cuenta.')
    }
    setLoading(false)
  }

  async function handleReset() {
    if (!email) {
      setError('Ingresa tu correo primero')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      setError(error.message)
    } else {
      setMensaje('Te enviamos un enlace para restablecer tu contraseña.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #6c47ff, #4f8ef7)',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
          }}>AT</div>
          <h1 style={{ color: 'white', margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
            Avanch Certificación
          </h1>
          <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
            Sistema de certificación electrónica e-CF
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '28px',
        }}>
          {(['login', 'registro'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setMensaje('') }}
              style={{
                flex: 1, padding: '10px',
                borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                background: tab === t ? '#3b82f6' : 'transparent',
                color: tab === t ? 'white' : '#888',
                transition: 'all 0.2s',
              }}>
              {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Campos */}
        {tab === 'registro' && (
          <>
            <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Nombre completo
            </label>
            <input
              value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              style={inputStyle}
            />
            <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Teléfono
            </label>
            <input
              value={telefono} onChange={e => setTelefono(e.target.value)}
              placeholder="809-000-0000"
              style={inputStyle}
            />
          </>
        )}

        <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
          Correo electrónico
        </label>
        <input
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="correo@empresa.com"
          type="email"
          style={inputStyle}
        />

        <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
          Contraseña
        </label>
        <input
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          type="password"
          style={inputStyle}
        />

        {/* Error / Mensaje */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {mensaje && (
          <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#4ade80', fontSize: '13px', marginBottom: '16px' }}>
            {mensaje}
          </div>
        )}

        {/* Botón principal */}
        <button
          onClick={tab === 'login' ? handleLogin : handleRegistro}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#2563eb88' : '#3b82f6',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '16px', transition: 'background 0.2s',
          }}>
          {loading ? 'Cargando...' : tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        {/* Olvidaste contraseña */}
        {tab === 'login' && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', margin: '0 0 20px' }}>
            ¿Olvidaste tu contraseña?{' '}
            <span onClick={handleReset}
              style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}>
              Restablecer
            </span>
          </p>
        )}

        {/* Footer */}
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