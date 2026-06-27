import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { inventarioService } from '../../services/inventario.service.js'
import { productosService } from '../../services/productos.service.js'

const MovimientoFormPage = () => {
  const navigate = useNavigate()

  const [productos, setProductos] = useState([])
  const [stockActual, setStockActual] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    producto_id: '',
    tipo: 'ENTRADA',
    cantidad: '',
    motivo: ''
  })

  // Cargar todos los productos al montar
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await productosService.listar({ limit: 100 })
        setProductos(res.data.data)
      } catch (err) {
        console.error('Error al cargar productos:', err)
      }
    }
    cargar()
  }, [])

  // Cuando cambia el producto, cargar su stock actual
  useEffect(() => {
    if (!form.producto_id) {
      setStockActual(null)
      return
    }
    const cargarStock = async () => {
      try {
        const res = await inventarioService.obtenerStock()
        const item = res.data.data.find(
          p => p.producto_id === parseInt(form.producto_id)
        )
        setStockActual(item?.stock_actual ?? 0)
      } catch (err) {
        setStockActual(null)
      }
    }
    cargarStock()
  }, [form.producto_id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!form.producto_id) nuevosErrores.producto_id = 'Selecciona un producto'
    if (!form.tipo) nuevosErrores.tipo = 'Selecciona el tipo de movimiento'
    if (!form.cantidad || parseInt(form.cantidad) <= 0) {
      nuevosErrores.cantidad = 'La cantidad debe ser mayor a cero'
    }
    if (['SALIDA', 'AJUSTE'].includes(form.tipo) && !form.motivo.trim()) {
      nuevosErrores.motivo = 'El motivo es obligatorio para salidas y ajustes'
    }
    if (['SALIDA', 'AJUSTE'].includes(form.tipo) && stockActual !== null) {
      if (parseInt(form.cantidad) > stockActual) {
        nuevosErrores.cantidad =
          `Stock insuficiente. Disponible: ${stockActual}`
      }
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    setLoading(true)
    try {
      await inventarioService.registrarMovimiento({
        producto_id: parseInt(form.producto_id),
        tipo: form.tipo,
        cantidad: parseInt(form.cantidad),
        motivo: form.motivo
      })
      setMensajeExito('Movimiento registrado correctamente')
      setTimeout(() => navigate('/inventario'), 1500)
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al registrar movimiento'
      setErrores({ general: mensaje })
    } finally {
      setLoading(false)
    }
  }

  // Si es SALIDA o AJUSTE, ¿hay suficiente stock?
  const stockInsuficiente = ['SALIDA', 'AJUSTE'].includes(form.tipo) &&
    stockActual !== null &&
    parseInt(form.cantidad) > stockActual

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          📋 Registrar Movimiento
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Registra una entrada, salida o ajuste de inventario
        </p>
      </div>

      {mensajeExito && (
        <div className="mb-4 bg-green-50 border border-green-200
                        text-green-700 rounded-lg px-4 py-3">
          ✅ {mensajeExito}
        </div>
      )}

      {errores.general && (
        <div className="mb-4 bg-red-50 border border-red-200
                        text-red-700 rounded-lg px-4 py-3">
          ❌ {errores.general}
        </div>
      )}

      <form onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 space-y-5">

        {/* Producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Producto <span className="text-red-500">*</span>
          </label>
          <select
            name="producto_id"
            value={form.producto_id}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                        focus:ring-2 focus:ring-blue-500 transition
                        ${errores.producto_id ? 'border-red-400' : 'border-gray-300'}`}
          >
            <option value="">Seleccionar producto...</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                [{p.codigo}] {p.nombre}
              </option>
            ))}
          </select>
          {errores.producto_id &&
            <p className="text-red-500 text-xs mt-1">{errores.producto_id}</p>}

          {/* Stock actual del producto seleccionado */}
          {form.producto_id && stockActual !== null && (
            <div className={`mt-2 text-sm px-3 py-2 rounded-lg
              ${stockActual === 0
                ? 'bg-red-50 text-red-700'
                : stockActual <= 5
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-green-50 text-green-700'}`}>
              📦 Stock actual: <strong>{stockActual} unidades</strong>
            </div>
          )}
        </div>

        {/* Tipo de movimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de movimiento <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { valor: 'ENTRADA', emoji: '⬆️', color: 'border-blue-500 bg-blue-50 text-blue-700' },
              { valor: 'SALIDA', emoji: '⬇️', color: 'border-orange-500 bg-orange-50 text-orange-700' },
              { valor: 'AJUSTE', emoji: '🔧', color: 'border-purple-500 bg-purple-50 text-purple-700' },
              { valor: 'DEVOLUCION', emoji: '↩️', color: 'border-green-500 bg-green-50 text-green-700' }
            ].map(({ valor, emoji, color }) => (
              <button
                key={valor}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, tipo: valor }))}
                className={`py-2.5 px-4 rounded-lg border-2 font-medium text-sm
                            transition cursor-pointer
                            ${form.tipo === valor
                              ? color
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                {emoji} {valor}
              </button>
            ))}
          </div>
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            min="1"
            placeholder="0"
            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                        focus:ring-2 focus:ring-blue-500 transition
                        ${errores.cantidad || stockInsuficiente
                          ? 'border-red-400'
                          : 'border-gray-300'}`}
          />
          {errores.cantidad &&
            <p className="text-red-500 text-xs mt-1">{errores.cantidad}</p>}
          {stockInsuficiente && !errores.cantidad && (
            <p className="text-red-500 text-xs mt-1">
              ⚠️ La cantidad supera el stock disponible ({stockActual})
            </p>
          )}
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo
            {['SALIDA', 'AJUSTE'].includes(form.tipo) &&
              <span className="text-red-500"> * (obligatorio)</span>}
          </label>
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            rows={3}
            placeholder={
              form.tipo === 'ENTRADA' ? 'Ej: Compra a proveedor - Factura 001-0123' :
              form.tipo === 'SALIDA' ? 'Ej: Producto dañado, muestra de cliente...' :
              form.tipo === 'AJUSTE' ? 'Ej: Corrección de inventario físico...' :
              'Ej: Devolución de cliente - Venta VTA-2025-0001'
            }
            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                        focus:ring-2 focus:ring-blue-500 transition
                        ${errores.motivo ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errores.motivo &&
            <p className="text-red-500 text-xs mt-1">{errores.motivo}</p>}
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || stockInsuficiente}
            className="flex-1 bg-blue-600 hover:bg-blue-700
                       disabled:bg-blue-300 text-white font-semibold
                       py-2.5 rounded-lg transition"
          >
            {loading ? '⏳ Registrando...' : '✅ Registrar movimiento'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventario')}
            className="px-6 border border-gray-300 text-gray-600
                       hover:bg-gray-50 font-medium py-2.5 rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default MovimientoFormPage