import { useEffect, useState, type FormEvent } from 'react'
import { getApiErrorMessage } from '../api/apiError'
import PropertyCard from '../features/property/PropertyCard'
import { searchProperties } from '../features/property/property.service'
import type {
  ListingType,
  PageResponse,
  Property,
  PropertySearchParams,
  PropertyType,
} from '../features/property/property.types'

interface FilterForm {
  city: string
  locality: string
  propertyType: '' | PropertyType
  listingType: '' | ListingType
  minPrice: string
  maxPrice: string
  bedrooms: string
}

const emptyFilters: FilterForm = {
  city: '',
  locality: '',
  propertyType: '',
  listingType: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
}

function HomePage() {
  const [filters, setFilters] = useState<FilterForm>(emptyFilters)
  const [activeFilters, setActiveFilters] =
    useState<PropertySearchParams>({})
  const [result, setResult] = useState<PageResponse<Property> | null>(null)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadProperties = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await searchProperties({
          ...activeFilters,
          page,
          size: 9,
        })

        if (!cancelled) {
          setResult(response)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load properties right now.',
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
  }, [activeFilters, page])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params: PropertySearchParams = {}

    if (filters.city.trim()) {
      params.city = filters.city.trim()
    }

    if (filters.locality.trim()) {
      params.locality = filters.locality.trim()
    }

    if (filters.propertyType) {
      params.propertyType = filters.propertyType
    }

    if (filters.listingType) {
      params.listingType = filters.listingType
    }

    if (filters.minPrice) {
      params.minPrice = Number(filters.minPrice)
    }

    if (filters.maxPrice) {
      params.maxPrice = Number(filters.maxPrice)
    }

    if (filters.bedrooms) {
      params.bedrooms = Number(filters.bedrooms)
    }

    setPage(0)
    setActiveFilters(params)
  }

  const handleClear = () => {
    setFilters(emptyFilters)
    setPage(0)
    setActiveFilters({})
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div>
            <p className="eyebrow">REAL ESTATE MARKETPLACE</p>
            <h1>Discover verified properties with EstateFlow.</h1>
            <p className="hero-copy">
              Search homes and commercial properties by location, price and
              property type.
            </p>
          </div>
        </div>
      </section>

      <section className="section property-search-section">
        <div className="container">
          <form className="property-filters" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(event) =>
                setFilters({ ...filters, city: event.target.value })
              }
            />

            <input
              type="text"
              placeholder="Locality"
              value={filters.locality}
              onChange={(event) =>
                setFilters({ ...filters, locality: event.target.value })
              }
            />

            <select
              value={filters.propertyType}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  propertyType: event.target.value as '' | PropertyType,
                })
              }
            >
              <option value="">All property types</option>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="VILLA">Villa</option>
              <option value="PLOT">Plot</option>
              <option value="OFFICE">Office</option>
              <option value="SHOP">Shop</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={filters.listingType}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  listingType: event.target.value as '' | ListingType,
                })
              }
            >
              <option value="">Sale &amp; Rent</option>
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(event) =>
                setFilters({ ...filters, minPrice: event.target.value })
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(event) =>
                setFilters({ ...filters, maxPrice: event.target.value })
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Bedrooms"
              value={filters.bedrooms}
              onChange={(event) =>
                setFilters({ ...filters, bedrooms: event.target.value })
              }
            />

            <div className="property-filter-actions">
              <button className="button button-primary" type="submit">
                Search
              </button>

              <button
                className="button button-secondary"
                type="button"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading property-results-heading">
            <div>
              <p className="eyebrow">PROPERTY DISCOVERY</p>
              <h2>Available Properties</h2>
            </div>

            {result && !isLoading && (
              <p>
                {result.totalElements}{' '}
                {result.totalElements === 1 ? 'property' : 'properties'} found
              </p>
            )}
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          {isLoading && <p>Loading properties...</p>}

          {!isLoading && !error && result?.content.length === 0 && (
            <div className="empty-state">
              <h3>No properties found</h3>
              <p>Try changing or clearing some of your search filters.</p>
            </div>
          )}

          {!isLoading && !error && result && result.content.length > 0 && (
            <>
              <div className="property-grid">
                {result.content.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              <div className="pagination">
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={result.first}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {result.page + 1} of {result.totalPages}
                </span>

                <button
                  className="button button-secondary"
                  type="button"
                  disabled={result.last}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}

export default HomePage