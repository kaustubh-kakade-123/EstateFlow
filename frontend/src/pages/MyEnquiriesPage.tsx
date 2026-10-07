import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import { getMyEnquiries } from '../features/buyer/enquiry.service'
import type { Enquiry } from '../features/buyer/enquiry.types'

function formatEnquiryStatus(status: Enquiry['status']) {
  switch (status) {
    case 'NEW':
      return 'New'
    case 'PROCESSED':
      return 'Processed'
    case 'CLOSED':
      return 'Closed'
    default:
      return status
  }
}

function formatEnquirySource(source: Enquiry['source']) {
  switch (source) {
    case 'PROPERTY_PAGE':
      return 'Property Page'
    case 'SEARCH':
      return 'Search'
    case 'OTHER':
      return 'Other'
    default:
      return source
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

function MyEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadEnquiries = async () => {
      try {
        const response = await getMyEnquiries()

        if (!cancelled) {
          setEnquiries(response.content)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load your enquiries.',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadEnquiries()

    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="container page-section">
        <p>Loading your enquiries...</p>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <div className="page-header">
        <div>
          <h1>My Enquiries</h1>
          <p>
            Track the enquiries you have sent for properties.
          </p>
        </div>

        <Link className="button button-secondary" to="/">
          Browse Properties
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!error && enquiries.length === 0 && (
        <div className="empty-state">
          <h2>No enquiries yet</h2>
          <p>
            When you enquire about a property, it will appear here.
          </p>

          <Link className="button button-primary" to="/">
            Find Properties
          </Link>
        </div>
      )}

      {enquiries.length > 0 && (
        <div className="enquiry-list">
          {enquiries.map((enquiry) => (
            <article className="enquiry-card" key={enquiry.enquiryId}>
              <div className="enquiry-card-header">
                <div>
                  <span className="enquiry-label">
                    Enquiry #{enquiry.enquiryId}
                  </span>

                  <h2>Property #{enquiry.propertyId}</h2>
                </div>

                <span
                  className={`enquiry-status enquiry-status-${enquiry.status.toLowerCase()}`}
                >
                  {formatEnquiryStatus(enquiry.status)}
                </span>
              </div>

              <p className="enquiry-message">
                {enquiry.message}
              </p>

              <div className="enquiry-meta">
                <span>
                  <strong>Source:</strong>{' '}
                  {formatEnquirySource(enquiry.source)}
                </span>

                <span>
                  <strong>Sent:</strong>{' '}
                  {formatDate(enquiry.createdAt)}
                </span>
              </div>

              <Link
                className="button button-secondary"
                to={`/properties/${enquiry.propertyId}`}
              >
                View Property
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyEnquiriesPage