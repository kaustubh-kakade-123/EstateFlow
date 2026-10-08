import httpClient from '../../api/httpClient'
import type {
  ListingType,
  Property,
  PropertyType,
} from './property.types'

export interface PropertyFormData {
  title: string
  description: string | null
  propertyType: PropertyType
  listingType: ListingType
  price: number
  areaSqft: number | null
  bedrooms: number | null
  bathrooms: number | null
  parkingSpaces: number | null
  addressLine: string | null
  locality: string
  city: string
  state: string
  postalCode: string | null
  latitude: number | null
  longitude: number | null
}

export async function getMyProperties(): Promise<Property[]> {
  const response = await httpClient.get<Property[]>(
    '/api/v1/properties/me',
  )

  return response.data
}

export async function createProperty(
  data: PropertyFormData,
): Promise<Property> {
  const response = await httpClient.post<Property>(
    '/api/v1/properties',
    data,
  )

  return response.data
}

export async function updateProperty(
  propertyId: number,
  data: PropertyFormData,
): Promise<Property> {
  const response = await httpClient.put<Property>(
    `/api/v1/properties/${propertyId}`,
    data,
  )

  return response.data
}

export async function submitProperty(
  propertyId: number,
): Promise<Property> {
  const response = await httpClient.patch<Property>(
    `/api/v1/properties/${propertyId}/submit`,
  )

  return response.data
}