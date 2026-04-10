import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function AdminHeader() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const ghostBtnStyle: React.CSSProperties = {
    padding: '6px 14px',
    background: 'transparent',
    border: '1px solid var(--color-ohma-border)',
    borderRadius: '6px',
    fontFamily: 'var(--font-body)', fontSize: '13px',
    color: 'var(--color-ohma-text-muted)', cursor: 'pointer',
    textDecoration: 'none',
  }

  const activeBtnStyle: React.CSSProperties = {
    ...ghostBtnStyle,
    background: 'rgba(212,175,55,0.1)',
    color: 'var(--color-ohma-gold)',
    borderColor: 'var(--color-ohma-gold)',
  }

  const navLinks = [
    { name: 'Admin', path: '/admin', roles: ['admin'] },
    { name: 'Stats', path: '/stats', roles: ['admin', 'operador', 'apresentador'] },
    { name: 'Apresentador', path: '/apresentador', roles: ['admin', 'apresentador'] },
    { name: 'Placar (Público)', path: '/placar', roles: ['admin', 'operador', 'apresentador'] }
  ]

  return (
    <header style={{
      borderBottom: '1px solid var(--color-ohma-border)',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--color-ohma-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ohma-gold)', letterSpacing: '0.1em' }}>
          OHMA — {location.pathname.toUpperCase().replace('/', '') || 'ADMINISTRAÇÃO'}
        </div>
        
        <nav style={{ display: 'flex', gap: '12px' }}>
          {navLinks.filter(l => l.roles.includes(user?.role || 'operador')).map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              style={location.pathname === link.path ? activeBtnStyle : ghostBtnStyle}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-ohma-text-muted)' }}>
            {user.email} · <strong style={{ color: 'var(--color-ohma-gold)' }}>{user.role}</strong>
          </span>
        )}
        <button onClick={signOut} style={ghostBtnStyle}>Sair</button>
      </div>
    </header>
  )
}
