import { Link } from 'react-router-dom'
import {
  formatPrice,
  formatPropertyType,
} from '../../utils/propertyFormat'
import type { Property } from './property.types'

interface PropertyCardProps {
  property: Property
}

function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="property-card">
      <div className="property-card-visual">
        <span>{formatPropertyType(property.propertyType)}</span>

        {property.verified && (
          <span className="verified-badge">Verified</span>
        )}
      </div>

      <div className="property-card-content">
        <div className="property-card-heading">
          <div>
            <p className="property-listing-type">
              {property.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
            </p>

            <h3>{property.title}</h3>
          </div>

          <strong className="property-price">
            {formatPrice(property.price, property.listingType)}
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