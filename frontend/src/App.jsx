import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">FerreStock Pro</h1>
              <p className="text-gray-500 text-sm mb-6">Sistema de Control de Inventario y Ventas</p>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm focus:outline-none focus:border-blue-500"
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700">
                Iniciar sesión
              </button>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App