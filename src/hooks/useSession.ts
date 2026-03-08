'use client'

import { useState, useEffect } from 'react'
import { Session } from '@/types'

const SESSION_KEY = 'fluxa_crm_session'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) setSession(JSON.parse(stored))
    } catch {}
    setLoading(false)
  }, [])

  const login = (s: Session) => {
    setSession(s)
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch {}
  }

  const logout = () => {
    setSession(null)
    try { sessionStorage.removeItem(SESSION_KEY) } catch {}
  }

  return { session, loading, login, logout }
}
