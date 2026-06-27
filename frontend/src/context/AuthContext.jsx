import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth.service.js'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Al cargar la app, restaurar sesión si existe
  useEffect(() => {
    try {
      const tokenGuardado = localStorage.getItem('ferrestock_token')
      const usuarioGuardado = localStorage.getItem('ferrestock_usuario')

      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado)
        setUsuario(JSON.parse(usuarioGuardado))
      }
    } catch (error) {
      // Si hay error al parsear, limpiar localStorage
      localStorage.removeItem('ferrestock_token')
      localStorage.removeItem('ferrestock_usuario')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    // authService.login devuelve la respuesta de Axios
    // Axios pone la respuesta del backend en .data
    // Nuestro backend responde: { success, message, data: { token, usuario } }
    // Por eso accedemos a: respuesta.data.data
    const respuesta = await authService.login(email, password)
    const { token: nuevoToken, usuario: nuevoUsuario } = respuesta.data.data

    localStorage.setItem('ferrestock_token', nuevoToken)
    localStorage.setItem('ferrestock_usuario', JSON.stringify(nuevoUsuario))

    setToken(nuevoToken)
    setUsuario(nuevoUsuario)

    return nuevoUsuario
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Aunque falle el backend, limpiamos el cliente igual
    } finally {
      localStorage.removeItem('ferrestock_token')
      localStorage.removeItem('ferrestock_usuario')
      setToken(null)
      setUsuario(null)
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}