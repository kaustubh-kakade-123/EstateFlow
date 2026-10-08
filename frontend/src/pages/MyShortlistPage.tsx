import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import {
  getMyShortlist,
  removeFromShortlist,
} from '../features/buyer/shortlist.service'
import type { ShortlistItem } from '../features/buyer/shortlist.types'
import PropertyCard from '../features/property/PropertyCard'

function MyShortlistPage() {
  const [items, setItems] = useState<ShortlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingPropertyId, setRemovingPropertyId] = useState<number | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false

    const loadShortlist = async () => {
      try {
        const response = await getMyShortlist()

        if (!cancelled) {
          setItems(response)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load your shortlist.',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadShortlist()

    return () => {
      cancelled = true
    }
  }, [])

  const handleRemove = async (propertyId: number) => {
    setRemovingPropertyId(propertyId)
    setError('')

    try {
      await removeFromShortlist(propertyId)

      setItems((currentItems) =>
        currentItems.filter(
          (item) => item.property.id !== propertyId,
        ),
      )
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to remove this property from your shortlist.',
        ),
      )
    } finally {
      setRemovingPropertyId(null)
    }
  }

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <p>Loading your shortlist...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Shortlist</h1>
            <p>Properties you have saved for later.</p>
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

        {!error && items.length === 0 && (
          <div className="empty-state">
            <h2>No shortlisted properties yet</h2>

            <p>
              Browse published properties and save the ones that interest you.
            </p>

            <Link className="button button-primary" to="/">
              Browse Properties
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="property-grid">
            {items.map((item) => (
              <div className="shortlist-item" key={item.id}>
                <PropertyCard property={item.property} />

                <button
                  className="button button-danger"
                  type="button"
                  disabled={removingPropertyId === item.property.id}
                  onClick={() => void handleRemove(item.property.id)}
                >
                  {removingPropertyId === item.property.id
                    ? 'Removing...'
                    : 'Remove from Shortlist'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default MyShortlistPage