import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ventasService } from '../../services/ventas.service.js'
import { useAuth } from '../../context/AuthContext.jsx'

const VentasPage = () => {
  const navigate        = useNavigate()
  const { usuario }     = useAuth()
  const [ventas,        setVentas]      = useState([])
  const [pagination,    setPagination]  = useState(null)
  const [loading,       setLoading]     = useState(true)
  const [error,         setError]       = useState(null)
  const [filtros,       setFiltros]     = useState({
    fecha_inicio: '', fecha_fin: '', metodo_pago: '', page: 1
  })

  const cargar = async (params = filtros) => {
    try {
      setLoading(true)
      setError(null)
      const res = await ventasService.listar(params)
      setVentas(res.data.data)
      setPagination(res.data.pagination)
    } catch {
      setError('Error al cargar las ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleFiltro = (e) => {
    const nuevos = { ...filtros, [e.target.name]: e.target.value, page: 1 }
    setFiltros(nuevos)
    cargar(nuevos)
  }

  const handlePagina = (nueva) => {
    const nuevos = { ...filtros, page: nueva }
    setFiltros(nuevos)
    cargar(nuevos)
  }

  const badgeMetodo = (metodo) => {
    const config = {
      EFECTIVO:      'bg-green-100 text-green-700',
      YAPE:          'bg-purple-100 text-purple-700',
      PLIN:          'bg-blue-100 text-blue-700',
      TRANSFERENCIA: 'bg-orange-100 text-orange-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${config[metodo] || 'bg-gray-100 text-gray-600'}`}>
        {metodo}
      </span>
    )
  }

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
          <h1 className="text-2xl font-bold text-gray-800">💰 Historial de Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {usuario?.rol === 'Vendedor'
              ? 'Tus ventas registradas'
              : 'Todas las ventas del sistema'}
          </p>
        </div>
        <button
          onClick={() => navigate('/pos')}
          className="bg-blue-600 hover:bg-blue-700 text-white
                     px-4 py-2 rounded-lg font-medium transition"
        >
          + Nueva Venta
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="date"
          name="fecha_inicio"
          value={filtros.fecha_inicio}
          onChange={handleFiltro}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="fecha_fin"
          value={filtros.fecha_fin}
          onChange={handleFiltro}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="metodo_pago"
          value={filtros.metodo_pago}
          onChange={handleFiltro}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los métodos</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>
        <button
          onClick={() => {
            const limpios = { fecha_inicio:'', fecha_fin:'', metodo_pago:'', page:1 }
            setFiltros(limpios)
            cargar(limpios)
          }}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2
                     border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nº Venta</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Método</th>
              <th className="px-4 py-3 text-left">Vendedor</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  ⏳ Cargando ventas...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-red-500">
                  ❌ {error}
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  📭 No hay ventas registradas
                </td>
              </tr>
            ) : (
              ventas.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-blue-600 font-medium text-xs">
                    {v.numero_venta}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(v.fecha_venta).toLocaleString('es-PE', {
                      day:'2-digit', month:'2-digit', year:'numeric',
                      hour:'2-digit', minute:'2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.cliente
                      ? `${v.cliente.nombre} ${v.cliente.apellidos || ''}`
                      : <span className="text-gray-300 text-xs">Anónimo</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">
                    S/ {parseFloat(v.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {badgeMetodo(v.metodo_pago)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {v.vendedor?.nombre} {v.vendedor?.apellidos}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/ventas/${v.id}/comprobante`)}
                      className="text-blue-600 hover:text-blue-800 text-xs
                                 px-2 py-1 rounded hover:bg-blue-50 font-medium"
                    >
                      Ver comprobante
                    </button>
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
              Total: {pagination.total} ventas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePagina(pagination.pagina_actual - 1)}
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
                onClick={() => handlePagina(pagination.pagina_actual + 1)}
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

export default VentasPage