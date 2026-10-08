import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../api/apiError'
import {
  approveProperty,
  getPendingProperties,
  rejectProperty,
} from '../features/admin/adminProperty.service'
import type { Property } from '../features/property/property.types'
import {
  formatPrice,
  formatPropertyType,
} from '../utils/propertyFormat'

function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadProperties = async () => {
      try {
        const response = await getPendingProperties()

        if (!cancelled) {
          setProperties(response)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load pending properties.',
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

  const handleModeration = async (
    propertyId: number,
    action: 'approve' | 'reject',
  ) => {
    const confirmed = window.confirm(
      action === 'approve'
        ? 'Approve and publish this property?'
        : 'Reject this property listing?',
    )

    if (!confirmed) return

    setProcessingId(propertyId)
    setError('')
    setSuccess('')

    try {
      if (action === 'approve') {
        await approveProperty(propertyId)
      } else {
        await rejectProperty(propertyId)
      }

      setProperties((current) =>
        current.filter((property) => property.id !== propertyId),
      )

      setSuccess(
        action === 'approve'
          ? 'Property approved and published successfully.'
          : 'Property rejected successfully.',
      )
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          `Unable to ${action} this property.`,
        ),
      )
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container page-section">
        <p>Loading pending properties...</p>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <div className="page-header">
        <div>
          <h1>Property Moderation</h1>
          <p>
            Review owner and builder listings before publication.
          </p>
        </div>

        <span className="admin-pending-count">
          {properties.length} Pending
        </span>
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
          <h2>All caught up!</h2>
          <p>There are no properties awaiting approval.</p>
        </div>
      ) : (
        <div className="admin-property-list">
          {properties.map((property) => (
            <article className="admin-property-card" key={property.id}>
              <div className="admin-property-card-header">
                <div>
                  <span className="enquiry-label">
                    Property #{property.id}
                  </span>

                  <h2>{property.title}</h2>

                  <p>
                    {property.locality}, {property.city},{' '}
                    {property.state}
                  </p>
                </div>

                <span className="property-status-badge">
                  Pending Approval
                </span>
              </div>

              <div className="admin-property-details">
                <span>
                  <strong>Type:</strong>{' '}
                  {formatPropertyType(property.propertyType)}
                </span>

                <span>
                  <strong>Price:</strong>{' '}
                  {formatPrice(property.price, property.listingType)}
                </span>

                <span>
                  <strong>Listing:</strong>{' '}
                  {property.listingType === 'SALE'
                    ? 'For Sale'
                    : 'For Rent'}
                </span>

                <span>
                  <strong>Owner ID:</strong> {property.ownerUserId}
                </span>
              </div>

              {property.description && (
                <p className="admin-property-description">
                  {property.description}
                </p>
              )}

              <div className="admin-property-actions">
                <button
                  className="button button-primary"
                  type="button"
                  disabled={processingId !== null}
                  onClick={() =>
                    void handleModeration(property.id, 'approve')
                  }
                >
                  {processingId === property.id
                    ? 'Processing...'
                    : 'Approve & Publish'}
                </button>

                <button
                  className="button button-danger"
                  type="button"
                  disabled={processingId !== null}
                  onClick={() =>
                    void handleModeration(property.id, 'reject')
                  }
                >
                  Reject Property
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminPropertiesPage