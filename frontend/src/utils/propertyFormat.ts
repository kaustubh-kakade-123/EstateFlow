import type {
  ListingType,
  PropertyType,
} from '../features/property/property.types'

export function formatPrice(
  price: number,
  listingType: ListingType,
): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

  return listingType === 'RENT' ? `${formatted}/month` : formatted
}

export function formatPropertyType(type: PropertyType): string {
  return type
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}