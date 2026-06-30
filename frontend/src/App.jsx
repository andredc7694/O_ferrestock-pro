import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import PrivateRoute from './routes/PrivateRoute.jsx'
import RoleRoute    from './routes/RoleRoute.jsx'

// Auth
import LoginPage from './pages/auth/LoginPage.jsx'

// Dashboard y Reportes
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import ReportesPage  from './pages/reportes/ReportesPage.jsx'

// Productos
import ProductosPage    from './pages/productos/ProductosPage.jsx'
import ProductoFormPage from './pages/productos/ProductoFormPage.jsx'

// Inventario
import InventarioPage     from './pages/inventario/InventarioPage.jsx'
import MovimientoFormPage from './pages/inventario/MovimientoFormPage.jsx'

// Proveedores
import ProveedoresPage      from './pages/proveedores/ProveedoresPage.jsx'
import ProveedorFormPage    from './pages/proveedores/ProveedorFormPage.jsx'
import ProveedorDetallePage from './pages/proveedores/ProveedorDetallePage.jsx'

// Ventas
import PosPage         from './pages/ventas/PosPage.jsx'
import ComprobantePage from './pages/ventas/ComprobantePage.jsx'
import VentasPage      from './pages/ventas/VentasPage.jsx'

// Clientes
import ClientesPage       from './pages/clientes/ClientesPage.jsx'
import ClienteFormPage    from './pages/clientes/ClienteFormPage.jsx'
import ClienteDetallePage from './pages/clientes/ClienteDetallePage.jsx'

// Página de acceso denegado simple
const AccesoDenegado = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <p className="text-5xl mb-4">🚫</p>
      <h1 className="text-2xl font-bold text-gray-700">Acceso denegado</h1>
      <p className="text-gray-500 mt-2">No tienes permiso para ver esta página</p>
      <a href="/dashboard"
         className="mt-4 inline-block bg-blue-600 text-white
                    px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        Volver al inicio
      </a>
    </div>
  </div>
)

// Redirección inteligente según el rol del usuario
const RutaRaiz = () => {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.rol === 'Administrador') return <Navigate to="/dashboard" replace />
  if (usuario.rol === 'Vendedor')      return <Navigate to="/pos" replace />
  return <Navigate to="/inventario" replace /> // Bodeguero
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── PÚBLICA ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/acceso-denegado" element={<AccesoDenegado />} />

          {/* ── RAÍZ INTELIGENTE ── */}
          <Route path="/" element={
            <PrivateRoute><RutaRaiz /></PrivateRoute>
          } />

          {/* ── DASHBOARD (solo Admin) ── */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador']}>
                <DashboardPage />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── REPORTES (solo Admin) ── */}
          <Route path="/reportes" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador']}>
                <ReportesPage />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── PRODUCTOS (todos) ── */}
          <Route path="/productos" element={
            <PrivateRoute><ProductosPage /></PrivateRoute>
          } />
          <Route path="/productos/nuevo" element={
            <PrivateRoute><ProductoFormPage /></PrivateRoute>
          } />
          <Route path="/productos/:id/editar" element={
            <PrivateRoute><ProductoFormPage /></PrivateRoute>
          } />

          {/* ── INVENTARIO (Admin y Bodeguero) ── */}
          <Route path="/inventario" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Bodeguero']}>
                <InventarioPage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/inventario/movimiento/nuevo" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Bodeguero']}>
                <MovimientoFormPage />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── PROVEEDORES (solo Admin) ── */}
          <Route path="/proveedores" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador']}>
                <ProveedoresPage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/proveedores/nuevo" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador']}>
                <ProveedorFormPage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/proveedores/:id" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador']}>
                <ProveedorDetallePage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/proveedores/:id/editar" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador']}>
                <ProveedorFormPage />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── VENTAS (Admin y Vendedor) ── */}
          <Route path="/pos" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Vendedor']}>
                <PosPage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/ventas" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Vendedor']}>
                <VentasPage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/ventas/:id/comprobante" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Vendedor']}>
                <ComprobantePage />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── CLIENTES (Admin y Vendedor) ── */}
          <Route path="/clientes" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Vendedor']}>
                <ClientesPage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/clientes/nuevo" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Vendedor']}>
                <ClienteFormPage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/clientes/:id" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Vendedor']}>
                <ClienteDetallePage />
              </RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/clientes/:id/editar" element={
            <PrivateRoute>
              <RoleRoute roles={['Administrador','Vendedor']}>
                <ClienteFormPage />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── 404 ── */}
          <Route path="*" element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-600">
                404 — Página no encontrada
              </h1>
              <a href="/"
                 className="mt-4 inline-block text-blue-600 hover:underline">
                Volver al inicio
              </a>
            </div>
          } />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App