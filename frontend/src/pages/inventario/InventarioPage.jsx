import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventario } from '../../hooks/useInventario.js'

// Badge de estado de stock
const BadgeStock = ({ estado }) => {
  const config = {
    NORMAL:    { clase: 'bg-green-100 text-green-700',  texto: '● Normal' },
    CRITICO:   { clase: 'bg-yellow-100 text-yellow-700', texto: '● Crítico' },
    SIN_STOCK: { clase: 'bg-red-100 text-red-700',      texto: '● Sin stock' }
  }
  const { clase, texto } = config[estado] || config.NORMAL
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${clase}`}>
      {texto}
    </span>
  )
}

// Badge de tipo de movimiento
const BadgeTipo = ({ tipo }) => {
  const config = {
    ENTRADA:    'bg-blue-100 text-blue-700',
    SALIDA:     'bg-orange-100 text-orange-700',
    AJUSTE:     'bg-purple-100 text-purple-700',
    DEVOLUCION: 'bg-green-100 text-green-700'
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[tipo]}`}>
      {tipo}
    </span>
  )
}

const InventarioPage = () => {
  const navigate = useNavigate()
  const {
    stock, alertas, movimientos, pagination,
    loading, error, recargarMovimientos,
    loadingMovimientos, errorMovimientos
  } = useInventario()

  const [vistaActiva, setVistaActiva] = useState('stock') // 'stock' | 'movimientos' | 'alertas'
  const [filtroTipo, setFiltroTipo] = useState('')

  const handleFiltroMovimientos = (tipo) => {
    setFiltroTipo(tipo)
    recargarMovimientos(tipo ? { tipo } : {})
  }

  if (loading) return (
    <div className="p-6 text-gray-400 text-center">⏳ Cargando inventario...</div>
  )

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
          <h1 className="text-2xl font-bold text-gray-800">🏭 Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">
            Control de stock y movimientos
          </p>
        </div>
        <button
          onClick={() => navigate('/inventario/movimiento/nuevo')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2
                     rounded-lg font-medium transition flex items-center gap-2"
        >
          + Registrar Movimiento
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Productos con stock normal</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stock.filter(p => p.estado_stock === 'NORMAL').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Stock crítico</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stock.filter(p => p.estado_stock === 'CRITICO').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Sin stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stock.filter(p => p.estado_stock === 'SIN_STOCK').length}
          </p>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'stock', label: '📦 Stock actual' },
          { id: 'alertas', label: `⚠️ Alertas (${alertas.length})` },
          { id: 'movimientos', label: '📋 Historial' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setVistaActiva(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${vistaActiva === tab.id
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── VISTA: STOCK ACTUAL ── */}
      {vistaActiva === 'stock' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-right">Stock Actual</th>
                <th className="px-4 py-3 text-right">Stock Mínimo</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stock.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    📭 No hay productos en inventario
                  </td>
                </tr>
              ) : (
                stock.map(item => (
                  <tr key={item.producto_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-blue-600 text-xs">
                      {item.codigo}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {item.categoria}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      {item.stock_actual}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {item.stock_minimo}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <BadgeStock estado={item.estado_stock} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {item.proveedor || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── VISTA: ALERTAS ── */}
      {vistaActiva === 'alertas' && (
        <div>
          {alertas.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <p className="text-green-700 font-medium">
                ✅ Todos los productos tienen stock suficiente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertas.map(alerta => (
                <div
                  key={alerta.producto_id}
                  className={`bg-white rounded-xl shadow p-4 border-l-4 flex
                    justify-between items-center
                    ${alerta.estado_stock === 'SIN_STOCK'
                      ? 'border-red-500'
                      : 'border-yellow-500'}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-blue-600">
                        {alerta.codigo}
                      </span>
                      <BadgeStock estado={alerta.estado_stock} />
                    </div>
                    <p className="font-semibold text-gray-800">{alerta.nombre}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Stock actual: <strong className="text-red-600">
                        {alerta.stock_actual}
                      </strong> / Mínimo: {alerta.stock_minimo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      📦 {alerta.proveedor}
                    </p>
                    {alerta.telefono_proveedor && (
                      <p className="text-sm text-blue-600 mt-1">
                        📞 {alerta.telefono_proveedor}
                      </p>
                    )}
                    <button
                      onClick={() => navigate('/inventario/movimiento/nuevo')}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1
                                 rounded-lg hover:bg-blue-700 transition"
                    >
                      Registrar entrada
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VISTA: HISTORIAL DE MOVIMIENTOS ── */}
      {vistaActiva === 'movimientos' && (
        <div>
          {/* Filtro por tipo */}
          <div className="flex gap-2 mb-4">
            {['', 'ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION'].map(tipo => (
              <button
                key={tipo}
                onClick={() => handleFiltroMovimientos(tipo)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                  ${filtroTipo === tipo
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {tipo || 'Todos'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Stock Antes</th>
                  <th className="px-4 py-3 text-right">Stock Después</th>
                  <th className="px-4 py-3 text-left">Motivo</th>
                  <th className="px-4 py-3 text-left">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingMovimientos ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      ⏳ Cargando movimientos...
                    </td>
                  </tr>
                ) : errorMovimientos ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-red-500">
                      ❌ {errorMovimientos}
                    </td>
                  </tr>
                ) : movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      📋 No hay movimientos registrados
                    </td>
                  </tr>
                ) : (
                  movimientos.map(mov => (
                    <tr key={mov.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(mov.created_at).toLocaleString('es-PE')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 text-xs">
                          {mov.producto?.nombre}
                        </p>
                        <p className="text-gray-400 text-xs font-mono">
                          {mov.producto?.codigo}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <BadgeTipo tipo={mov.tipo} />
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {['ENTRADA', 'DEVOLUCION'].includes(mov.tipo) ? '+' : '-'}
                        {mov.cantidad}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {mov.stock_antes}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        {mov.stock_despues}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {mov.motivo || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {mov.usuario?.nombre}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Paginación del historial */}
            {pagination && pagination.total_paginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-500">
                  Total: {pagination.total} movimientos
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => recargarMovimientos({
                      tipo: filtroTipo,
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
                    onClick={() => recargarMovimientos({
                      tipo: filtroTipo,
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
      )}
    </div>
  )
}

export default InventarioPage