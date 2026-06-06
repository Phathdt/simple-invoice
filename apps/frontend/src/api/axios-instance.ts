import axios, { type AxiosRequestConfig } from 'axios'

export const AXIOS_INSTANCE = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach JWT token from localStorage
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 by clearing token and redirecting to login
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Orval mutator — called by all generated hooks
export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return AXIOS_INSTANCE(config).then(({ data }) => data as T)
}
