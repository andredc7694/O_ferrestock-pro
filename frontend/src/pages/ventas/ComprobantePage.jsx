import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ventasService } from '../../services/ventas.service.js'

const ComprobantePage = () => {
  const navigate           = useNavigate()
  const { id }             = useParams()
  const [venta, setVenta]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await ventasService.comprobante(id)
        setVenta(res.data.data)
      } catch {
        alert('Error al cargar el comprobante')
        navigate('/pos')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  if (loading) return (
    <div className="p-6 text-gray-400 text-center">⏳ Cargando comprobante...</div>
  )

  if (!venta) return null

  const fecha = new Date(venta.fecha_venta).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Botones de acción (no se imprimen) */}
      <div className="flex gap-3 mb-6 print:hidden max-w-lg mx-auto">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold py-2.5 rounded-lg transition"
        >
          🖨️ Imprimir
        </button>
        <button
          onClick={() => navigate('/pos')}
          className="flex-1 border border-gray-300 text-gray-600
                     hover:bg-gray-50 font-semibold py-2.5 rounded-lg transition"
        >
          ➕ Nueva venta
        </button>
        <button
          onClick={() => navigate('/ventas')}
          className="px-4 border border-gray-300 text-gray-600
                     hover:bg-gray-50 font-semibold py-2.5 rounded-lg transition"
        >
          📋 Historial
        </button>
      </div>

      {/* Comprobante */}
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8
                      print:shadow-none print:rounded-none print:max-w-full">

        {/* Cabecera */}
        <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-blue-700">🔧 FerreStock Pro</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Inventario y Ventas</p>
          <div className="mt-4 bg-blue-50 rounded-lg py-3 px-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Comprobante de Venta
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {venta.numero_venta}
            </p>
          </div>
        </div>

        {/* Datos de la venta */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Fecha y hora</p>
            <p className="font-medium text-gray-800">{fecha}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Método de pago</p>
            <p className="font-medium text-gray-800">{venta.metodo_pago}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Vendedor</p>
            <p className="font-medium text-gray-800">
              {venta.vendedor?.nombre} {venta.vendedor?.apellidos}
            </p>
          </div>
          {venta.cliente && (
            <div>
              <p className="text-gray-400 text-xs">Cliente</p>
              <p className="font-medium text-gray-800">
                {venta.cliente.nombre} {venta.cliente.apellidos}
              </p>
            </div>
          )}
        </div>

        {/* Tabla de productos */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="pb-2 text-left text-gray-500 font-medium">Producto</th>
              <th className="pb-2 text-center text-gray-500 font-medium w-12">Cant.</th>
              <th className="pb-2 text-right text-gray-500 font-medium">P. Unit.</th>
              <th className="pb-2 text-right text-gray-500 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {venta.items?.map(item => (
              <tr key={item.id}>
                <td className="py-2.5">
                  <p className="font-medium text-gray-800">{item.producto?.nombre}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    {item.producto?.codigo}
                  </p>
                </td>
                <td className="py-2.5 text-center text-gray-600">
                  {item.cantidad}
                </td>
                <td className="py-2.5 text-right text-gray-600">
                  S/ {parseFloat(item.precio_unitario).toFixed(2)}
                </td>
                <td className="py-2.5 text-right font-medium text-gray-800">
                  S/ {parseFloat(item.subtotal).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="border-t-2 border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>S/ {parseFloat(venta.subtotal).toFixed(2)}</span>
          </div>
          {parseFloat(venta.porcentaje_desc) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento ({venta.porcentaje_desc}%)</span>
              <span>− S/ {parseFloat(venta.monto_descuento).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl text-gray-800
                          border-t-2 border-gray-200 pt-3 mt-3">
            <span>TOTAL</span>
            <span className="text-blue-600">
              S/ {parseFloat(venta.total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pie del comprobante */}
        <div className="text-center mt-8 text-gray-400 text-xs border-t pt-4">
          <p>¡Gracias por su compra!</p>
          <p className="mt-1">FerreStock Pro © 2025 — UNSCH</p>
        </div>
      </div>
    </div>
  )
}

export default ComprobantePage