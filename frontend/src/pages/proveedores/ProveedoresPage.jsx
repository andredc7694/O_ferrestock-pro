import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProveedores } from '../../hooks/useProveedores.js'
import { proveedoresService } from '../../services/proveedores.service.js'

const ProveedoresPage = () => {
  const navigate    = useNavigate()
  const { proveedores, pagination, loading, error, recargar } = useProveedores()

  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef(null)

  const handleSearch = (valor) => {
    setSearchInput(valor)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      recargar({ search: valor, page: 1 })
    }, 300)
  }

  const handleDesactivar = async (id, nombre) => {
    if (!confirm(`¿Desactivar al proveedor "${nombre}"?`)) return
    try {
      await proveedoresService.desactivar(id)
      recargar()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al desactivar proveedor')
    }
  }

  if (error) return (
    <div className="p-6 text-red-600 bg-red-50 rounded-lg">❌ {error}</div>
  )

  return (
    <div className="p-6">

      {/* Botón volver */}
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 flex items-center gap-1"
      >
        ← Volver al inicio
      </button>

      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏢 Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">
            Directorio de proveedores de la ferretería
          </p>
        </div>
        <button
          onClick={() => navigate('/proveedores/nuevo')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2
                     rounded-lg font-medium transition"
        >
          + Nuevo Proveedor
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por razón social o RUC..."
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg
                     px-4 py-2 focus:outline-none focus:ring-2
                     focus:ring-blue-500 transition"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Razón Social</th>
              <th className="px-4 py-3 text-left">RUC</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Contacto</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  ⏳ Cargando proveedores...
                </td>
              </tr>
            ) : proveedores.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  📭 No se encontraron proveedores
                </td>
              </tr>
            ) : (
              proveedores.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {p.razon_social}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">
                    {p.ruc}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.telefono}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.email || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.nombre_contacto || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => navigate(`/proveedores/${p.id}`)}
                        className="text-green-600 hover:text-green-800 text-xs
                                   px-2 py-1 rounded hover:bg-green-50 font-medium"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => navigate(`/proveedores/${p.id}/editar`)}
                        className="text-blue-600 hover:text-blue-800 text-xs
                                   px-2 py-1 rounded hover:bg-blue-50 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDesactivar(p.id, p.razon_social)}
                        className="text-red-500 hover:text-red-700 text-xs
                                   px-2 py-1 rounded hover:bg-red-50 font-medium"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {pagination && pagination.total_paginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Total: {pagination.total} proveedores
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => recargar({
                  search: searchInput,
                  page: pagination.pagina_actual - 1
                })}
                disabled={pagination.pagina_actual === 1}
                className="px-3 py-1 rounded border text-sm
                           disabled:opacity-40 hover:bg-gray-50"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                {pagination.pagina_actual} / {pagination.total_paginas}
              </span>
              <button
                onClick={() => recargar({
                  search: searchInput,
                  page: pagination.pagina_actual + 1
                })}
                disabled={pagination.pagina_actual === pagination.total_paginas}
                className="px-3 py-1 rounded border text-sm
                           disabled:opacity-40 hover:bg-gray-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProveedoresPage