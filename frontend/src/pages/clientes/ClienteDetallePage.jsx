import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { clientesService } from '../../services/clientes.service.js'

const ClienteDetallePage = () => {
  const navigate  = useNavigate()
  const { id }    = useParams()

  const [cliente,   setCliente]   = useState(null)
  const [ventas,    setVentas]    = useState([])
  const [pagination, setPagination] = useState(null)
  const [totalAcum, setTotalAcum] = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const cargarTodo = async (page = 1) => {
    try {
      setLoading(true)
      const [resCliente, resVentas] = await Promise.all([
        clientesService.obtener(id),
        clientesService.obtenerVentas(id, { page, limit: 10 })
      ])
      setCliente(resCliente.data.data)
      setVentas(resVentas.data.data)
      setPagination(resVentas.data.pagination)
      setTotalAcum(resVentas.data.total_acumulado || 0)
    } catch {
      setError('No se pudo cargar el cliente')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarTodo() }, [id])

  if (loading) return (
    <div className="p-6 text-gray-400">⏳ Cargando cliente...</div>
  )
  if (error) return (
    <div className="p-6 text-red-600 bg-red-50 rounded-lg">❌ {error}</div>
  )
  if (!cliente) return null

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Botón volver */}
      <button
        onClick={() => navigate('/clientes')}
        className="mb-6 text-blue-600 hover:text-blue-800 text-sm
                   font-medium flex items-center gap-1"
      >
        ← Volver a clientes
      </button>

      {/* Tarjeta principal del cliente */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              👤 {cliente.nombre} {cliente.apellidos || ''}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-700
                               px-2 py-0.5 rounded font-medium">
                {cliente.tipo_documento}
              </span>
              <span className="font-mono text-gray-600 text-sm">
                {cliente.numero_documento}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/clientes/${id}/editar`)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm
                       px-4 py-2 rounded-lg transition"
          >
            ✏️ Editar
          </button>
        </div>

        {/* Datos de contacto */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {[
            { label: '📞 Teléfono', valor: cliente.telefono || '—' },
            { label: '✉️ Email',    valor: cliente.email    || '—' },
            { label: '📍 Dirección',valor: cliente.direccion || '—' }
          ].map(({ label, valor }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="font-medium text-gray-800 text-sm">{valor}</p>
            </div>
          ))}
        </div>

        {/* Métricas de compras */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">Total compras</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">
              {cliente.total_compras}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Monto acumulado</p>
            <p className="text-3xl font-bold text-green-700 mt-1">
              S/ {totalAcum.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de compras */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              📋 Historial de compras
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {pagination?.total || 0} venta(s) registrada(s)
            </p>
          </div>
        </div>

        {ventas.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            📭 Este cliente aún no tiene compras registradas
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">N° Venta</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Productos</th>
                  <th className="px-4 py-3 text-center">Método</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventas.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-blue-600
                                   font-medium text-xs">
                      {v.numero_venta}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(v.fecha_venta).toLocaleString('es-PE', {
                        day:'2-digit', month:'2-digit', year:'numeric',
                        hour:'2-digit', minute:'2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {v.items?.map(i => i.producto?.nombre).join(', ')
                        .substring(0, 40)}
                      {(v.items?.map(i => i.producto?.nombre).join(', ').length > 40)
                        ? '...' : ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-gray-100 text-gray-600
                                       px-2 py-0.5 rounded">
                        {v.metodo_pago}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      S/ {parseFloat(v.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/ventas/${v.id}/comprobante`)}
                        className="text-blue-600 hover:text-blue-800 text-xs
                                   px-2 py-1 rounded hover:bg-blue-50 font-medium"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación del historial */}
            {pagination && pagination.total_paginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-500">
                  Total acumulado: <strong>S/ {totalAcum.toFixed(2)}</strong>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => cargarTodo(pagination.pagina_actual - 1)}
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
                    onClick={() => cargarTodo(pagination.pagina_actual + 1)}
                    disabled={pagination.pagina_actual === pagination.total_paginas}
                    className="px-3 py-1 rounded border text-sm
                               disabled:opacity-40 hover:bg-gray-50"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ClienteDetallePage