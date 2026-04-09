import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

import Login from '@/pages/Login'
import PublicScoreboard from '@/pages/PublicScoreboard'
import PresenterPanel from '@/pages/PresenterPanel'
import AdminDashboard from '@/pages/AdminDashboard'
import StatsDashboard from '@/pages/StatsDashboard'

// ─── Protected Route ─────────────────────────────────────────────────────────
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: UserRole[]
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-ohma-bg)',
        fontFamily: 'var(--font-display)',
        fontSize: '24px',
        color: 'var(--color-ohma-gold)',
        letterSpacing: '0.1em',
      }}>
        AUTENTICANDO...
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Navigate to="/placar" replace />} />
        <Route path="/placar" element={<PublicScoreboard />} />
        <Route path="/login" element={<Login />} />

        {/* Apresentador */}
        <Route
          path="/apresentador"
          element={
            <ProtectedRoute allowedRoles={['admin', 'apresentador']}>
              <PresenterPanel />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Stats */}
        <Route
          path="/stats"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operador', 'apresentador']}>
              <StatsDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/placar" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
