import httpClient from '../../api/httpClient'
import type { AdminDashboard } from './adminDashboard.types'

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await httpClient.get<AdminDashboard>(
    '/api/v1/admin/dashboard',
  )

  return response.data
}