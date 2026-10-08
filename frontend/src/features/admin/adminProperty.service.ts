import httpClient from '../../api/httpClient'
import type { Property } from '../property/property.types'

export async function getPendingProperties(): Promise<Property[]> {
  const response = await httpClient.get<Property[]>(
    '/api/v1/admin/properties/pending',
  )

  return response.data
}

export async function approveProperty(
  propertyId: number,
): Promise<Property> {
  const response = await httpClient.patch<Property>(
    `/api/v1/admin/properties/${propertyId}/approve`,
  )

  return response.data
}

export async function rejectProperty(
  propertyId: number,
): Promise<Property> {
  const response = await httpClient.patch<Property>(
    `/api/v1/admin/properties/${propertyId}/reject`,
  )

  return response.data
}