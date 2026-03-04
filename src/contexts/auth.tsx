import { useCallback, useSyncExternalStore, type ReactNode } from 'react'
import {
  getToken,
  setToken as persistToken,
  clearToken
} from '@/lib/auth-storage'
import { AuthContext } from './use-auth'

const authStore = {
  listeners: new Set<() => void>(),
  getSnapshot: () => getToken(),
  subscribe(listener: () => void) {
    authStore.listeners.add(listener)
    return () => authStore.listeners.delete(listener)
  },
  emit() {
    authStore.listeners.forEach(l => l())
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const token = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot)

  const login = useCallback((newToken: string) => {
    persistToken(newToken)
    authStore.emit()
  }, [])

  const logout = useCallback(() => {
    clearToken()
    authStore.emit()
  }, [])

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    isInitialized: true
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
