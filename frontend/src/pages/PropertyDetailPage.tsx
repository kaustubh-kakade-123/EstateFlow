import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import { useAuth } from '../features/auth/useAuth'
import { createEnquiry } from '../features/buyer/enquiry.service'
import { addToShortlist } from '../features/buyer/shortlist.service'
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
  const { user, hasRole } = useAuth()

  const parsedPropertyId = Number(propertyId)
  const isValidPropertyId =
    Boolean(propertyId) &&
    Number.isInteger(parsedPropertyId) &&
    parsedPropertyId > 0

  const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [shortlistLoading, setShortlistLoading] = useState(false)
const [shortlistMessage, setShortlistMessage] = useState('')
const [shortlistError, setShortlistError] = useState('')

const [enquiryMessage, setEnquiryMessage] = useState('')
const [enquiryLoading, setEnquiryLoading] = useState(false)
const [enquirySuccess, setEnquirySuccess] = useState('')
const [enquiryError, setEnquiryError] = useState('')

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

   const handleShortlist = async () => {
    if (!property) {
      return
    }

    setShortlistLoading(true)
    setShortlistMessage('')
    setShortlistError('')

    try {
      await addToShortlist(property.id)

      setShortlistMessage('Property added to your shortlist.')
    } catch (requestError) {
      setShortlistError(
        getApiErrorMessage(
          requestError,
          'Unable to add this property to your shortlist.',
        ),
      )
    } finally {
      setShortlistLoading(false)
    }
  }

  const handleEnquiry = async () => {
    if (!property || !enquiryMessage.trim()) {
      return
    }

    setEnquiryLoading(true)
    setEnquirySuccess('')
    setEnquiryError('')

    try {
      await createEnquiry(property.id, {
        message: enquiryMessage.trim(),
        source: 'PROPERTY_PAGE',
      })

      setEnquiryMessage('')
      setEnquirySuccess('Your enquiry has been sent successfully.')
    } catch (requestError) {
      setEnquiryError(
        getApiErrorMessage(
          requestError,
          'Unable to send your enquiry.',
        ),
      )
    } finally {
      setEnquiryLoading(false)
    }
  }
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

        <div className="property-buyer-actions">
          {!user && (
            <div>
              <h2>Interested in this property?</h2>

              <p>
                Sign in as a buyer to shortlist properties or send an enquiry.
              </p>

              <Link className="button button-primary" to="/login">
                Login to Continue
              </Link>
            </div>
          )}

          {user && hasRole('BUYER') && (
  <div>
    <h2>Interested in this property?</h2>

    <button
      className="button button-secondary"
      type="button"
      disabled={shortlistLoading}
      onClick={handleShortlist}
    >
      {shortlistLoading ? 'Adding...' : 'Add to Shortlist'}
    </button>

    {shortlistMessage && (
      <div className="alert alert-success" role="status">
        {shortlistMessage}
      </div>
    )}

    {shortlistError && (
      <div className="alert alert-error" role="alert">
        {shortlistError}
      </div>
    )}

    <div className="property-enquiry-form">
      <h3>Send an Enquiry</h3>

      <textarea
        value={enquiryMessage}
        onChange={(event) => setEnquiryMessage(event.target.value)}
        placeholder="I'm interested in this property. Please contact me with more details."
        rows={4}
        maxLength={1000}
      />

      <button
        className="button button-primary"
        type="button"
        disabled={enquiryLoading || !enquiryMessage.trim()}
        onClick={() => void handleEnquiry()}
      >
        {enquiryLoading ? 'Sending...' : 'Send Enquiry'}
      </button>

      {enquirySuccess && (
        <div className="alert alert-success" role="status">
          {enquirySuccess}
        </div>
      )}

      {enquiryError && (
        <div className="alert alert-error" role="alert">
          {enquiryError}
        </div>
      )}
    </div>
  </div>
)}

          {user && !hasRole('BUYER') && (
            <p>
              Shortlisting and property enquiries are available to buyer
              accounts.
            </p>
          )}
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