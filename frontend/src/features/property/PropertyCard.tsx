
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  formatPrice,
  formatPropertyType,
} from '../../utils/propertyFormat'

import { getPropertyImages } from './property.service'
import { propertyImageUrl } from './propertyImage.service'
import type { Property } from './property.types'

interface PropertyCardProps {
  property: Property
}

function PropertyCard({ property }: PropertyCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    getPropertyImages(property.id)
      .then((images) => {
        if (cancelled) return

        const primaryImage =
          images.find((image) => image.primary) ??
          images[0]

        setImageUrl(primaryImage?.imageUrl ?? null)
      })
      .catch(() => {
        if (!cancelled) {
          setImageUrl(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [property.id])

  return (
    <article className="property-card">
      <div className="property-card-visual">
        {imageUrl && !imageFailed ? (
          <img
            className="property-card-image"
            src={propertyImageUrl(imageUrl)}
            alt={property.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="property-card-image-placeholder">
            No photo available
          </div>
        )}

        <span className="property-card-type">
          {formatPropertyType(property.propertyType)}
        </span>

        {property.verified && (
          <span className="verified-badge">
            Verified
          </span>
        )}
      </div>

      <div className="property-card-content">
        <div className="property-card-heading">
          <div>
            <p className="property-listing-type">
              {property.listingType === 'SALE'
                ? 'For Sale'
                : 'For Rent'}
            </p>

            <h3>{property.title}</h3>
          </div>

          <strong className="property-price">
            {formatPrice(
              property.price,
              property.listingType,
            )}
          </strong>
        </div>

        <p className="property-location">
          {property.locality}, {property.city}, {property.state}
        </p>

        <div className="property-facts">
          {property.bedrooms !== null && (
            <span>{property.bedrooms} Beds</span>
          )}

          {property.bathrooms !== null && (
            <span>{property.bathrooms} Baths</span>
          )}

          <span>{property.areaSqft} sq ft</span>
        </div>

        <Link
          className="button button-secondary property-card-action"
          to={`/properties/${property.id}`}
        >
          View Details
        </Link>
      </div>
    </article>
  )
}

export default PropertyCard
