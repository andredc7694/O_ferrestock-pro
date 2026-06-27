import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import PrivateRoute from './routes/PrivateRoute.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import ProductosPage from './pages/productos/ProductosPage.jsx'
import ProductoFormPage from './pages/productos/ProductoFormPage.jsx'
import InventarioPage from './pages/inventario/InventarioPage.jsx'
import MovimientoFormPage from './pages/inventario/MovimientoFormPage.jsx'

// Dashboard mejorado con accesos directos
const DashboardTemp = () => {
  const { usuario, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">🔧 FerreStock Pro</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            {usuario?.nombre} —{' '}
            <span className="font-medium text-blue-600">{usuario?.rol}</span>
          </span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white
                       text-sm px-3 py-1.5 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Bienvenido, {usuario?.nombre} 👋
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
          {[
            { href: '/productos', emoji: '📦', label: 'Productos' },
            { href: '/inventario', emoji: '🏭', label: 'Inventario' }
          ].map(item => (
            <a            
            
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl shadow p-6 hover:shadow-md
                         transition text-center border-2 border-transparent
                         hover:border-blue-500"
            >
              <div className="text-3xl mb-2">{item.emoji}</div>
              <p className="font-semibold text-gray-700">{item.label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <PrivateRoute><DashboardTemp /></PrivateRoute>
          } />

          {/* Módulo Productos */}
          <Route path="/productos" element={
            <PrivateRoute><ProductosPage /></PrivateRoute>
          } />
          <Route path="/productos/nuevo" element={
            <PrivateRoute><ProductoFormPage /></PrivateRoute>
          } />
          <Route path="/productos/:id/editar" element={
            <PrivateRoute><ProductoFormPage /></PrivateRoute>
          } />

          {/* Módulo Inventario */}
          <Route path="/inventario" element={
            <PrivateRoute><InventarioPage /></PrivateRoute>
          } />
          <Route path="/inventario/movimiento/nuevo" element={
            <PrivateRoute><MovimientoFormPage /></PrivateRoute>
          } />

          {/* Raíz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-600">
                404 — Página no encontrada
              </h1>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App