import httpClient from '../../api/httpClient'
import type { ShortlistItem } from './shortlist.types'

export async function addToShortlist(
  propertyId: number,
): Promise<ShortlistItem> {
  const response = await httpClient.post<ShortlistItem>(
    `/api/v1/shortlists/${propertyId}`,
  )

  return response.data
}

export async function getMyShortlist(): Promise<ShortlistItem[]> {
  const response = await httpClient.get<ShortlistItem[]>(
    '/api/v1/shortlists/me',
  )

  return response.data
}

export async function removeFromShortlist(
  propertyId: number,
): Promise<void> {
  await httpClient.delete(`/api/v1/shortlists/${propertyId}`)
}