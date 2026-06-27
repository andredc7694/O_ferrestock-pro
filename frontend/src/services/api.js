import axios from 'axios'

// Instancia de Axios con la URL base del backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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