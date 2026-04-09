import { motion } from 'framer-motion'
import type { RankingRow } from '@/types'

interface PhaseBreakdownProps {
  equipe: RankingRow
  index: number
}

const PHASES = [
  { key: 'pontos_fase1' as const, label: 'Fase I', color: '#D4AF37' },
  { key: 'pontos_fase2' as const, label: 'Fase II', color: '#A8861E' },
  { key: 'pontos_fase3' as const, label: 'Fase III', color: '#7A6015' },
  { key: 'pontos_fase4' as const, label: 'Fase IV', color: '#4A3A0A' },
]

export function PhaseBreakdown({ equipe, index: _index }: PhaseBreakdownProps) {
  const max = Math.max(equipe.pontos_fase1, equipe.pontos_fase2, equipe.pontos_fase3, equipe.pontos_fase4, 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {PHASES.map((phase) => {
        const val = equipe[phase.key]
        const pct = (val / max) * 100
        return (
          <div key={phase.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--color-ohma-text-muted)',
              width: '48px',
              flexShrink: 0,
              letterSpacing: '0.05em',
            }}>
              {phase.label}
            </span>
            <div style={{
              flex: 1,
              height: '6px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: phase.color,
                  borderRadius: '3px',
                }}
              />
            </div>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-ohma-text)',
              width: '42px',
              textAlign: 'right',
              flexShrink: 0,
            }}>
              {val.toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
