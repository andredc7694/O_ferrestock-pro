import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { proveedoresService } from '../../services/proveedores.service.js'

const ProveedorFormPage = () => {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState({
    razon_social:    '',
    ruc:             '',
    telefono:        '',
    email:           '',
    direccion:       '',
    nombre_contacto: ''
  })

  const [errores,          setErrores]          = useState({})
  const [loading,          setLoading]          = useState(false)
  const [cargandoDatos,    setCargandoDatos]    = useState(esEdicion)
  const [mensajeExito,     setMensajeExito]     = useState('')

  // Cargar datos si es edición
  useEffect(() => {
    if (!esEdicion) return
    const cargar = async () => {
      try {
        const res = await proveedoresService.obtener(id)
        const p   = res.data.data
        setForm({
          razon_social:    p.razon_social    || '',
          ruc:             p.ruc             || '',
          telefono:        p.telefono        || '',
          email:           p.email           || '',
          direccion:       p.direccion       || '',
          nombre_contacto: p.nombre_contacto || ''
        })
      } catch {
        alert('Error al cargar proveedor')
        navigate('/proveedores')
      } finally {
        setCargandoDatos(false)
      }
    }
    cargar()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  // Validación del RUC en tiempo real
  const validarRUC = (ruc) => /^\d{11}$/.test(ruc)

  const validar = () => {
    const nuevosErrores = {}

    if (!form.razon_social.trim())
      nuevosErrores.razon_social = 'La razón social es obligatoria'

    if (!form.ruc.trim())
      nuevosErrores.ruc = 'El RUC es obligatorio'
    else if (!validarRUC(form.ruc))
      nuevosErrores.ruc = 'El RUC debe tener exactamente 11 dígitos numéricos'

    if (!form.telefono.trim())
      nuevosErrores.telefono = 'El teléfono es obligatorio'

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nuevosErrores.email = 'El formato del email no es válido'

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    setLoading(true)
    try {
      if (esEdicion) {
        await proveedoresService.editar(id, form)
        setMensajeExito('Proveedor actualizado correctamente')
      } else {
        await proveedoresService.crear(form)
        setMensajeExito('Proveedor creado correctamente')
      }
      setTimeout(() => navigate('/proveedores'), 1500)
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al guardar proveedor'
      setErrores({ general: mensaje })
    } finally {
      setLoading(false)
    }
  }

  if (cargandoDatos) return (
    <div className="p-6 text-gray-400">⏳ Cargando proveedor...</div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {esEdicion ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {esEdicion
            ? 'Modifica los datos del proveedor'
            : 'Registra un nuevo proveedor en el sistema'}
        </p>
      </div>

      {/* Mensaje de éxito */}
      {mensajeExito && (
        <div className="mb-4 bg-green-50 border border-green-200
                        text-green-700 rounded-lg px-4 py-3">
          ✅ {mensajeExito}
        </div>
      )}

      {/* Error general */}
      {errores.general && (
        <div className="mb-4 bg-red-50 border border-red-200
                        text-red-700 rounded-lg px-4 py-3">
          ❌ {errores.general}
        </div>
      )}

      <form onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 space-y-5">

        {/* Razón Social */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razón Social <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="razon_social"
            value={form.razon_social}
            onChange={handleChange}
            placeholder="Ej: Distribuidora Ferretera SAC"
            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                        focus:ring-2 focus:ring-blue-500 transition
                        ${errores.razon_social ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errores.razon_social && (
            <p className="text-red-500 text-xs mt-1">{errores.razon_social}</p>
          )}
        </div>

        {/* RUC y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RUC <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ruc"
              value={form.ruc}
              onChange={handleChange}
              maxLength={11}
              placeholder="20601234567"
              className={`w-full border rounded-lg px-4 py-2.5 font-mono
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                          ${errores.ruc ? 'border-red-400' : 'border-gray-300'}`}
            />
            {/* Indicador visual en tiempo real */}
            {form.ruc && (
              <p className={`text-xs mt-1 ${
                validarRUC(form.ruc) ? 'text-green-600' : 'text-orange-500'
              }`}>
                {validarRUC(form.ruc)
                  ? '✓ RUC válido'
                  : `${form.ruc.length}/11 dígitos`}
              </p>
            )}
            {errores.ruc && (
              <p className="text-red-500 text-xs mt-1">{errores.ruc}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="066-312000"
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                          focus:ring-2 focus:ring-blue-500 transition
                          ${errores.telefono ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errores.telefono && (
              <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ventas@proveedor.com"
            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                        focus:ring-2 focus:ring-blue-500 transition
                        ${errores.email ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errores.email && (
            <p className="text-red-500 text-xs mt-1">{errores.email}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Av. Lima 123, Ayacucho"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Nombre del contacto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del contacto principal
          </label>
          <input
            type="text"
            name="nombre_contacto"
            value={form.nombre_contacto}
            onChange={handleChange}
            placeholder="Ej: Juan Quispe"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading
              ? '⏳ Guardando...'
              : esEdicion ? 'Actualizar proveedor' : 'Crear proveedor'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/proveedores')}
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

export default ProveedorFormPage