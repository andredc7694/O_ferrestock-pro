import { useState, useRef } from 'react'
import { useNavigate }      from 'react-router-dom'
import { useClientes }      from '../../hooks/useClientes.js'
import { clientesService }  from '../../services/clientes.service.js'
import { useAuth }          from '../../context/AuthContext.jsx'
import { useSlowLoadingMessage } from '../../hooks/useSlowLoadingMessage.js'

const ClientesPage = () => {
  const navigate  = useNavigate()
  const { usuario } = useAuth()
  const { clientes, pagination, loading, error, recargar } = useClientes()
  const mensajeLento = useSlowLoadingMessage(loading)

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
    if (!confirm(`¿Desactivar al cliente "${nombre}"?`)) return
    try {
      await clientesService.desactivar(id)
      recargar()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al desactivar cliente')
    }
  }

  const esAdmin = usuario?.rol === 'Administrador'

  if (error) return (
    <div className="p-6 text-red-600 bg-red-50 rounded-lg">
      <p>❌ {error}</p>
      <button
        onClick={() => recargar()}
        className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm
                   font-medium px-4 py-2 rounded-lg transition"
      >
        🔄 Reintentar
      </button>
    </div>
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
          <h1 className="text-2xl font-bold text-gray-800">👥 Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Directorio de clientes de la ferretería
          </p>
        </div>
        <button
          onClick={() => navigate('/clientes/nuevo')}
          className="bg-blue-600 hover:bg-blue-700 text-white
                     px-4 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o teléfono..."
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
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Documento</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  ⏳ {mensajeLento || 'Cargando clientes...'}
                </td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  📭 No se encontraron clientes
                </td>
              </tr>
            ) : (
              clientes.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {c.nombre} {c.apellidos || ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600
                                     px-2 py-0.5 rounded font-mono">
                      {c.tipo_documento}
                    </span>
                    <span className="ml-2 font-mono text-gray-700 text-xs">
                      {c.numero_documento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.telefono || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.email || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => navigate(`/clientes/${c.id}`)}
                        className="text-green-600 hover:text-green-800 text-xs
                                   px-2 py-1 rounded hover:bg-green-50 font-medium"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => navigate(`/clientes/${c.id}/editar`)}
                        className="text-blue-600 hover:text-blue-800 text-xs
                                   px-2 py-1 rounded hover:bg-blue-50 font-medium"
                      >
                        Editar
                      </button>
                      {esAdmin && (
                        <button
                          onClick={() => handleDesactivar(
                            c.id, `${c.nombre} ${c.apellidos || ''}`
                          )}
                          className="text-red-500 hover:text-red-700 text-xs
                                     px-2 py-1 rounded hover:bg-red-50 font-medium"
                        >
                          Desactivar
                        </button>
                      )}
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
              Total: {pagination.total} clientes
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

export default ClientesPage