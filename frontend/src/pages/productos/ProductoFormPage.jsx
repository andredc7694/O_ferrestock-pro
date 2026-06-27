import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productosService } from '../../services/productos.service.js'
import { useCategorias } from '../../hooks/useCategorias.js'

const ProductoFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const { categorias } = useCategorias()

  const [unidades] = useState([
    { id: 1, nombre: 'Unidad', abreviatura: 'und' },
    { id: 2, nombre: 'Metro', abreviatura: 'm' },
    { id: 3, nombre: 'Metro cuadrado', abreviatura: 'm2' },
    { id: 4, nombre: 'Litro', abreviatura: 'lt' },
    { id: 5, nombre: 'Kilogramo', abreviatura: 'kg' },
    { id: 6, nombre: 'Caja', abreviatura: 'caj' },
    { id: 7, nombre: 'Rollo', abreviatura: 'roll' },
    { id: 8, nombre: 'Par', abreviatura: 'par' },
    { id: 9, nombre: 'Juego', abreviatura: 'jgo' },
    { id: 10, nombre: 'Bolsa', abreviatura: 'bol' }
  ])

  const [form, setForm] = useState({
    codigo: '', nombre: '', descripcion: '',
    categoria_id: '', unidad_medida_id: '',
    precio_compra: '', precio_venta: '', stock_minimo: '0'
  })

  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)
  const [cargandoProducto, setCargandoProducto] = useState(esEdicion)
  const [mensajeExito, setMensajeExito] = useState('')

  // Si es edición, cargar los datos del producto
  useEffect(() => {
    if (esEdicion) {
      const cargar = async () => {
        try {
          const res = await productosService.obtener(id)
          const p = res.data.data
          setForm({
            codigo: p.codigo || '',
            nombre: p.nombre || '',
            descripcion: p.descripcion || '',
            categoria_id: p.categoria_id || '',
            unidad_medida_id: p.unidad_medida_id || '',
            precio_compra: p.precio_compra || '',
            precio_venta: p.precio_venta || '',
            stock_minimo: p.stock_minimo ?? 0
          })
        } catch (err) {
          alert('Error al cargar el producto')
          navigate('/productos')
        } finally {
          setCargandoProducto(false)
        }
      }
      cargar()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido'
    if (!form.categoria_id) nuevosErrores.categoria_id = 'Selecciona una categoría'
    if (!form.unidad_medida_id) nuevosErrores.unidad_medida_id = 'Selecciona una unidad'
    if (!form.precio_compra) nuevosErrores.precio_compra = 'El precio de compra es requerido'
    if (!form.precio_venta) nuevosErrores.precio_venta = 'El precio de venta es requerido'

    if (form.precio_compra && form.precio_venta) {
      if (parseFloat(form.precio_venta) < parseFloat(form.precio_compra)) {
        nuevosErrores.precio_venta = 'El precio de venta no puede ser menor al precio de compra'
      }
    }

    if (parseInt(form.stock_minimo) < 0) {
      nuevosErrores.stock_minimo = 'El stock mínimo no puede ser negativo'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    setLoading(true)
    try {
      if (esEdicion) {
        await productosService.editar(id, form)
        setMensajeExito('Producto actualizado correctamente')
      } else {
        await productosService.crear(form)
        setMensajeExito('Producto creado correctamente')
      }
      setTimeout(() => navigate('/productos'), 1500)
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al guardar el producto'
      setErrores({ general: mensaje })
    } finally {
      setLoading(false)
    }
  }

  if (cargandoProducto) return (
    <div className="p-6 text-gray-400">⏳ Cargando producto...</div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {esEdicion ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {esEdicion ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
        </p>
      </div>

      {mensajeExito && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700
                        rounded-lg px-4 py-3">
          ✅ {mensajeExito}
        </div>
      )}

      {errores.general && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700
                        rounded-lg px-4 py-3">
          ❌ {errores.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">

        {/* Código — solo visible en edición (inmutable) */}
        {esEdicion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código (no modificable)
            </label>
            <input
              type="text"
              value={form.codigo}
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                         bg-gray-50 text-gray-400 font-mono cursor-not-allowed"
            />
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Martillo carpintero 16oz"
            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                        focus:ring-2 focus:ring-blue-500 transition
                        ${errores.nombre ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción opcional del producto..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Categoría y Unidad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                          focus:ring-2 focus:ring-blue-500 transition
                          ${errores.categoria_id ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Seleccionar...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            {errores.categoria_id && <p className="text-red-500 text-xs mt-1">{errores.categoria_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidad de medida <span className="text-red-500">*</span>
            </label>
            <select
              name="unidad_medida_id"
              value={form.unidad_medida_id}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                          focus:ring-2 focus:ring-blue-500 transition
                          ${errores.unidad_medida_id ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Seleccionar...</option>
              {unidades.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>
              ))}
            </select>
            {errores.unidad_medida_id && <p className="text-red-500 text-xs mt-1">{errores.unidad_medida_id}</p>}
          </div>
        </div>

        {/* Precios */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio de compra (S/) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="precio_compra"
              value={form.precio_compra}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                          focus:ring-2 focus:ring-blue-500 transition
                          ${errores.precio_compra ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errores.precio_compra && <p className="text-red-500 text-xs mt-1">{errores.precio_compra}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio de venta (S/) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="precio_venta"
              value={form.precio_venta}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                          focus:ring-2 focus:ring-blue-500 transition
                          ${errores.precio_venta ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errores.precio_venta && <p className="text-red-500 text-xs mt-1">{errores.precio_venta}</p>}
          </div>
        </div>

        {/* Stock mínimo */}
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock mínimo
          </label>
          <input
            type="number"
            name="stock_minimo"
            value={form.stock_minimo}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                        focus:ring-2 focus:ring-blue-500 transition
                        ${errores.stock_minimo ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errores.stock_minimo && <p className="text-red-500 text-xs mt-1">{errores.stock_minimo}</p>}
          <p className="text-gray-400 text-xs mt-1">
            Alerta cuando el stock baje de este número
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? '⏳ Guardando...' : (esEdicion ? 'Actualizar producto' : 'Crear producto')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/productos')}
            className="px-6 border border-gray-300 text-gray-600 hover:bg-gray-50
                       font-medium py-2.5 rounded-lg transition"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  )
}

export default ProductoFormPage