
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import {
  createProperty,
  getMyProperties,
  updateProperty,
} from '../features/property/propertyManagement.service'
import type { PropertyFormData } from '../features/property/propertyManagement.service'
import type {
  ListingType,
  Property,
  PropertyType,
} from '../features/property/property.types'
import PropertyImagesSection from '../features/property/PropertyImagesSection'

type FormValues = {
  title: string
  description: string
  propertyType: PropertyType
  listingType: ListingType
  price: string
  areaSqft: string
  bedrooms: string
  bathrooms: string
  parkingSpaces: string
  addressLine: string
  locality: string
  city: string
  state: string
  postalCode: string
  latitude: string
  longitude: string
}

const initialValues: FormValues = {
  title: '',
  description: '',
  propertyType: 'APARTMENT',
  listingType: 'SALE',
  price: '',
  areaSqft: '',
  bedrooms: '',
  bathrooms: '',
  parkingSpaces: '',
  addressLine: '',
  locality: '',
  city: '',
  state: '',
  postalCode: '',
  latitude: '',
  longitude: '',
}

const propertyTypes: PropertyType[] = [
  'APARTMENT',
  'HOUSE',
  'VILLA',
  'PLOT',
  'OFFICE',
  'SHOP',
  'OTHER',
]

function toFormValues(property: Property): FormValues {
  return {
    title: property.title,
    description: property.description ?? '',
    propertyType: property.propertyType,
    listingType: property.listingType,
    price: String(property.price),
    areaSqft: property.areaSqft == null ? '' : String(property.areaSqft),
    bedrooms: property.bedrooms == null ? '' : String(property.bedrooms),
    bathrooms: property.bathrooms == null ? '' : String(property.bathrooms),
    parkingSpaces:
      property.parkingSpaces == null ? '' : String(property.parkingSpaces),
    addressLine: property.addressLine ?? '',
    locality: property.locality,
    city: property.city,
    state: property.state,
    postalCode: property.postalCode ?? '',
    latitude: property.latitude == null ? '' : String(property.latitude),
    longitude: property.longitude == null ? '' : String(property.longitude),
  }
}

function optionalNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value)
}

function optionalText(value: string): string | null {
  return value.trim() || null
}

function toRequest(values: FormValues): PropertyFormData {
  return {
    title: values.title.trim(),
    description: optionalText(values.description),
    propertyType: values.propertyType,
    listingType: values.listingType,
    price: Number(values.price),
    areaSqft: optionalNumber(values.areaSqft),
    bedrooms: optionalNumber(values.bedrooms),
    bathrooms: optionalNumber(values.bathrooms),
    parkingSpaces: optionalNumber(values.parkingSpaces),
    addressLine: optionalText(values.addressLine),
    locality: values.locality.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: optionalText(values.postalCode),
    latitude: optionalNumber(values.latitude),
    longitude: optionalNumber(values.longitude),
  }
}

function PropertyFormPage() {
  const { propertyId } = useParams()
  const navigate = useNavigate()

  const isEditing = propertyId !== undefined
  const numericId = Number(propertyId)
  const isValidId =
    !isEditing || (Number.isSafeInteger(numericId) && numericId > 0)

  const [values, setValues] = useState<FormValues>(initialValues)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing || !isValidId) return

    let cancelled = false

    const loadProperty = async () => {
      try {
        const properties = await getMyProperties()
        const property = properties.find((item) => item.id === numericId)

        if (!property) {
          throw new Error('Property not found in your listings.')
        }

        if (
          property.status !== 'DRAFT' &&
          property.status !== 'REJECTED'
        ) {
          throw new Error('Only draft or rejected properties can be edited.')
        }

        if (!cancelled) {
          setValues(toFormValues(property))
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error &&
              !('response' in requestError)
              ? requestError.message
              : getApiErrorMessage(
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
  }, [isEditing, isValidId, numericId])

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving || !isValidId) return

    setIsSaving(true)
    setError('')

    try {
      const request = toRequest(values)

            if (isEditing) {
        await updateProperty(numericId, request)
        navigate('/my-properties', { replace: true })
      } else {
        const created = await createProperty(request)
        navigate(`/my-properties/${created.id}/edit`, { replace: true })
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          isEditing
            ? 'Unable to update the property.'
            : 'Unable to create the property.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (!isValidId) {
    return (
      <div className="container page-section">
        <div className="alert alert-error">Invalid property ID.</div>
        <Link to="/my-properties">Back to My Properties</Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container page-section">
        <p>Loading property details...</p>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <div className="page-header">
        <div>
          <h1>{isEditing ? 'Edit Property' : 'Add Property'}</h1>
          <p>
            {isEditing
              ? 'Update your draft or rejected listing.'
              : 'Create a draft listing before submitting it for approval.'}
          </p>
        </div>

        <Link className="button button-secondary" to="/my-properties">
          Back to My Properties
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {isEditing && error && !values.title ? null : (
        <form className="property-form" onSubmit={(event) => void handleSubmit(event)}>
          <h2>Basic Information</h2>

          <div className="property-form-grid">
            <label className="property-form-field property-form-full">
              Property Title *
              <input
                name="title"
                value={values.title}
                onChange={handleChange}
                required
                maxLength={180}
                placeholder="e.g. Spacious 2 BHK Apartment in Wakad"
              />
            </label>

            <label className="property-form-field">
              Property Type *
              <select
                name="propertyType"
                value={values.propertyType}
                onChange={handleChange}
                required
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="property-form-field">
              Listing Type *
              <select
                name="listingType"
                value={values.listingType}
                onChange={handleChange}
                required
              >
                <option value="SALE">For Sale</option>
                <option value="RENT">For Rent</option>
              </select>
            </label>

            <label className="property-form-field">
              Price (₹) *
              <input
                type="number"
                name="price"
                value={values.price}
                onChange={handleChange}
                required
                min="0"
                max="9999999999999.99"
                step="0.01"
                placeholder="8750000"
              />
            </label>

            <label className="property-form-field">
              Area (sq. ft.)
              <input
                type="number"
                name="areaSqft"
                value={values.areaSqft}
                onChange={handleChange}
                min="0.01"
                max="99999999.99"
                step="0.01"
                placeholder="1050"
              />
            </label>

            <label className="property-form-field property-form-full">
              Description
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the property and its features..."
              />
            </label>
          </div>

          <h2>Property Features</h2>

          <div className="property-form-grid">
            {(['bedrooms', 'bathrooms', 'parkingSpaces'] as const).map(
              (field) => (
                <label className="property-form-field" key={field}>
                  {field === 'parkingSpaces'
                    ? 'Parking Spaces'
                    : field === 'bedrooms'
                      ? 'Bedrooms'
                      : 'Bathrooms'}
                  <input
                    type="number"
                    name={field}
                    value={values[field]}
                    onChange={handleChange}
                    min="0"
                    max="255"
                    step="1"
                    placeholder="0"
                  />
                </label>
              ),
            )}
          </div>

          <h2>Location</h2>

          <div className="property-form-grid">
            <label className="property-form-field property-form-full">
              Address Line
              <input
                name="addressLine"
                value={values.addressLine}
                onChange={handleChange}
                maxLength={255}
                placeholder="Building, street, landmark"
              />
            </label>

            <label className="property-form-field">
              Locality *
              <input
                name="locality"
                value={values.locality}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="Wakad"
              />
            </label>

            <label className="property-form-field">
              City *
              <input
                name="city"
                value={values.city}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="Pune"
              />
            </label>

            <label className="property-form-field">
              State *
              <input
                name="state"
                value={values.state}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="Maharashtra"
              />
            </label>

            <label className="property-form-field">
              Postal Code
              <input
                name="postalCode"
                value={values.postalCode}
                onChange={handleChange}
                maxLength={20}
                placeholder="411057"
              />
            </label>

            <label className="property-form-field">
              Latitude (optional)
              <input
                type="number"
                name="latitude"
                value={values.latitude}
                onChange={handleChange}
                min="-90"
                max="90"
                step="any"
                placeholder="18.598"
              />
            </label>

            <label className="property-form-field">
              Longitude (optional)
              <input
                type="number"
                name="longitude"
                value={values.longitude}
                onChange={handleChange}
                min="-180"
                max="180"
                step="any"
                placeholder="73.763"
              />
            </label>
          </div>

          <div className="property-form-actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Draft'}
            </button>

            <Link className="button button-secondary" to="/my-properties">
              Cancel
            </Link>
          </div>
        </form>
       
      )}
       {isEditing && isValidId && values.title && (
        <PropertyImagesSection propertyId={numericId} />
      )}
    </div>
  )
}

export default PropertyFormPage
