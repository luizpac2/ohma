import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRole, AuthUser } from '@/types'

function extractRole(session: Session | null): UserRole {
  if (!session) return 'viewer'
  const jwt = session.access_token
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]))
    // Supabase custom claims: app_metadata.role ou user_metadata.role
    return (
      payload?.app_metadata?.role ||
      payload?.user_metadata?.role ||
      'viewer'
    ) as UserRole
  } catch {
    return 'viewer'
  }
}

interface UseAuthReturn {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const buildUser = useCallback((supaUser: User | null, sess: Session | null): AuthUser | null => {
    if (!supaUser || !sess) return null
    return {
      id: supaUser.id,
      email: supaUser.email ?? '',
      role: extractRole(sess),
    }
  }, [])

  useEffect(() => {
    // Pega sessão inicial
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess)
      setUser(buildUser(sess?.user ?? null, sess))
      setLoading(false)
    })

    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setUser(buildUser(sess?.user ?? null, sess))
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [buildUser])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const list = Array.isArray(roles) ? roles : [roles]
    return list.includes(user.role)
  }, [user])

  return { user, session, loading, signIn, signOut, hasRole }
}
