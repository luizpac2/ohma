import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { RevealEvent } from '@/types'
import AdminHeader from '@/components/AdminHeader'

export default function PresenterPanel() {
  const [speed, setSpeed] = useState<'suspense' | 'rapido'>('suspense')
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  function getChannel() {
    if (!channelRef.current) {
      channelRef.current = supabase.channel('presenter-control')
      channelRef.current.subscribe()
    }
    return channelRef.current
  }

  async function handleReveal() {
    setStatus('running')
    const event: RevealEvent = {
      action: 'start_reveal',
      speed,
      timestamp: new Date().toISOString(),
    }
    await getChannel().send({
      type: 'broadcast',
      event: 'reveal',
      payload: event,
    })
  }

  async function handleReset() {
    const event: RevealEvent = {
      action: 'reset',
      speed,
      timestamp: new Date().toISOString(),
    }
    await getChannel().send({
      type: 'broadcast',
      event: 'reveal',
      payload: event,
    })
    setStatus('idle')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ohma-bg)', display: 'flex', flexDirection: 'column' }}>
      <AdminHeader />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--color-ohma-surface)',
          border: '1px solid var(--color-ohma-border-gold)',
          borderRadius: '16px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            color: 'var(--color-ohma-gold)',
            letterSpacing: '0.1em',
          }}>
            PAINEL DO APRESENTADOR
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-ohma-text-muted)',
            marginTop: '4px',
          }}>
            Controle de revelação do placar — OHMA
          </div>
        </div>

        {/* Speed selector */}
        <div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--color-ohma-text-muted)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Velocidade de revelação
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['suspense', 'rapido'] as const).map((opt) => (
              <button
                key={opt}
                id={`speed-${opt}`}
                onClick={() => setSpeed(opt)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: speed === opt
                    ? 'rgba(212,175,55,0.15)'
                    : 'var(--color-ohma-surface-2)',
                  border: speed === opt
                    ? '1px solid rgba(212,175,55,0.5)'
                    : '1px solid var(--color-ohma-border)',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  letterSpacing: '0.06em',
                  color: speed === opt ? 'var(--color-ohma-gold)' : 'var(--color-ohma-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {opt === 'suspense' ? '🎭 SUSPENSE MÁXIMO' : '⚡ RÁPIDO'}
              </button>
            ))}
          </div>
        </div>

        {/* Reveal button */}
        <motion.button
          id="btn-reveal"
          onClick={handleReveal}
          disabled={status === 'running'}
          whileHover={status !== 'running' ? { scale: 1.03 } : {}}
          whileTap={status !== 'running' ? { scale: 0.97 } : {}}
          style={{
            padding: '24px',
            background: status === 'running'
              ? 'rgba(212,175,55,0.1)'
              : 'linear-gradient(135deg, #D4AF37, #A8861E)',
            border: status === 'running' ? '1px solid rgba(212,175,55,0.3)' : 'none',
            borderRadius: '12px',
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            letterSpacing: '0.1em',
            color: status === 'running' ? 'var(--color-ohma-gold-dark)' : '#0A0C0F',
            cursor: status === 'running' ? 'not-allowed' : 'pointer',
            boxShadow: status !== 'running' ? '0 8px 32px rgba(212,175,55,0.3)' : 'none',
          }}
        >
          {status === 'running' ? '⏳ REVELANDO...' : '🎬 REVELAR PLACAR'}
        </motion.button>

        {/* Reset button */}
        {status !== 'idle' && (
          <motion.button
            id="btn-reset"
            onClick={handleReset}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '14px',
              background: 'transparent',
              border: '1px solid var(--color-ohma-border)',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: 'var(--color-ohma-text-muted)',
              cursor: 'pointer',
            }}
          >
            ↺ Resetar Placar
          </motion.button>
        )}

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-ohma-text-muted)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          O evento é transmitido via Realtime para todos os clientes conectados em <strong style={{ color: 'var(--color-ohma-text)' }}>/placar</strong>
        </div>
      </motion.div>
      </div>
    </div>
  )
}
