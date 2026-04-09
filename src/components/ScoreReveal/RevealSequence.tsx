import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RankingRow, RevealEvent } from '@/types'
import { TeamLogo } from '@/components/TeamCard/TeamLogo'
import { SplitFlapScore } from './SplitFlapDigit'

interface RevealSequenceProps {
  ranking: RankingRow[]
  event: RevealEvent | null
  onComplete: () => void
}

type Stage = 'idle' | 'fadeout' | 'countdown' | 'flash' | 'reveal' | 'done'

function playBeep(ctx: AudioContext, freq: number, duration: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = freq
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function RevealSequence({ ranking, event, onComplete }: RevealSequenceProps) {
  const [stage, setStage] = useState<Stage>('idle')
  const [countdown, setCountdown] = useState(3)
  const [visibleCount, setVisibleCount] = useState(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const isSuspense = event?.speed === 'suspense'

  const speeds = {
    countdownMs: isSuspense ? 1200 : 700,
    entryDelayMs: isSuspense ? 900 : 400,
    flipDelayMs: isSuspense ? 1200 : 500,
  }

  const runSequence = useCallback(async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    const ctx = audioCtxRef.current

    // 1. Fade out
    setStage('fadeout')
    await delay(600)

    // 2. Countdown 3..2..1
    setStage('countdown')
    for (let n = 3; n >= 1; n--) {
      setCountdown(n)
      playBeep(ctx, n === 1 ? 880 : 440, 0.4)
      await delay(speeds.countdownMs)
    }

    // 3. Flash
    setStage('flash')
    playBeep(ctx, 1200, 0.2)
    await delay(300)

    // 4. Reveal equipes da última para a primeira
    setStage('reveal')
    const total = ranking.length
    for (let i = total - 1; i >= 0; i--) {
      setVisibleCount(total - i)
      await delay(speeds.entryDelayMs)
    }

    setStage('done')
    onComplete()
  }, [ranking, speeds, onComplete])

  useEffect(() => {
    if (event?.action === 'start_reveal' && stage === 'idle') {
      setVisibleCount(0)
      runSequence()
    }
    if (event?.action === 'reset') {
      setStage('idle')
      setVisibleCount(0)
    }
  }, [event, stage, runSequence])

  // Sorted last→first for reveal animation
  const reversed = [...ranking].reverse()
  const visibleTeams = reversed.slice(0, visibleCount)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Flash overlay */}
      <AnimatePresence>
        {stage === 'flash' && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'white',
              zIndex: 9000,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Countdown overlay */}
      <AnimatePresence>
        {stage === 'countdown' && (
          <motion.div
            key="countdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10,12,15,0.92)',
              zIndex: 8000,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '200px',
                  color: 'var(--color-ohma-gold)',
                  lineHeight: 1,
                  textShadow: '0 0 60px rgba(212,175,55,0.6)',
                }}
              >
                {countdown}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal list */}
      {(stage === 'reveal' || stage === 'done') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {visibleTeams.map((equipe, _i) => {
              const globalPosition = ranking.findIndex((r) => r.id === equipe.id) + 1
              return (
                <motion.div
                  key={equipe.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    background: globalPosition === 1
                      ? 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(24,28,34,1))'
                      : 'var(--color-ohma-surface)',
                    border: globalPosition === 1
                      ? '1px solid rgba(212,175,55,0.5)'
                      : '1px solid var(--color-ohma-border)',
                    borderRadius: '8px',
                    padding: '20px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                  }}
                  className={globalPosition === 1 ? 'glow-gold' : ''}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '48px',
                    color: globalPosition === 1 ? 'var(--color-ohma-gold)' : 'var(--color-ohma-text-muted)',
                    minWidth: '60px',
                  }}>
                    {globalPosition}º
                  </div>
                  <TeamLogo logoUrl={equipe.logo_url} nome={equipe.nome} corPrimaria={equipe.cor_primaria} size={60} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '28px',
                      color: globalPosition === 1 ? 'var(--color-ohma-gold)' : 'var(--color-ohma-text)',
                    }}>
                      {equipe.nome}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-ohma-text-muted)' }}>
                      {equipe.escola}
                    </div>
                  </div>
                  <SplitFlapScore score={equipe.total} startDelay={speeds.flipDelayMs} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
