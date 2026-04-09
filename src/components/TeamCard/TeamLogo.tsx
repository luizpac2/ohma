interface TeamLogoProps {
  logoUrl: string | null
  nome: string
  corPrimaria: string
  size?: number
}

export function TeamLogo({ logoUrl, nome, corPrimaria, size = 56 }: TeamLogoProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo ${nome}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${corPrimaria}`,
        }}
      />
    )
  }

  // Fallback: iniciais com cor da equipe
  const initials = nome
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      aria-label={`Logo ${nome}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${corPrimaria}33, ${corPrimaria}88)`,
        border: `2px solid ${corPrimaria}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: size * 0.35,
        color: corPrimaria,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
