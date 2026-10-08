export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'PLOT'
  | 'OFFICE'
  | 'SHOP'
  | 'OTHER'

export type ListingType = 'SALE' | 'RENT'

export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED'

export interface Property {
  id: number
  ownerUserId: number
  title: string
  description: string | null
  propertyType: PropertyType
  listingType: ListingType
  price: number
  areaSqft: number
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
  status: PropertyStatus
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface PropertyImage {
  id: number
  propertyId: number
  imageUrl: string
  displayOrder: number
  primary: boolean
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface PropertySearchParams {
  city?: string
  locality?: string
  propertyType?: PropertyType
  listingType?: ListingType
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  page?: number
  size?: number
}