import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import {
  getMyProperties,
  submitProperty,
} from '../features/property/propertyManagement.service'
import type { Property } from '../features/property/property.types'
import {
  formatPrice,
  formatPropertyType,
} from '../utils/propertyFormat'

function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadProperties = async () => {
      try {
        const response = await getMyProperties()

        if (!cancelled) {
          setProperties(response)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load your properties.',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadProperties()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (propertyId: number) => {
    setSubmittingId(propertyId)
    setError('')
    setSuccess('')

    try {
      const updatedProperty = await submitProperty(propertyId)

      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId ? updatedProperty : property,
        ),
      )

      setSuccess('Property submitted for admin approval.')
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to submit this property.',
        ),
      )
    } finally {
      setSubmittingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container page-section">
        <p>Loading your properties...</p>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <div className="page-header">
        <div>
          <h1>My Properties</h1>
          <p>Create, manage, and submit your property listings.</p>
        </div>

        <Link className="button button-primary" to="/my-properties/new">
          Add Property
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="empty-state">
          <h2>No properties added yet</h2>
          <p>Create your first property listing to get started.</p>

          <Link
            className="button button-primary"
            to="/my-properties/new"
          >
            Create Property
          </Link>
        </div>
      ) : (
        <div className="owner-property-list">
          {properties.map((property) => {
            const canEdit =
              property.status === 'DRAFT' ||
              property.status === 'REJECTED'

            return (
              <article className="owner-property-card" key={property.id}>
                <div className="owner-property-card-header">
                  <div>
                    <span className="enquiry-label">
                      Property #{property.id}
                    </span>

                    <h2>{property.title}</h2>

                    <p>
                      {property.locality}, {property.city}
                    </p>
                  </div>

                  <span className="property-status-badge">
                    {property.status.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="owner-property-details">
                  <span>
                    {formatPropertyType(property.propertyType)}
                  </span>

                  <span>
                    {formatPrice(property.price, property.listingType)}
                  </span>

                  <span>
                    {property.listingType === 'SALE'
                      ? 'For Sale'
                      : 'For Rent'}
                  </span>
                </div>

                <div className="owner-property-actions">
                  {canEdit && (
                    <>
                      <Link
                        className="button button-secondary"
                        to={`/my-properties/${property.id}/edit`}
                      >
                        Edit
                      </Link>

                      <button
                        className="button button-primary"
                        type="button"
                        disabled={submittingId === property.id}
                        onClick={() => void handleSubmit(property.id)}
                      >
                        {submittingId === property.id
                          ? 'Submitting...'
                          : 'Submit for Approval'}
                      </button>
                    </>
                  )}

                  {property.status === 'PENDING_APPROVAL' && (
                    <span>Awaiting admin review</span>
                  )}

                  {property.status === 'PUBLISHED' && (
                    <Link
                      className="button button-secondary"
                      to={`/properties/${property.id}`}
                    >
                      View Live Listing
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyPropertiesPage