import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { reportesService } from '../../services/reportes.service.js'
import { useCategorias }   from '../../hooks/useCategorias.js'
import { useSlowLoadingMessage } from '../../hooks/useSlowLoadingMessage.js'

// ── Sección 1: Reporte de Ventas ──
const ReporteVentas = () => {
  const hoy   = new Date().toISOString().split('T')[0]
  const inicio = new Date()
  inicio.setDate(1)
  const inicioMes = inicio.toISOString().split('T')[0]

  const [fechas,  setFechas]  = useState({ inicio: inicioMes, fin: hoy })
  const [datos,   setDatos]   = useState(null)
  const [loading, setLoading] = useState(false)
  const mensajeLento = useSlowLoadingMessage(loading)

  const colores = {
    EFECTIVO: '#10b981', YAPE: '#8b5cf6',
    PLIN: '#3b82f6', TRANSFERENCIA: '#f59e0b'
  }

  const generar = async () => {
    if (!fechas.inicio || !fechas.fin) return
    setLoading(true)
    try {
      const res = await reportesService.ventas({
        fecha_inicio: fechas.inicio,
        fecha_fin:    fechas.fin
      })
      setDatos(res.data.data)
    } catch {
      alert('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        💰 Reporte de Ventas por Período
      </h2>

      {/* Selector de fechas */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha inicio</label>
          <input type="date" value={fechas.inicio}
            onChange={e => setFechas(p => ({ ...p, inicio: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha fin</label>
          <input type="date" value={fechas.fin}
            onChange={e => setFechas(p => ({ ...p, fin: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Atajos de período */}
        {[
          { label: 'Hoy',       dias: 0 },
          { label: 'Sem. actual', dias: 7 },
          { label: 'Este mes',  dias: null }
        ].map(({ label, dias }) => (
          <button key={label}
            onClick={() => {
              const hoyDate = new Date()
              let ini
              if (dias === null) {
                ini = new Date(); ini.setDate(1)
              } else {
                ini = new Date(); ini.setDate(ini.getDate() - dias)
              }
              setFechas({
                inicio: ini.toISOString().split('T')[0],
                fin:    hoyDate.toISOString().split('T')[0]
              })
            }}
            className="self-end text-xs border border-gray-300 rounded-lg
                       px-3 py-2 hover:bg-gray-50 transition text-gray-600"
          >
            {label}
          </button>
        ))}
        <button onClick={generar} disabled={loading}
          className="self-end bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                     text-white font-medium px-5 py-2 rounded-lg text-sm transition"
        >
          {loading ? (mensajeLento ? `⏳ ${mensajeLento}` : '⏳ Generando...') : '📊 Generar reporte'}
        </button>
      </div>

      {datos && (
        <>
          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total ventas',   valor: datos.total_ventas,                formato: 'numero' },
              { label: 'Monto total',    valor: `S/ ${datos.monto_total.toFixed(2)}`, formato: 'texto' },
              { label: 'Promedio/venta', valor: `S/ ${datos.promedio.toFixed(2)}`,    formato: 'texto' }
            ].map(({ label, valor }) => (
              <div key={label} className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 font-medium">{label}</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">{valor}</p>
              </div>
            ))}
          </div>

          {/* Gráfico por día */}
          {datos.ventas_por_dia.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Ventas por día
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={datos.ventas_por_dia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `S/${v}`} />
                  <Tooltip
                    formatter={(v) => [`S/ ${v.toFixed(2)}`, 'Monto']}
                  />
                  <Bar dataKey="monto" fill="#3b82f6" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Desglose por método de pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Por método de pago
              </h3>
              <div className="space-y-2">
                {datos.por_metodo.map(m => (
                  <div key={m.metodo}
                       className="flex justify-between items-center py-2
                                  border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colores[m.metodo] || '#94a3b8' }}
                      />
                      <span className="text-sm text-gray-700">{m.metodo}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-800">
                        S/ {m.monto.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({m.cantidad})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desglose por vendedor */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Por vendedor
              </h3>
              <div className="space-y-2">
                {datos.por_vendedor.map(v => (
                  <div key={v.nombre}
                       className="flex justify-between items-center py-2
                                  border-b border-gray-50">
                    <span className="text-sm text-gray-700">👤 {v.nombre}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-800">
                        S/ {v.monto.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({v.cantidad})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {!datos && !loading && (
        <div className="text-center text-gray-400 py-8">
          Selecciona un período y haz clic en "Generar reporte"
        </div>
      )}
    </div>
  )
}

// ── Sección 2: Top Productos ──
const ReporteTopProductos = () => {
  const [periodo, setPeriodo] = useState('mes')
  const [datos,   setDatos]   = useState(null)
  const [loading, setLoading] = useState(false)
  const mensajeLento = useSlowLoadingMessage(loading)

  const generar = async () => {
    setLoading(true)
    try {
      const res = await reportesService.topProductos({ periodo })
      setDatos(res.data.data)
    } catch {
      alert('Error al obtener top productos')
    } finally {
      setLoading(false)
    }
  }

  const top5 = datos?.slice(0, 5) || []

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🏆 Productos Más Vendidos
      </h2>

      <div className="flex gap-3 mb-6">
        {[
          { valor: 'hoy',    label: 'Hoy' },
          { valor: 'semana', label: 'Esta semana' },
          { valor: 'mes',    label: 'Este mes' }
        ].map(({ valor, label }) => (
          <button key={valor}
            onClick={() => setPeriodo(valor)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${periodo === valor
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
        <button onClick={generar} disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300
                     text-white font-medium px-5 py-2 rounded-lg text-sm transition"
        >
          {loading ? (mensajeLento ? `⏳ ${mensajeLento}` : '⏳...') : '📊 Generar'}
        </button>
      </div>

      {datos && datos.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No hay ventas en el período seleccionado
        </div>
      )}

      {datos && datos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Gráfico barras horizontal top 5 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Top 5 — Unidades vendidas
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top5} layout="vertical"
                        margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={120}
                  tick={{ fontSize: 10 }}
                  tickFormatter={v => v?.length > 15 ? v.substring(0,15)+'…' : v}
                />
                <Tooltip
                  formatter={(v) => [v, 'Unidades']}
                />
                <Bar dataKey="unidades_vendidas" radius={[0,3,3,0]}>
                  {top5.map((_, i) => (
                    <Cell key={i}
                      fill={['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444'][i]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla top 10 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Top 10 completo
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {datos.map((p, i) => (
                <div key={p.producto_id}
                     className="flex items-center gap-3 py-2
                                border-b border-gray-50">
                  <span className={`w-6 h-6 rounded-full flex items-center
                                    justify-center text-xs font-bold flex-shrink-0
                                    ${i < 3
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {p.nombre}
                    </p>
                    <p className="text-xs text-gray-400">{p.categoria}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {p.unidades_vendidas} und.
                    </p>
                    <p className="text-xs text-green-600">
                      S/ {p.ingreso_generado.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!datos && !loading && (
        <div className="text-center text-gray-400 py-8">
          Selecciona un período y haz clic en "Generar"
        </div>
      )}
    </div>
  )
}

// ── Sección 3: Reporte de Stock ──
const ReporteStock = () => {
  const { categorias } = useCategorias()
  const [filtros,  setFiltros]  = useState({ categoria_id: '', estado: '' })
  const [datos,    setDatos]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const mensajeLento = useSlowLoadingMessage(loading)

  const generar = async () => {
    setLoading(true)
    try {
      const res = await reportesService.stock(filtros)
      setDatos(res.data.data)
    } catch {
      alert('Error al generar reporte de stock')
    } finally {
      setLoading(false)
    }
  }

  const badgeEstado = (estado) => {
    const config = {
      NORMAL:    'bg-green-100 text-green-700',
      CRITICO:   'bg-yellow-100 text-yellow-700',
      SIN_STOCK: 'bg-red-100 text-red-700'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${config[estado]}`}>
        {estado}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        📦 Reporte de Stock Actual
      </h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filtros.categoria_id}
          onChange={e => setFiltros(p => ({ ...p, categoria_id: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select
          value={filtros.estado}
          onChange={e => setFiltros(p => ({ ...p, estado: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="NORMAL">Normal</option>
          <option value="CRITICO">Crítico</option>
          <option value="SIN_STOCK">Sin stock</option>
        </select>
        <button onClick={generar} disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300
                     text-white font-medium px-5 py-2 rounded-lg text-sm transition"
        >
          {loading ? (mensajeLento ? `⏳ ${mensajeLento}` : '⏳ Generando...') : '📊 Generar reporte'}
        </button>
      </div>

      {datos && (
        <>
          {/* Valor total del inventario */}
          <div className="bg-purple-50 rounded-xl p-4 mb-6 flex
                          justify-between items-center">
            <div>
              <p className="text-sm text-purple-600 font-medium">
                Valor total del inventario
              </p>
              <p className="text-3xl font-bold text-purple-800 mt-1">
                S/ {datos.valor_total.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {datos.items.length} producto(s)
              </p>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Mín.</th>
                  <th className="px-4 py-3 text-right">P. Compra</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datos.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No se encontraron productos con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  datos.items.map(item => (
                    <tr key={item.producto_id}
                        className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-blue-600 text-xs">
                        {item.codigo}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.nombre}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {item.categoria}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {item.stock_actual}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {item.stock_minimo}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        S/ {item.precio_compra.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium
                                     text-purple-700">
                        S/ {item.valor_inventario.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {badgeEstado(item.estado_stock)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {datos.items.length > 0 && (
                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                  <tr>
                    <td colSpan={6}
                        className="px-4 py-3 font-bold text-gray-700 text-right">
                      VALOR TOTAL DEL INVENTARIO:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-purple-700">
                      S/ {datos.valor_total.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      {!datos && !loading && (
        <div className="text-center text-gray-400 py-8">
          Aplica filtros y haz clic en "Generar reporte"
        </div>
      )}
    </div>
  )
}

// ── Página principal de Reportes ──
const ReportesPage = () => {
  const navigate = useNavigate()
  const [seccion, setSeccion] = useState('ventas')

  return (
    <div className="p-6">

      {/* Botón volver */}
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 flex items-center gap-1"
      >
        ← Volver al inicio
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Reportes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Análisis del negocio
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Volver al Dashboard
        </button>
      </div>

      {/* Tabs de sección */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'ventas',     label: '💰 Ventas' },
          { id: 'productos',  label: '🏆 Top Productos' },
          { id: 'stock',      label: '📦 Stock' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setSeccion(tab.id)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition
              ${seccion === tab.id
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {seccion === 'ventas'    && <ReporteVentas />}
      {seccion === 'productos' && <ReporteTopProductos />}
      {seccion === 'stock'     && <ReporteStock />}
    </div>
  )
}

export default ReportesPage