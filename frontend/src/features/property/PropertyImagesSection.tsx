
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

import { getApiErrorMessage } from '../../api/apiError'
import {
  deletePropertyImage,
  getManagedPropertyImages,
  propertyImageUrl,
  setPrimaryPropertyImage,
  uploadPropertyImage,
} from './propertyImage.service'
import type { PropertyImage } from './propertyImage.service'

interface Props {
  propertyId: number
}

interface SelectedPreview {
  id: string
  file: File
  url: string
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export default function PropertyImagesSection({ propertyId }: Props) {
  const [images, setImages] = useState<PropertyImage[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadImages() {
      try {
        const result = await getManagedPropertyImages(propertyId)

        if (!cancelled) {
          setImages(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(err, 'Unable to load images.'),
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadImages()

    return () => {
      cancelled = true
    }
  }, [propertyId])

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    event.target.value = ''
    setError('')
    setMessage('')

    const invalid = files.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) ||
        file.size > MAX_IMAGE_SIZE ||
        file.size === 0,
    )

    if (invalid) {
      setError(
        'Select JPEG, PNG or WebP images, maximum 5 MB each.',
      )
      return
    }

    setSelectedFiles(files)
  }

  async function refreshImages() {
    const updated = await getManagedPropertyImages(propertyId)
    setImages(updated)
  }

  async function handleUpload() {
    if (busy || selectedFiles.length === 0) return

    setBusy(true)
    setError('')
    setMessage('')

    let uploaded = 0

    try {
      for (const file of selectedFiles) {
        await uploadPropertyImage(propertyId, file)
        uploaded += 1
      }

      setSelectedFiles([])
      setMessage(`${uploaded} image(s) uploaded successfully.`)
    } catch (err) {
      setError(
        `${uploaded} image(s) uploaded before an error. ` +
          getApiErrorMessage(err, 'Upload failed.'),
      )

      setSelectedFiles((current) => current.slice(uploaded))
    } finally {
      try {
        await refreshImages()
      } catch {
        setError('Could not refresh the image gallery.')
      }

      setBusy(false)
    }
  }

  async function handleDelete(imageId: number) {
    if (busy || !window.confirm('Delete this property image?')) {
      return
    }

    setBusy(true)
    setError('')
    setMessage('')

    try {
      await deletePropertyImage(propertyId, imageId)
      await refreshImages()
      setMessage('Image deleted successfully.')
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Unable to delete image.'),
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleSetPrimary(imageId: number) {
    if (busy) return

    setBusy(true)
    setError('')
    setMessage('')

    try {
      await setPrimaryPropertyImage(propertyId, imageId)
      await refreshImages()
      setMessage('Primary photo updated successfully.')
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Unable to update primary photo.',
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="property-images-section">
      <h2>Property Photos</h2>

      <p>
        Upload JPEG, PNG or WebP images (maximum 5 MB each).
        The first uploaded image becomes primary if none exists.
      </p>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      <h3>Uploaded Photos</h3>

      {loading ? (
        <p>Loading photos...</p>
      ) : images.length === 0 ? (
        <p>No photos uploaded yet.</p>
      ) : (
        <div className="property-images-grid">
          {images.map((image) => (
            <div
              className="property-image-item"
              key={image.id}
            >
              <img
                src={propertyImageUrl(image.imageUrl)}
                alt={`Property photo ${image.id}`}
                loading="lazy"
              />

              <div>
                {image.primary ? (
                  <strong>Primary photo</strong>
                ) : (
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={busy}
                    onClick={() =>
                      void handleSetPrimary(image.id)
                    }
                  >
                    Set as Primary
                  </button>
                )}

                <button
                  type="button"
                  className="button button-secondary"
                  disabled={busy}
                  onClick={() =>
                    void handleDelete(image.id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>Add More Photos</h3>

      <label className="property-form-field">
        Select photos

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={handleFiles}
        />
      </label>

      {selectedFiles.length > 0 && (
        <div>
          <p>
            {selectedFiles.length} photo(s) selected:
          </p>

          <div className="property-images-grid">
            {selectedFiles.map((file, index) => (
              <SelectedImagePreview
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                file={file}
              />
            ))}
          </div>

          <button
            type="button"
            className="button button-primary"
            disabled={busy}
            onClick={() => void handleUpload()}
          >
            {busy ? 'Uploading...' : 'Upload Photos'}
          </button>
        </div>
      )}
    </section>
  )
}

function SelectedImagePreview({ file }: { file: File }) {
  const [preview, setPreview] = useState<SelectedPreview | null>(
    null,
  )

  // A regular img can also display a data URL, but blob URLs
  // avoid reading the entire image into React state.
  return (
    <div className="property-image-item">
      <PreviewImage
        file={file}
        preview={preview}
        onPreviewChange={setPreview}
      />

      <p>
        {file.name}
        {' '}
        ({(file.size / 1024 / 1024).toFixed(2)} MB)
      </p>
    </div>
  )
}

function PreviewImage({
  file,
  preview,
  onPreviewChange,
}: {
  file: File
  preview: SelectedPreview | null
  onPreviewChange: (preview: SelectedPreview | null) => void
}) {
  useEffect(() => {
    const url = URL.createObjectURL(file)

    onPreviewChange({
      id: `${file.name}-${file.lastModified}`,
      file,
      url,
    })

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file, onPreviewChange])

  if (!preview || preview.file !== file) {
    return <p>Preparing preview...</p>
  }

  return (
    <img
      src={preview.url}
      alt={`Preview of ${file.name}`}
    />
  )
}
