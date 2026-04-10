import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeRanking } from '@/hooks/useRealtimeRanking'
import { TeamCard } from '@/components/TeamCard/TeamCard'
import { RevealSequence } from '@/components/ScoreReveal/RevealSequence'
import { supabase } from '@/lib/supabase'
import type { RevealEvent } from '@/types'

export default function PublicScoreboard() {
  const { ranking, loading, error } = useRealtimeRanking()
  const [revealEvent, setRevealEvent] = useState<RevealEvent | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Escuta canal de controle do apresentador
  useEffect(() => {
    const channel = supabase
      .channel('presenter-control')
      .on('broadcast', { event: 'reveal' }, ({ payload }) => {
        setRevealEvent(payload as RevealEvent)
        if ((payload as RevealEvent).action === 'start_reveal') {
          setIsRevealing(true)
        } else {
          setIsRevealing(false)
        }
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [])

  const now = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-ohma-bg)',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--color-ohma-border-gold)',
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(212,175,55,0.04) 0%, transparent 100%)',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '42px',
            color: 'var(--color-ohma-gold)',
            letterSpacing: '0.1em',
            lineHeight: 1,
          }}>
            OHMA
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--color-ohma-text-muted)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            Olimpíada de História Militar e Aeronáutica
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            color: 'var(--color-ohma-text)',
            letterSpacing: '0.05em',
          }}>
            PLACAR OFICIAL
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--color-ohma-text-muted)',
            letterSpacing: '0.1em',
          }}>
            Atualizado: {now}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            color: 'var(--color-ohma-text-muted)',
            letterSpacing: '0.1em',
          }}>
            CARREGANDO PLACAR...
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(139,26,26,0.2)',
            border: '1px solid rgba(139,26,26,0.4)',
            borderRadius: '8px',
            padding: '20px',
            color: '#ff6b6b',
            fontFamily: 'var(--font-body)',
          }}>
            Erro ao carregar placar: {error}
          </div>
        )}

        {/* Normal scoreboard view */}
        <AnimatePresence>
          {!isRevealing && !loading && !error && (
            <motion.div
              key="scoreboard"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {ranking.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  color: 'var(--color-ohma-text-muted)',
                  letterSpacing: '0.1em',
                }}>
                  NENHUMA EQUIPE CADASTRADA
                </div>
              ) : (
                <>
                  {/* Top 3 - Expandidos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ranking.slice(0, 3).map((equipe, i) => (
                      <TeamCard
                        key={equipe.id}
                        equipe={equipe}
                        position={i + 1}
                        isLeader={i === 0}
                        showBreakdown={true}
                        animationDelay={i * 0.08}
                      />
                    ))}
                  </div>

                  {/* Restante - Grid Compacto */}
                  {ranking.length > 3 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '12px',
                      marginTop: '6px'
                    }}>
                      {ranking.slice(3).map((equipe, i) => (
                        <TeamCard
                          key={equipe.id}
                          equipe={equipe}
                          position={i + 4}
                          isLeader={false}
                          showBreakdown={false}
                          animationDelay={0.3 + (i * 0.05)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal animation */}
        {isRevealing && (
          <RevealSequence
            ranking={ranking}
            event={revealEvent}
            onComplete={() => setIsRevealing(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-ohma-border)',
        padding: '12px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--color-ohma-text-muted)',
          letterSpacing: '0.1em',
        }}>
          Academia da Força Aérea — AFA
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--color-ohma-text-muted)',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#4ADE80',
            display: 'inline-block',
            boxShadow: '0 0 6px rgba(74,222,128,0.6)',
          }} />
          TRANSMISSÃO AO VIVO
        </div>
      </footer>
    </div>
  )
}
