import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductos } from '../../hooks/useProductos.js'
import { useCategorias } from '../../hooks/useCategorias.js'
import { productosService } from '../../services/productos.service.js'
import { useAuth } from '../../context/AuthContext.jsx'

// Badge de estado de stock
const BadgeStock = ({ estado }) => {
  const estilos = {
    NORMAL:    'bg-green-100 text-green-700',
    CRITICO:   'bg-yellow-100 text-yellow-700',
    SIN_STOCK: 'bg-red-100 text-red-700'
  }
  const textos = {
    NORMAL: 'Normal', CRITICO: 'Crítico', SIN_STOCK: 'Sin stock'
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estilos[estado]}`}>
      {textos[estado]}
    </span>
  )
}

const ProductosPage = () => {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { categorias } = useCategorias()
  const {
    productos, pagination, loading, error,
    filtros, cambiarFiltros, cambiarPagina, recargar
  } = useProductos({ page: 1, limit: 10 })

  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef(null)

  // Debounce para la búsqueda (300ms)
  const handleSearch = (valor) => {
    setSearchInput(valor)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      cambiarFiltros({ search: valor, page: 1 })
    }, 300)
  }

  const handleDesactivar = async (id, nombre) => {
    if (!confirm(`¿Desactivar el producto "${nombre}"?`)) return
    try {
      await productosService.desactivar(id)
      recargar(filtros)
    } catch (err) {
      alert(err.response?.data?.message || 'Error al desactivar producto')
    }
  }

  const esAdmin = usuario?.rol === 'Administrador'
  const puedeEditar = ['Administrador', 'Bodeguero'].includes(usuario?.rol)

  if (error) return (
    <div className="p-6 text-red-600 bg-red-50 rounded-lg">
      ❌ {error}
    </div>
  )

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 Productos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestión del catálogo de productos
          </p>
        </div>
        {puedeEditar && (
          <button
            onClick={() => navigate('/productos/nuevo')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2
                       rounded-lg font-medium transition flex items-center gap-2"
          >
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          onChange={(e) => cambiarFiltros({ categoria_id: e.target.value, page: 1 })}
          className="border border-gray-300 rounded-lg px-4 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Unidad</th>
              <th className="px-4 py-3 text-right">Precio Venta</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  ⏳ Cargando productos...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  📭 No se encontraron productos
                </td>
              </tr>
            ) : (
              productos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-blue-600 font-medium">
                    {p.codigo}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {p.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.categoria?.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.unidad_medida?.abreviatura}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    S/ {parseFloat(p.precio_venta).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {p.inventario?.stock_actual ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <BadgeStock estado={p.estado_stock} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      {puedeEditar && (
                        <button
                          onClick={() => navigate(`/productos/${p.id}/editar`)}
                          className="text-blue-600 hover:text-blue-800 font-medium
                                     text-xs px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Editar
                        </button>
                      )}
                      {esAdmin && (
                        <button
                          onClick={() => handleDesactivar(p.id, p.nombre)}
                          className="text-red-500 hover:text-red-700 font-medium
                                     text-xs px-2 py-1 rounded hover:bg-red-50"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {productos.length} de {pagination.total} productos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => cambiarPagina(pagination.pagina_actual - 1)}
                disabled={pagination.pagina_actual === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm
                           disabled:opacity-40 hover:bg-gray-50 transition"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Página {pagination.pagina_actual} de {pagination.total_paginas}
              </span>
              <button
                onClick={() => cambiarPagina(pagination.pagina_actual + 1)}
                disabled={pagination.pagina_actual === pagination.total_paginas}
                className="px-3 py-1 rounded border border-gray-300 text-sm
                           disabled:opacity-40 hover:bg-gray-50 transition"
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

export default ProductosPage