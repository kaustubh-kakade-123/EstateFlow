import axios from 'axios'

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const httpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default httpClient