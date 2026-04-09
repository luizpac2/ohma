import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── SplitFlapDigit ───────────────────────────────────────────────────────────
interface SplitFlapDigitProps {
  value: string
  delay?: number
}

export function SplitFlapDigit({ value, delay = 0 }: SplitFlapDigitProps) {
  const [displayed, setDisplayed] = useState('0')
  const chars = '0123456789.'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(chars[i % chars.length])
      i++
    }, 60)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setDisplayed(value)
    }, delay + 800)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [value, delay, chars])

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '52px',
      background: '#0D1117',
      border: '1px solid rgba(212,175,55,0.3)',
      borderRadius: '4px',
      fontFamily: 'var(--font-display)',
      fontSize: '36px',
      color: 'var(--color-ohma-gold)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayed}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.08 }}
          style={{ position: 'absolute' }}
        >
          {displayed}
        </motion.span>
      </AnimatePresence>
      {/* Middle line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: '1px',
        background: 'rgba(212,175,55,0.2)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

// ─── SplitFlapScore ───────────────────────────────────────────────────────────
interface SplitFlapScoreProps {
  score: number
  startDelay?: number
}

export function SplitFlapScore({ score, startDelay = 0 }: SplitFlapScoreProps) {
  const chars = score.toFixed(1).split('')
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {chars.map((c, i) => (
        <SplitFlapDigit key={i} value={c} delay={startDelay + i * 120} />
      ))}
    </div>
  )
}
