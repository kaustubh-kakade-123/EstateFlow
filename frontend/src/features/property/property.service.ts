import httpClient from '../../api/httpClient'
import type {
  PageResponse,
  Property,
  PropertyImage,
  PropertySearchParams,
} from './property.types'

export async function searchProperties(
  params: PropertySearchParams,
): Promise<PageResponse<Property>> {
  const response = await httpClient.get<PageResponse<Property>>(
    '/api/v1/properties',
    { params },
  )

  return response.data
}

export async function getProperty(propertyId: number): Promise<Property> {
  const response = await httpClient.get<Property>(
    `/api/v1/properties/${propertyId}`,
  )

  return response.data
}

export async function getPropertyImages(
  propertyId: number,
): Promise<PropertyImage[]> {
  const response = await httpClient.get<PropertyImage[]>(
    `/api/v1/properties/${propertyId}/images`,
  )

  return response.data
}