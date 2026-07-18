import axios from 'axios'

// Normaliza la baseURL para garantizar que siempre termine en /api,
// sin importar si VITE_API_URL ya lo incluye (local) o no (Vercel)
const rawBaseURL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const baseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL}/api`

// Instancia de Axios con la URL base del backend
const api = axios.create({
  baseURL,
  timeout: 60000, // tolera el cold start del backend en Render (plan free)
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de REQUEST: agrega el token JWT a cada petición automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ferrestock_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de RESPONSE: si el token expiró, redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ferrestock_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api