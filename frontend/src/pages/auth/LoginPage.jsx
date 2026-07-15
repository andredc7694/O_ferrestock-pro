import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('El correo y la contraseña son requeridos')
      return
    }

    setLoading(true)

    try {
      console.log('Intentando login con:', form.email) // debug temporal
      await login(form.email, form.password)
      console.log('Login exitoso, redirigiendo...') // debug temporal
      navigate('/dashboard')
    } catch (err) {
      console.error('Error completo:', err) // debug temporal
      const mensaje = err.response?.data?.message || 'Error al conectar con el servidor'
      setError(mensaje)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">🔧 FerreStock Pro</h1>
          <p className="text-gray-500 mt-2">Sistema de Control de Inventario y Ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@ferrestock.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-lg px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-semibold py-2.5 rounded-lg transition
                       focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {loading ? '⏳ Iniciando sesión...' : 'Iniciar sesión'}
          </button>

        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          FerreStock Pro © 2026 — UNSCH
        </p>
      </div>
    </div>
  )
}

export default LoginPage