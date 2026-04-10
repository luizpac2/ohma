import { motion } from 'framer-motion'
import type { RankingRow } from '@/types'
import { TeamLogo } from './TeamLogo'
import { PhaseBreakdown } from '@/components/PhaseBreakdown'

interface TeamCardProps {
  equipe: RankingRow
  position: number
  isLeader: boolean
  showBreakdown?: boolean
  animationDelay?: number
}

const POSITION_COLORS: Record<number, string> = {
  1: '#D4AF37',
  2: '#C0C0C0',
  3: '#CD7F32',
}

export function TeamCard({
  equipe,
  position,
  isLeader,
  showBreakdown = true,
  animationDelay = 0,
}: TeamCardProps) {
  const posColor = POSITION_COLORS[position] ?? 'var(--color-ohma-text-muted)'

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: animationDelay, ease: 'easeOut' }}
      className={isLeader ? 'glow-gold' : ''}
      style={{
        background: isLeader
          ? 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(24,28,34,1) 60%)'
          : 'var(--color-ohma-surface)',
        border: isLeader
          ? '1px solid rgba(212,175,55,0.5)'
          : '1px solid var(--color-ohma-border)',
        borderRadius: 'var(--radius-card)',
        padding: showBreakdown ? '20px 24px' : '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent strip */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '3px',
        background: posColor,
        borderRadius: '4px 0 0 4px',
      }} />

      {/* Position badge */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: showBreakdown ? '36px' : '24px',
        lineHeight: 1,
        color: posColor,
        minWidth: showBreakdown ? '48px' : '32px',
        textAlign: 'center',
        flexShrink: 0,
        fontWeight: 700,
      }}>
        {position}
      </div>

      {/* Logo */}
      <TeamLogo
        logoUrl={equipe.logo_url}
        nome={equipe.nome}
        corPrimaria={equipe.cor_primaria}
        size={showBreakdown ? 52 : 36}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: showBreakdown ? '22px' : '18px',
          letterSpacing: '0.06em',
          color: isLeader ? 'var(--color-ohma-gold)' : 'var(--color-ohma-text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 600,
        }}>
          {equipe.nome}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: showBreakdown ? '13px' : '11px',
          color: 'var(--color-ohma-text-muted)',
          marginBottom: showBreakdown ? '10px' : 0,
        }}>
          {equipe.escola}
        </div>
        {showBreakdown && <PhaseBreakdown equipe={equipe} index={position} />}
      </div>

      {/* Total score */}
      <div style={{
        textAlign: 'right',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: showBreakdown ? '42px' : '28px',
          lineHeight: 1,
          color: isLeader ? 'var(--color-ohma-gold)' : 'var(--color-ohma-text)',
          letterSpacing: '0.04em',
          fontWeight: 700,
        }}
          className={isLeader ? 'glow-text-gold' : ''}
        >
          {equipe.total.toFixed(1)}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: showBreakdown ? '11px' : '9px',
          color: 'var(--color-ohma-text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          pontos
        </div>
      </div>
    </motion.div>
  )
}
