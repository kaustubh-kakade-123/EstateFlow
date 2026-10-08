import axios from 'axios'

interface ApiErrorBody {
  message?: string
  errors?: Record<string, string>
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback
  }

  const data = error.response?.data

  if (data?.message) {
    return data.message
  }

  if (data?.errors) {
    const firstValidationMessage = Object.values(data.errors)[0]

    if (firstValidationMessage) {
      return firstValidationMessage
    }
  }

  return fallback
}