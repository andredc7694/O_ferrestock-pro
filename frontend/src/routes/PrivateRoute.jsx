import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const PrivateRoute = ({ children }) => {
  const { usuario, loading } = useAuth()

  // Mientras verifica si hay sesión, no redirige todavía
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  // Si no hay usuario, redirige al login
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute