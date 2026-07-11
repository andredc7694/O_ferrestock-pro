import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { productosService } from '../../services/productos.service.js'
import { ventasService } from '../../services/ventas.service.js'
import { clientesService } from '../../services/clientes.service.js' // ← IMPORT AGREGADO

const PosPage = () => {
  const navigate        = useNavigate()
  const { usuario }     = useAuth()
  const debounceRef     = useRef(null)

  // Estado del buscador
  const [busqueda,      setBusqueda]     = useState('')
  const [resultados,    setResultados]   = useState([])
  const [buscando,      setBuscando]     = useState(false)

  // Estado del carrito
  const [carrito,       setCarrito]      = useState([])

  // Estado de la venta
  const [descuento,      setDescuento]    = useState(0)
  const [metodoPago,    setMetodoPago]   = useState('EFECTIVO')
  const [confirmando,   setConfirmando]  = useState(false)
  const [errorVenta,    setErrorVenta]   = useState('')

  // ESTADOS DE CLIENTE AGREGADOS
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busquedaCliente,     setBusquedaCliente]     = useState('')
  const [resultadosCliente,   setResultadosCliente]   = useState([])
  const debounceClienteRef = useRef(null)

  // ── BÚSQUEDA DE PRODUCTOS ──
  const handleBusqueda = (valor) => {
    setBusqueda(valor)
    clearTimeout(debounceRef.current)

    if (!valor.trim()) {
      setResultados([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setBuscando(true)
        const res = await productosService.listar({ search: valor, limit: 8 })
        setResultados(res.data.data)
      } catch {
        setResultados([])
      } finally {
        setBuscando(false)
      }
    }, 300)
  }

  // FUNCIONES DE CLIENTE AGREGADAS
  const handleBusquedaCliente = (valor) => {
    setBusquedaCliente(valor)
    clearTimeout(debounceClienteRef.current)

    if (!valor.trim()) {
      setResultadosCliente([])
      return
    }

    debounceClienteRef.current = setTimeout(async () => {
      try {
        const res = await clientesService.listar({ search: valor, limit: 5 })
        setResultadosCliente(res.data.data)
      } catch {
        setResultadosCliente([])
      }
    }, 300)
  }

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setBusquedaCliente('')
    setResultadosCliente([])
  }

  // ── AGREGAR AL CARRITO ──
  const agregarAlCarrito = (producto) => {
    const stockDisponible = producto.inventario?.stock_actual ?? 0

    setCarrito(prev => {
      const existe = prev.find(i => i.producto_id === producto.id)

      if (existe) {
        return prev.map(i =>
          i.producto_id === producto.id
            ? {
                ...i,
                cantidad: Math.min(i.cantidad + 1, stockDisponible),
                subtotal: parseFloat(i.precio_unitario) *
                          Math.min(i.cantidad + 1, stockDisponible)
              }
            : i
        )
      }

      return [...prev, {
        producto_id:     producto.id,
        codigo:          producto.codigo,
        nombre:          producto.nombre,
        precio_unitario: parseFloat(producto.precio_venta),
        cantidad:        1,
        subtotal:        parseFloat(producto.precio_venta),
        stock_max:       stockDisponible
      }]
    })

    setBusqueda('')
    setResultados([])
  }

  // ── CAMBIAR CANTIDAD EN CARRITO ──
  const cambiarCantidad = (producto_id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return

    setCarrito(prev =>
      prev.map(i => {
        if (i.producto_id !== producto_id) return i
        const cantidad = Math.min(nuevaCantidad, i.stock_max)
        return { ...i, cantidad, subtotal: i.precio_unitario * cantidad }
      })
    )
  }

  // ── ELIMINAR DEL CARRITO ──
  const eliminarDelCarrito = (producto_id) => {
    setCarrito(prev => prev.filter(i => i.producto_id !== producto_id))
  }

  // ── CALCULAR TOTALES ──
  const subtotal       = carrito.reduce((acc, i) => acc + i.subtotal, 0)
  const descuentoVal   = Math.min(Math.max(parseFloat(descuento) || 0, 0), 100)
  const montoDescuento = parseFloat((subtotal * descuentoVal / 100).toFixed(2))
  const total          = parseFloat((subtotal - montoDescuento).toFixed(2))

  const maxDescuento = usuario?.rol === 'Administrador' ? 100 : 10

  // ── CONFIRMAR VENTA ──
  const confirmarVenta = async () => {
    if (carrito.length === 0) return
    setErrorVenta('')
    setConfirmando(true)

    try {
      const body = {
        cliente_id: clienteSeleccionado?.id || null,  // ← LÍNEA AGREGADA
        items: carrito.map(i => ({
          producto_id:     i.producto_id,
          cantidad:        i.cantidad,
          precio_unitario: i.precio_unitario
        })),
        porcentaje_desc: descuentoVal,
        metodo_pago:     metodoPago
      }

      const res = await ventasService.registrar(body)
      const venta = res.data.data

      setCarrito([])
      setDescuento(0)
      setMetodoPago('EFECTIVO')
      setClienteSeleccionado(null) // Limpiamos también el cliente al finalizar exitosamente

      navigate(`/ventas/${venta.id}/comprobante`)

    } catch (err) {
      setErrorVenta(
        err.response?.data?.message || 'Error al registrar la venta'
      )
    } finally {
      setConfirmando(false)
    }
  }

  return (

        <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── PANEL IZQUIERDO: BUSCADOR ── */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🛒 Punto de Venta</h1>
          <p className="text-gray-500 text-sm mt-1">
            Busca productos y agrégalos al carrito
          </p>
        </div>

        {/* Campo de búsqueda */}
        <div className="relative mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            placeholder="🔍 Buscar producto por nombre o código..."
            className="w-full border-2 border-blue-300 rounded-xl px-5 py-4
                       text-lg focus:outline-none focus:border-blue-500
                       bg-white shadow-sm transition"
            autoFocus
          />
          {buscando && (
            <div className="absolute right-4 top-4 text-gray-400">
              ⏳
            </div>
          )}
        </div>

      {/* Botón volver */}
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 flex items-center gap-1"
      >
        ← Volver al inicio
      </button>

        {/* Resultados de búsqueda */}
        {resultados.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100
                          overflow-hidden mb-6">
            {resultados.map(p => {
              const stock = p.inventario?.stock_actual ?? 0
              const sinStock = stock === 0

              return (
                <button
                  key={p.id}
                  onClick={() => !sinStock && agregarAlCarrito(p)}
                  disabled={sinStock}
                  className={`w-full flex items-center justify-between px-5 py-4
                              border-b border-gray-50 text-left transition
                              ${sinStock
                                ? 'opacity-40 cursor-not-allowed bg-gray-50'
                                : 'hover:bg-blue-50 cursor-pointer'}`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{p.nombre}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {p.codigo} · {p.categoria?.nombre}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-bold text-blue-600 text-lg">
                      S/ {parseFloat(p.precio_venta).toFixed(2)}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      sinStock
                        ? 'text-red-500'
                        : stock <= 5
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}>
                      {sinStock ? '❌ Sin stock' : `✓ Stock: ${stock}`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Estado vacío */}
        {busqueda && !buscando && resultados.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">🔍 Sin resultados para "{busqueda}"</p>
            <p className="text-sm mt-1">Intenta con otro nombre o código</p>
          </div>
        )}

        {!busqueda && (
          <div className="text-center text-gray-300 py-16">
            <p className="text-5xl mb-4">🔧</p>
            <p className="text-lg font-medium">Escribe para buscar productos</p>
          </div>
        )}
      </div>

      {/* ── PANEL DERECHO: CARRITO ── */}
      <div className="w-96 bg-white shadow-xl flex flex-col border-l border-gray-200">

        {/* Encabezado carrito */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              🛒 Carrito
            </h2>
            {carrito.length > 0 && (
              <button
                onClick={() => setCarrito([])}
                className="text-xs text-red-500 hover:text-red-700
                           font-medium transition"
              >
                Limpiar todo
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {carrito.length} producto(s)
          </p>
        </div>

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {carrito.length === 0 ? (
            <div className="text-center text-gray-300 py-12">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-sm">El carrito está vacío</p>
            </div>
          ) : (
            carrito.map(item => (
              <div key={item.producto_id}
                   className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-800 flex-1 pr-2">
                    {item.nombre}
                  </p>
                  <button
                    onClick={() => eliminarDelCarrito(item.producto_id)}
                    className="text-red-400 hover:text-red-600 text-xs
                               flex-shrink-0 transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {/* Control de cantidad */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300
                                 font-bold text-gray-600 transition flex items-center
                                 justify-center"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => cambiarCantidad(
                        item.producto_id,
                        parseInt(e.target.value) || 1
                      )}
                      min={1}
                      max={item.stock_max}
                      className="w-12 text-center border border-gray-300 rounded
                                 text-sm py-1 focus:outline-none focus:ring-1
                                 focus:ring-blue-400"
                    />
                    <button
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stock_max}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300
                                 disabled:opacity-40 font-bold text-gray-600
                                 transition flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  {/* Precio y subtotal */}
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      S/ {item.precio_unitario.toFixed(2)} c/u
                    </p>
                    <p className="font-bold text-blue-600">
                      S/ {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Alerta de stock máximo */}
                {item.cantidad >= item.stock_max && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Máximo disponible: {item.stock_max}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer con totales y acciones */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">

          {/* UI DE BUSCADOR DE CLIENTE AGREGADA JUSTO ENCIMA DEL DESCUENTO */}
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Cliente (opcional)</p>

            {clienteSeleccionado ? (
              <div className="flex items-center justify-between bg-blue-50
                              rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    👤 {clienteSeleccionado.nombre} {clienteSeleccionado.apellidos || ''}
                  </p>
                  <p className="text-xs text-blue-600 font-mono">
                    {clienteSeleccionado.tipo_documento}: {clienteSeleccionado.numero_documento}
                  </p>
                </div>
                <button
                  onClick={() => setClienteSeleccionado(null)}
                  className="text-blue-400 hover:text-blue-600 text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={busquedaCliente}
                  onChange={(e) => handleBusquedaCliente(e.target.value)}
                  placeholder="Buscar por DNI o nombre..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {resultadosCliente.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-1
                                  bg-white border border-gray-200 rounded-lg shadow-lg
                                  max-h-40 overflow-y-auto z-10">
                    {resultadosCliente.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => seleccionarCliente(c)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50
                                   text-sm border-b border-gray-50 last:border-0"
                      >
                        <p className="font-medium text-gray-800">
                          {c.nombre} {c.apellidos || ''}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {c.tipo_documento}: {c.numero_documento}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Descuento */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-600">
              Descuento %
              {usuario?.rol === 'Vendedor' && (
                <span className="text-xs text-gray-400 ml-1">(máx. 10%)</span>
              )}
            </label>
            <input
              type="number"
              value={descuento}
              onChange={(e) => {
                const val = Math.min(
                  parseFloat(e.target.value) || 0,
                  maxDescuento
                )
                setDescuento(val)
              }}
              min={0}
              max={maxDescuento}
              className="w-20 text-center border border-gray-300 rounded-lg
                         py-1.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-blue-400"
            />
          </div>

          {/* Método de pago */}
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetodoPago(m)}
                  className={`py-2 rounded-lg text-xs font-medium border-2 transition
                    ${metodoPago === m
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  {m === 'EFECTIVO'      ? '💵 Efectivo' :
                   m === 'YAPE'          ? '📱 Yape' :
                   m === 'PLIN'          ? '📲 Plin' :
                                           '🏦 Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {/* Resumen de totales */}
          <div className="space-y-1 border-t border-gray-100 pt-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            {descuentoVal > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento ({descuentoVal}%)</span>
                <span>− S/ {montoDescuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-800
                            border-t border-gray-200 pt-2 mt-2">
              <span>TOTAL</span>
              <span className="text-blue-600">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Error de venta */}
          {errorVenta && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-lg px-3 py-2 text-xs">
              ⚠️ {errorVenta}
            </div>
          )}

          {/* Botón confirmar */}
          <button
            onClick={confirmarVenta}
            disabled={carrito.length === 0 || confirmando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
                       text-white font-bold py-3.5 rounded-xl transition text-base"
          >
            {confirmando
              ? '⏳ Procesando...'
              : carrito.length === 0
                ? 'Agrega productos al carrito'
                : `✅ Confirmar venta · S/ ${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PosPage