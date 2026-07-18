import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { reportesService } from '../../services/reportes.service.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSlowLoadingMessage } from '../../hooks/useSlowLoadingMessage.js'

// Tarjeta de métrica
const TarjetaMetrica = ({ titulo, valor, subtitulo, color, emoji }) => (
  <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${color}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 font-medium">{titulo}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{valor}</p>
        {subtitulo && (
          <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>
        )}
      </div>
      <span className="text-3xl">{emoji}</span>
    </div>
  </div>
)

const DashboardPage = () => {
  const navigate      = useNavigate()
  const { usuario, logout } = useAuth()
  const [datos,   setDatos]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const mensajeLento = useSlowLoadingMessage(loading)

  const cargar = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await reportesService.dashboard()
      setDatos(res.data.data)
    } catch {
      setError('Error al cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  // Tooltip personalizado para el gráfico
  const TooltipPersonalizado = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg
                        shadow-lg px-3 py-2 text-sm">
          <p className="font-medium text-gray-700">{label}</p>
          <p className="text-blue-600">
            S/ {payload[0]?.value?.toFixed(2)}
          </p>
          <p className="text-gray-400 text-xs">
            {payload[0]?.payload?.cantidad} venta(s)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center
                      sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-700">🔧 FerreStock Pro</h1>
        <div className="flex items-center gap-4">
          {/* Navegación rápida */}
          <div className="hidden md:flex gap-2">
            {[
              { href:'/pos',         label:'POS',        emoji:'🛒' },
              { href:'/productos',   label:'Productos',  emoji:'📦' },
              { href:'/inventario',  label:'Inventario', emoji:'🏭' },
              { href:'/clientes',    label:'Clientes',   emoji:'👥' },
              { href:'/reportes',    label:'Reportes',   emoji:'📊' }
            ].map(item => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="text-sm text-gray-600 hover:text-blue-600
                           px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 border-l pl-4">
            <span className="text-gray-600 text-sm hidden md:block">
              {usuario?.nombre} —{' '}
              <span className="font-medium text-blue-600">{usuario?.rol}</span>
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white
                         text-sm px-3 py-1.5 rounded-lg transition"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6">

        {/* Encabezado */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('es-PE', {
              weekday:'long', day:'numeric', month:'long', year:'numeric'
            })}
          </p>
        </div>

        {loading ? (
          /* Skeleton de carga */
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            {mensajeLento && (
              <p className="text-center text-sm text-gray-400 mb-6">
                ⏳ {mensajeLento}
              </p>
            )}
          </>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700
                          rounded-xl p-6 text-center">
            <p>❌ {error}</p>
            <button
              onClick={cargar}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm
                         font-medium px-4 py-2 rounded-lg transition"
            >
              🔄 Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* ── TARJETAS DE MÉTRICAS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <TarjetaMetrica
                titulo="Ventas hoy"
                valor={`S/ ${datos.ventas_hoy.monto_total.toFixed(2)}`}
                subtitulo={`${datos.ventas_hoy.cantidad} transacción(es)`}
                color="border-blue-500"
                emoji="💰"
              />
              <TarjetaMetrica
                titulo="Ventas del mes"
                valor={`S/ ${datos.ventas_mes.monto_total.toFixed(2)}`}
                subtitulo={`${datos.ventas_mes.cantidad} transacciones`}
                color="border-green-500"
                emoji="📈"
              />
              <TarjetaMetrica
                titulo="Promedio por venta"
                valor={`S/ ${datos.ventas_hoy.promedio.toFixed(2)}`}
                subtitulo="Promedio del día"
                color="border-purple-500"
                emoji="📊"
              />
              <TarjetaMetrica
                titulo="Stock crítico"
                valor={datos.stock_critico}
                subtitulo={
                  datos.stock_critico > 0
                    ? 'Productos por reponer'
                    : 'Todo en orden ✓'
                }
                color={datos.stock_critico > 0 ? 'border-red-500' : 'border-green-500'}
                emoji={datos.stock_critico > 0 ? '⚠️' : '✅'}
              />
            </div>

            {/* ── GRÁFICO DE 7 DÍAS ── */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📈 Ventas de los últimos 7 días
              </h3>
              {datos.ventas_7_dias.every(d => d.monto === 0) ? (
                <div className="text-center text-gray-400 py-8">
                  No hay ventas en los últimos 7 días
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={datos.ventas_7_dias}
                            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={v => `S/${v}`}
                    />
                    <Tooltip content={<TooltipPersonalizado />} />
                    <Bar dataKey="monto" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── FILA: ÚLTIMAS VENTAS + TOP PRODUCTOS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Últimas ventas del día */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex
                                justify-between items-center">
                  <h3 className="font-semibold text-gray-800">
                    🕒 Últimas ventas del día
                  </h3>
                  <button
                    onClick={() => navigate('/ventas')}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Ver todas →
                  </button>
                </div>
                {datos.ultimas_ventas.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No hay ventas hoy todavía
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {datos.ultimas_ventas.map(v => (
                      <div key={v.id}
                           className="px-5 py-3 flex justify-between items-center
                                      hover:bg-gray-50 cursor-pointer transition"
                           onClick={() => navigate(`/ventas/${v.id}/comprobante`)}
                      >
                        <div>
                          <p className="font-mono text-blue-600 text-xs font-medium">
                            {v.numero_venta}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {v.vendedor?.nombre} · {v.metodo_pago}
                          </p>
                        </div>
                        <p className="font-bold text-gray-800">
                          S/ {parseFloat(v.total).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top 5 productos del mes */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex
                                justify-between items-center">
                  <h3 className="font-semibold text-gray-800">
                    🏆 Top productos del mes
                  </h3>
                  <button
                    onClick={() => navigate('/reportes')}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Ver reporte →
                  </button>
                </div>
                {datos.top_productos_mes.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No hay ventas este mes
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {datos.top_productos_mes.map((p, i) => (
                      <div key={p.producto_id}
                           className="px-5 py-3 flex items-center gap-3
                                      hover:bg-gray-50 transition">
                        <span className={`w-6 h-6 rounded-full flex items-center
                                          justify-center text-xs font-bold
                                          ${i === 0 ? 'bg-yellow-100 text-yellow-700'
                                            : i === 1 ? 'bg-gray-100 text-gray-600'
                                            : i === 2 ? 'bg-orange-100 text-orange-600'
                                            : 'bg-blue-50 text-blue-500'}`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">
                            {p.producto?.nombre}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {parseInt(p.dataValues?.unidades_vendidas || 0)} unidades
                          </p>
                        </div>
                        <p className="text-green-600 font-medium text-sm">
                          S/ {parseFloat(p.dataValues?.ingreso_generado || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── ALERTAS DE STOCK CRÍTICO ── */}
            {datos.stock_critico > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-red-700">
                    ⚠️ {datos.stock_critico} producto(s) con stock crítico
                  </h3>
                  <button
                    onClick={() => navigate('/inventario')}
                    className="text-red-600 text-sm hover:underline font-medium"
                  >
                    Ver inventario →
                  </button>
                </div>
                <p className="text-red-600 text-sm">
                  Algunos productos están por debajo del stock mínimo.
                  Revisa el módulo de inventario para gestionar la reposición.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardPage