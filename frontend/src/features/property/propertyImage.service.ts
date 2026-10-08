
import httpClient from '../../api/httpClient'

export interface PropertyImage {
  id: number
  propertyId: number
  imageUrl: string
  displayOrder: number
  primary: boolean
  createdAt: string
}

export async function getManagedPropertyImages(
  propertyId: number,
): Promise<PropertyImage[]> {
  const response = await httpClient.get<PropertyImage[]>(
    `/api/v1/properties/${propertyId}/images/manage`,
  )
  return response.data
}

export async function uploadPropertyImage(
  propertyId: number,
  file: File,
): Promise<PropertyImage> {
  const data = new FormData()
  data.append('file', file)

  const response = await httpClient.post<PropertyImage>(
    `/api/v1/properties/${propertyId}/images/upload`,
    data,
    {
      headers: { 'Content-Type': undefined },
    },
  )

  return response.data
}

export async function deletePropertyImage(
  propertyId: number,
  imageId: number,
): Promise<void> {
  await httpClient.delete(
    `/api/v1/properties/${propertyId}/images/${imageId}`,
  )
}

export async function setPrimaryPropertyImage(
  propertyId: number,
  imageId: number,
): Promise<PropertyImage> {
  const response = await httpClient.patch<PropertyImage>(
    `/api/v1/properties/${propertyId}/images/${imageId}/primary`,
  )

  return response.data
}

export function propertyImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url

  // Vite's proxy forwards /api requests to the Spring Boot backend.
  return url.startsWith('/') ? url : `/${url}`
}
