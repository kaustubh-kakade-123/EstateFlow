import { createContext } from 'react'
import type { CurrentUser, LoginRequest, Role } from './auth.types'

export interface AuthContextValue {
  user: CurrentUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)