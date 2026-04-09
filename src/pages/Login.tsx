import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { signIn, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error: err } = await signIn(email, password)
    if (err) {
      setError('Credenciais inválidas. Verifique e tente novamente.')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-ohma-bg)',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--color-ohma-surface)',
          border: '1px solid var(--color-ohma-border-gold)',
          borderRadius: '12px',
          padding: '48px 40px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px',
            color: 'var(--color-ohma-gold)',
            letterSpacing: '0.08em',
            lineHeight: 1,
          }}>
            OHMA
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-ohma-text-muted)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: '6px',
          }}>
            Acesso Restrito
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={inputStyle}
              placeholder="operador@afa.mil.br"
            />
          </div>
          <div>
            <label style={labelStyle}>Senha</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'rgba(139,26,26,0.2)',
                border: '1px solid rgba(139,26,26,0.5)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: '#ff6b6b',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            id="login-submit"
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: '8px',
              padding: '14px',
              background: loading
                ? 'var(--color-ohma-gold-dark)'
                : 'linear-gradient(135deg, var(--color-ohma-gold), var(--color-ohma-gold-dark))',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              letterSpacing: '0.1em',
              color: '#0A0C0F',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </motion.button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-ohma-text-muted)',
        }}>
          <a href="/placar" style={{ color: 'var(--color-ohma-gold-dark)', textDecoration: 'none' }}>
            ← Ver placar público
          </a>
        </div>
      </motion.div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-ohma-text-muted)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--color-ohma-surface-2)',
  border: '1px solid var(--color-ohma-border)',
  borderRadius: '6px',
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  color: 'var(--color-ohma-text)',
  outline: 'none',
  transition: 'border-color 0.2s',
}
