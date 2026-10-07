import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login as loginRequest } from './auth.service'
import { AuthContext } from './AuthContext'
import type { CurrentUser, LoginRequest, Role } from './auth.types'
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from './tokenStorage'

interface AuthProviderProps {
  children: React.ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    removeAccessToken()
    setUser(null)
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      if (!getAccessToken()) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        removeAccessToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    const response = await loginRequest(request)

    setAccessToken(response.accessToken)

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      removeAccessToken()
      throw error
    }
  }, [])

  const hasRole = useCallback(
    (...roles: Role[]) =>
      user?.roles.some((userRole) => roles.includes(userRole)) ?? false,
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      hasRole,
    }),
    [user, isLoading, login, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider