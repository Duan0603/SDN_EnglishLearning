// Axios API client configuration
// Architecture: All REST API calls go through this service layer (never directly in components)
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Required for HttpOnly cookie auth
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    if (token) {
      config.headers['authorization'] = `Bearer ${token}`
    }
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        const userId = user.id || user._id
        if (userId) {
          config.headers['x-client-id'] = userId
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 token refresh (Story 1.2)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // TODO: Add token refresh logic in Story 1.2
    return Promise.reject(error)
  }
)
