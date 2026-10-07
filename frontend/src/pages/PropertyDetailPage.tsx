import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import {
  getProperty,
  getPropertyImages,
} from '../features/property/property.service'
import type {
  Property,
  PropertyImage,
} from '../features/property/property.types'
import {
  formatPrice,
  formatPropertyType,
} from '../utils/propertyFormat'

function PropertyDetailPage() {
  const { propertyId } = useParams()

const parsedPropertyId = Number(propertyId)
const isValidPropertyId =
  Boolean(propertyId) &&
  Number.isInteger(parsedPropertyId) &&
  parsedPropertyId > 0

const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

 useEffect(() => {
  if (!isValidPropertyId) {
    return
  }

  let cancelled = false

    const loadProperty = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [propertyResponse, imageResponse] = await Promise.all([
          getProperty(parsedPropertyId),
getPropertyImages(parsedPropertyId),
        ])

        if (!cancelled) {
          setProperty(propertyResponse)
          setImages(
            [...imageResponse].sort(
              (a, b) => a.displayOrder - b.displayOrder,
            ),
          )
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load this property.',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadProperty()

    return () => {
      cancelled = true
    }
  }, [isValidPropertyId, parsedPropertyId])

  if (!isValidPropertyId) {
  return (
    <section className="section">
      <div className="container">
        <div className="alert alert-error" role="alert">
          Invalid property.
        </div>

        <Link className="button button-secondary" to="/">
          Back to Properties
        </Link>
      </div>
    </section>
  )
}

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <p>Loading property...</p>
        </div>
      </section>
    )
  }

  if (error || !property) {
    return (
      <section className="section">
        <div className="container">
          <div className="alert alert-error" role="alert">
            {error || 'Property not found.'}
          </div>

          <Link className="button button-secondary" to="/">
            Back to Properties
          </Link>
        </div>
      </section>
    )
  }

  const primaryImage =
    images.find((image) => image.primary) ?? images[0]

  return (
    <section className="section">
      <div className="container property-detail">
        <Link className="back-link" to="/">
          ← Back to properties
        </Link>

        <div className="property-detail-header">
          <div>
            <div className="property-detail-badges">
              <span className="listing-badge">
                {property.listingType === 'SALE'
                  ? 'For Sale'
                  : 'For Rent'}
              </span>

              {property.verified && (
                <span className="verified-badge">Verified</span>
              )}
            </div>

            <h1>{property.title}</h1>

            <p className="property-location">
              {property.locality}, {property.city}, {property.state}
            </p>
          </div>

          <strong className="property-detail-price">
            {formatPrice(property.price, property.listingType)}
          </strong>
        </div>

        {primaryImage ? (
          <div className="property-primary-image">
            <img
              src={primaryImage.imageUrl}
              alt={property.title}
            />
          </div>
        ) : (
          <div className="property-detail-placeholder">
            <span>{formatPropertyType(property.propertyType)}</span>
            <p>No property images available</p>
          </div>
        )}

        {images.length > 1 && (
          <div className="property-gallery">
            {images.map((image) => (
              <img
                key={image.id}
                src={image.imageUrl}
                alt={`${property.title} property`}
                loading="lazy"
              />
            ))}
          </div>
        )}

        <div className="property-detail-grid">
          <article className="property-detail-main">
            <div className="property-detail-facts">
              <div>
                <span>Property Type</span>
                <strong>
                  {formatPropertyType(property.propertyType)}
                </strong>
              </div>

              <div>
                <span>Area</span>
                <strong>{property.areaSqft} sq ft</strong>
              </div>

              {property.bedrooms !== null && (
                <div>
                  <span>Bedrooms</span>
                  <strong>{property.bedrooms}</strong>
                </div>
              )}

              {property.bathrooms !== null && (
                <div>
                  <span>Bathrooms</span>
                  <strong>{property.bathrooms}</strong>
                </div>
              )}

              {property.parkingSpaces !== null && (
                <div>
                  <span>Parking</span>
                  <strong>{property.parkingSpaces}</strong>
                </div>
              )}
            </div>

            <div className="property-description">
              <h2>About this property</h2>

              <p>
                {property.description ||
                  'No description has been provided for this property.'}
              </p>
            </div>
          </article>

          <aside className="property-location-card">
            <h2>Location</h2>

            {property.addressLine && <p>{property.addressLine}</p>}

            <p>
              {property.locality}
              <br />
              {property.city}, {property.state}
              {property.postalCode && (
                <>
                  <br />
                  {property.postalCode}
                </>
              )}
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default PropertyDetailPage