import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import PrivateRoute from './routes/PrivateRoute.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'

// Dashboard temporal — se reemplaza en Sprint 1
const DashboardTemp = () => {
  const { usuario, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          ✅ Login exitoso
        </h1>
        <p className="text-gray-700 mb-1">
          Bienvenido, <strong>{usuario?.nombre} {usuario?.apellidos}</strong>
        </p>
        <p className="text-gray-500 mb-6">
          Rol: <span className="font-medium text-blue-600">{usuario?.rol}</span>
        </p>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white 
                     px-6 py-2 rounded-lg transition font-medium"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

// Componente raíz con Router y AuthProvider en el orden correcto
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protegida */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardTemp />
              </PrivateRoute>
            }
          />

          {/* Raíz → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Acceso denegado */}
          <Route
            path="/acceso-denegado"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">
                  🚫 Acceso denegado
                </h1>
                <p className="text-gray-500 mt-2">
                  No tienes permiso para ver esta página
                </p>
              </div>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-600">
                  404 — Página no encontrada
                </h1>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App