import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const RoleRoute = ({ children, roles }) => {
  const { usuario, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // Verificar si el rol del usuario está en los roles permitidos
  if (!roles.includes(usuario.rol)) {
    return <Navigate to="/acceso-denegado" replace />
  }

  return children
}

export default RoleRoute