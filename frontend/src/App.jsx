import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import PrivateRoute from './routes/PrivateRoute.jsx'

// Páginas
import LoginPage            from './pages/auth/LoginPage.jsx'
import ProductosPage        from './pages/productos/ProductosPage.jsx'
import ProductoFormPage     from './pages/productos/ProductoFormPage.jsx'
import InventarioPage       from './pages/inventario/InventarioPage.jsx'
import MovimientoFormPage   from './pages/inventario/MovimientoFormPage.jsx'
import ProveedoresPage      from './pages/proveedores/ProveedoresPage.jsx'
import ProveedorFormPage    from './pages/proveedores/ProveedorFormPage.jsx'
import ProveedorDetallePage from './pages/proveedores/ProveedorDetallePage.jsx'
import PosPage              from './pages/ventas/PosPage.jsx'
import ComprobantePage      from './pages/ventas/ComprobantePage.jsx'
import VentasPage           from './pages/ventas/VentasPage.jsx'

const Dashboard = () => {
  const { usuario, logout } = useAuth()

  const modulos = [
    { href:'/productos',   emoji:'📦', label:'Productos',   roles:['Administrador','Vendedor','Bodeguero'] },
    { href:'/inventario',  emoji:'🏭', label:'Inventario',  roles:['Administrador','Bodeguero'] },
    { href:'/proveedores', emoji:'🏢', label:'Proveedores', roles:['Administrador'] },
    { href:'/pos',         emoji:'🛒', label:'Punto de Venta', roles:['Administrador','Vendedor'] },
    { href:'/ventas',      emoji:'💰', label:'Ventas',      roles:['Administrador','Vendedor'] }
  ].filter(m => m.roles.includes(usuario?.rol))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">🔧 FerreStock Pro</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            {usuario?.nombre} —{' '}
            <span className="font-medium text-blue-600">{usuario?.rol}</span>
          </span>
          <button onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white
                       text-sm px-3 py-1.5 rounded-lg transition">
            Cerrar sesión
          </button>
        </div>
      </nav>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Bienvenido, {usuario?.nombre} 👋
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
          {modulos.map(m => (
            <a key={m.href} href={m.href}
              className="bg-white rounded-xl shadow p-6 hover:shadow-md
                         transition text-center border-2 border-transparent
                         hover:border-blue-500">
              <div className="text-3xl mb-2">{m.emoji}</div>
              <p className="font-semibold text-gray-700">{m.label}</p>
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
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          {/* Productos */}
          <Route path="/productos"              element={<PrivateRoute><ProductosPage /></PrivateRoute>} />
          <Route path="/productos/nuevo"        element={<PrivateRoute><ProductoFormPage /></PrivateRoute>} />
          <Route path="/productos/:id/editar"   element={<PrivateRoute><ProductoFormPage /></PrivateRoute>} />

          {/* Inventario */}
          <Route path="/inventario"                     element={<PrivateRoute><InventarioPage /></PrivateRoute>} />
          <Route path="/inventario/movimiento/nuevo"    element={<PrivateRoute><MovimientoFormPage /></PrivateRoute>} />

          {/* Proveedores */}
          <Route path="/proveedores"            element={<PrivateRoute><ProveedoresPage /></PrivateRoute>} />
          <Route path="/proveedores/nuevo"      element={<PrivateRoute><ProveedorFormPage /></PrivateRoute>} />
          <Route path="/proveedores/:id"        element={<PrivateRoute><ProveedorDetallePage /></PrivateRoute>} />
          <Route path="/proveedores/:id/editar" element={<PrivateRoute><ProveedorFormPage /></PrivateRoute>} />

          {/* Ventas */}
          <Route path="/pos"                    element={<PrivateRoute><PosPage /></PrivateRoute>} />
          <Route path="/ventas"                 element={<PrivateRoute><VentasPage /></PrivateRoute>} />
          <Route path="/ventas/:id/comprobante" element={<PrivateRoute><ComprobantePage /></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-600">404 — No encontrado</h1>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App