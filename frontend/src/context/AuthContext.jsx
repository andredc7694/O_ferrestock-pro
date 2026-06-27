import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth.service.js'

// Crear el contexto
const AuthContext = createContext(null)

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true) // true mientras verifica sesión

  // Al cargar la app, verificar si hay sesión guardada
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('ferrestock_token')
    const usuarioGuardado = localStorage.getItem('ferrestock_usuario')

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado)
      setUsuario(JSON.parse(usuarioGuardado))
    }

    setLoading(false)
  }, [])

  // Función de login
  const login = async (email, password) => {
    const respuesta = await authService.login(email, password)
    const { token: nuevoToken, usuario: nuevoUsuario } = respuesta.data

    // Guardar en localStorage
    localStorage.setItem('ferrestock_token', nuevoToken)
    localStorage.setItem('ferrestock_usuario', JSON.stringify(nuevoUsuario))

    // Actualizar estado
    setToken(nuevoToken)
    setUsuario(nuevoUsuario)

    return nuevoUsuario
  }

  // Función de logout
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Aunque falle el backend, limpiamos el cliente
    } finally {
      localStorage.removeItem('ferrestock_token')
      localStorage.removeItem('ferrestock_usuario')
      setToken(null)
      setUsuario(null)
    }
  }

  const valor = { usuario, token, loading, login, logout }

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}