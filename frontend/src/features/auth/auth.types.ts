export type Role = 'BUYER' | 'OWNER' | 'AGENT' | 'BUILDER' | 'ADMIN'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  userId: number
  fullName: string
  email: string
  roles: Role[]
}

export interface RegisterRequest {
  fullName: string
  email: string
  phone: string | null
  password: string
  role: 'BUYER' | 'OWNER' | 'BUILDER'
}

export interface RegisterResponse {
  id: number
  fullName: string
  email: string
  phone: string | null
  roles: Role[]
}

export interface CurrentUser {
  id: number
  fullName: string
  email: string
  phone: string | null
  roles: Role[]
}