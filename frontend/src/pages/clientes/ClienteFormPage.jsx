import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { clientesService } from '../../services/clientes.service.js'

const ClienteFormPage = () => {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState({
    nombre: '', apellidos: '', tipo_documento: 'DNI',
    numero_documento: '', telefono: '', email: '', direccion: ''
  })

  const [errores,       setErrores]       = useState({})
  const [loading,       setLoading]       = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(esEdicion)
  const [mensajeExito,  setMensajeExito]  = useState('')

  // Cargar datos si es edición
  useEffect(() => {
    if (!esEdicion) return
    const cargar = async () => {
      try {
        const res = await clientesService.obtener(id)
        const c   = res.data.data
        setForm({
          nombre:           c.nombre           || '',
          apellidos:        c.apellidos        || '',
          tipo_documento:   c.tipo_documento   || 'DNI',
          numero_documento: c.numero_documento || '',
          telefono:         c.telefono         || '',
          email:            c.email            || '',
          direccion:        c.direccion        || ''
        })
      } catch {
        alert('Error al cargar cliente')
        navigate('/clientes')
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

  // Validación del documento en tiempo real
  const validarDoc = (tipo, numero) => {
    if (tipo === 'DNI') return /^\d{8}$/.test(numero)
    if (tipo === 'RUC') return /^\d{11}$/.test(numero)
    return false
  }

  const longitudDoc = form.tipo_documento === 'DNI' ? 8 : 11

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())
      e.nombre = 'El nombre es obligatorio'
    if (!form.numero_documento.trim())
      e.numero_documento = 'El número de documento es obligatorio'
    else if (!validarDoc(form.tipo_documento, form.numero_documento))
      e.numero_documento =
        `El ${form.tipo_documento} debe tener exactamente ${longitudDoc} dígitos numéricos`
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'El formato del email no es válido'

    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validar()) return

    setLoading(true)
    try {
      if (esEdicion) {
        await clientesService.editar(id, form)
        setMensajeExito('Cliente actualizado correctamente')
      } else {
        await clientesService.crear(form)
        setMensajeExito('Cliente creado correctamente')
      }
      setTimeout(() => navigate('/clientes'), 1500)
    } catch (err) {
      setErrores({
        general: err.response?.data?.message || 'Error al guardar cliente'
      })
    } finally {
      setLoading(false)
    }
  }

  if (cargandoDatos) return (
    <div className="p-6 text-gray-400">⏳ Cargando cliente...</div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {esEdicion ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {esEdicion
            ? 'Modifica los datos del cliente'
            : 'Registra un nuevo cliente en el sistema'}
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

        {/* Nombre y Apellidos */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="nombre"
              value={form.nombre} onChange={handleChange}
              placeholder="Ej: Juan"
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                          focus:ring-2 focus:ring-blue-500 transition
                          ${errores.nombre ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errores.nombre && (
              <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos
            </label>
            <input
              type="text" name="apellidos"
              value={form.apellidos} onChange={handleChange}
              placeholder="Ej: Quispe Flores"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Tipo y Número de Documento */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de documento <span className="text-red-500">*</span>
            </label>
            <select
              name="tipo_documento"
              value={form.tipo_documento} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="DNI">DNI (8 dígitos)</option>
              <option value="RUC">RUC (11 dígitos)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="numero_documento"
              value={form.numero_documento} onChange={handleChange}
              maxLength={longitudDoc}
              placeholder={form.tipo_documento === 'DNI' ? '12345678' : '20601234567'}
              className={`w-full border rounded-lg px-4 py-2.5 font-mono
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                          ${errores.numero_documento ? 'border-red-400' : 'border-gray-300'}`}
            />
            {/* Indicador visual en tiempo real */}
            {form.numero_documento && (
              <p className={`text-xs mt-1 ${
                validarDoc(form.tipo_documento, form.numero_documento)
                  ? 'text-green-600'
                  : 'text-orange-500'
              }`}>
                {validarDoc(form.tipo_documento, form.numero_documento)
                  ? `✓ ${form.tipo_documento} válido`
                  : `${form.numero_documento.length}/${longitudDoc} dígitos`}
              </p>
            )}
            {errores.numero_documento && (
              <p className="text-red-500 text-xs mt-1">{errores.numero_documento}</p>
            )}
          </div>
        </div>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="text" name="telefono"
              value={form.telefono} onChange={handleChange}
              placeholder="987654321"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="cliente@email.com"
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none
                          focus:ring-2 focus:ring-blue-500 transition
                          ${errores.email ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errores.email && (
              <p className="text-red-500 text-xs mt-1">{errores.email}</p>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text" name="direccion"
            value={form.direccion} onChange={handleChange}
            placeholder="Jr. Lima 123, Ayacucho"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading
              ? '⏳ Guardando...'
              : esEdicion ? 'Actualizar cliente' : 'Crear cliente'}
          </button>
          <button
            type="button" onClick={() => navigate('/clientes')}
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

export default ClienteFormPage