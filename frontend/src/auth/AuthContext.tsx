import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { refreshToken } from '../actions/fetchData'

type State = {
  access?: string
  refresh?: string
  username?: string
  accessExp?: number
  refreshExp?: number
  setAuth: (data: { access: string; refresh: string; username: string }) => void
  clear: () => void
  getValidAccess: () => Promise<string | undefined>
}

const Ctx = createContext<State | null>(null)

function decodeExp(token?: string): number | undefined {
  try {
    if (!token) return undefined
    const [, payload] = token.split('.')
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof json?.exp === 'number' ? json.exp : undefined
  } catch { return undefined }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [access, setAccess] = useState<string | undefined>()
  const [refresh, setRefresh] = useState<string | undefined>()
  const [username, setUsername] = useState<string | undefined>()
  const [accessExp, setAccessExp] = useState<number | undefined>()
  const [refreshExp, setRefreshExp] = useState<number | undefined>()
  const refreshTimer = useRef<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAccess(parsed.access)
        setRefresh(parsed.refresh)
        setUsername(parsed.username)
        setAccessExp(decodeExp(parsed.access))
        setRefreshExp(decodeExp(parsed.refresh))
      } catch {}
    }
  }, [])

  const setAuth = (data: { access: string; refresh: string; username: string }) => {
    setAccess(data.access)
    setRefresh(data.refresh)
    setUsername(data.username)
    const next = { ...data }
    setAccessExp(decodeExp(data.access))
    setRefreshExp(decodeExp(data.refresh))
    localStorage.setItem('auth', JSON.stringify(next))
  }
  const clear = () => {
    setAccess(undefined); setRefresh(undefined); setUsername(undefined); setAccessExp(undefined); setRefreshExp(undefined)
    localStorage.removeItem('auth')
    if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null }
  }

  const getValidAccess = async (): Promise<string | undefined> => {
    if (!access) return undefined
    const now = Math.floor(Date.now() / 1000)
    if (accessExp && accessExp - now > 10) return access
    // try refresh
    if (!refresh) { clear(); return undefined }
    try {
      const data = await refreshToken(refresh)
      const next = { access: data.access, refresh: refresh!, username: username || '' }
      setAccess(data.access)
      setAccessExp(decodeExp(data.access))
      localStorage.setItem('auth', JSON.stringify(next))
      return data.access
    } catch {
      clear()
      return undefined
    }
  }

  // Proactive auto-refresh a few seconds before access token expires
  useEffect(() => {
    const skewSeconds = 20 // refresh 20s antes de expirar
    function schedule() {
      if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null }
      if (!access || !refresh || !accessExp) return
      const now = Math.floor(Date.now() / 1000)
      const inSec = accessExp - now - skewSeconds
      const delay = Math.max(inSec, 0) * 1000
      refreshTimer.current = window.setTimeout(async () => {
        try {
          // si refresh también expira, abortamos
          const now2 = Math.floor(Date.now() / 1000)
          if (!refreshExp || refreshExp <= now2 + 5) { clear(); return }
          const data = await refreshToken(refresh!)
          const next = { access: data.access, refresh: refresh!, username: username || '' }
          setAccess(data.access)
          setAccessExp(decodeExp(data.access))
          localStorage.setItem('auth', JSON.stringify(next))
          schedule() // reprogramar siguiente
        } catch {
          clear()
        }
      }, delay)
    }
    schedule()
    return () => { if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null } }
  }, [access, refresh, accessExp, refreshExp, username])

  // Refresh cuando volvemos a la pestaña si está por expirar
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      const now = Math.floor(Date.now() / 1000)
      if (access && refresh && accessExp && accessExp - now < 15) {
        refreshToken(refresh).then(data => {
          const next = { access: data.access, refresh: refresh!, username: username || '' }
          setAccess(data.access)
          setAccessExp(decodeExp(data.access))
          localStorage.setItem('auth', JSON.stringify(next))
        }).catch(() => clear())
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [access, refresh, accessExp, username])

  return <Ctx.Provider value={{ access, refresh, username, accessExp, refreshExp, setAuth, clear, getValidAccess }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}
