import httpClient from '../../api/httpClient'
import type {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from './auth.types'

export async function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await httpClient.post<LoginResponse>(
    '/api/v1/auth/login',
    request,
  )

  return response.data
}

export async function register(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await httpClient.post<RegisterResponse>(
    '/api/v1/auth/register',
    request,
  )

  return response.data
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await httpClient.get<CurrentUser>('/api/v1/auth/me')

  return response.data
}