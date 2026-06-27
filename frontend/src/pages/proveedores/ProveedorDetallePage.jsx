import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { proveedoresService } from '../../services/proveedores.service.js'

const BadgeStock = ({ stockActual, stockMinimo }) => {
  const estado = stockActual === 0
    ? 'SIN_STOCK'
    : stockActual <= stockMinimo
      ? 'CRITICO'
      : 'NORMAL'

  const config = {
    NORMAL:    { clase: 'bg-green-100 text-green-700',  texto: 'Normal' },
    CRITICO:   { clase: 'bg-yellow-100 text-yellow-700', texto: 'Crítico' },
    SIN_STOCK: { clase: 'bg-red-100 text-red-700',      texto: 'Sin stock' }
  }
  const { clase, texto } = config[estado]

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${clase}`}>
      {texto}
    </span>
  )
}

const ProveedorDetallePage = () => {
  const navigate           = useNavigate()
  const { id }             = useParams()
  const [proveedor, setProveedor] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await proveedoresService.obtener(id)
        setProveedor(res.data.data)
      } catch (err) {
        setError('No se pudo cargar el proveedor')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  if (loading) return (
    <div className="p-6 text-gray-400">⏳ Cargando proveedor...</div>
  )

  if (error) return (
    <div className="p-6 text-red-600 bg-red-50 rounded-lg">❌ {error}</div>
  )

  if (!proveedor) return null

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Botón volver */}
      <button
        onClick={() => navigate('/proveedores')}
        className="mb-6 text-blue-600 hover:text-blue-800 text-sm
                   font-medium flex items-center gap-1"
      >
        ← Volver a proveedores
      </button>

      {/* Tarjeta de datos del proveedor */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🏢 {proveedor.razon_social}
            </h1>
            <p className="text-gray-500 font-mono mt-1">RUC: {proveedor.ruc}</p>
          </div>
          <button
            onClick={() => navigate(`/proveedores/${id}/editar`)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm
                       px-4 py-2 rounded-lg transition"
          >
            ✏️ Editar
          </button>
        </div>

        {/* Grid de datos de contacto */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {[
            { label: '📞 Teléfono',  valor: proveedor.telefono },
            { label: '✉️ Email',     valor: proveedor.email || '—' },
            { label: '👤 Contacto',  valor: proveedor.nombre_contacto || '—' },
            { label: '📍 Dirección', valor: proveedor.direccion || '—' }
          ].map(({ label, valor }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="font-medium text-gray-800 text-sm">{valor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Productos asociados */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            📦 Productos que suministra
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {proveedor.productos?.length || 0} producto(s) asociado(s)
          </p>
        </div>

        {!proveedor.productos || proveedor.productos.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            📭 Este proveedor no tiene productos asociados
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-right">Stock Actual</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proveedor.productos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-blue-600 text-xs">
                    {p.codigo}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {p.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.categoria?.nombre}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">
                    {p.inventario?.stock_actual ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <BadgeStock
                      stockActual={p.inventario?.stock_actual ?? 0}
                      stockMinimo={p.stock_minimo}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ProveedorDetallePage