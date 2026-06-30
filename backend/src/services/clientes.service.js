import { Op } from 'sequelize'
import { Cliente, Venta, DetalleVenta, Producto } from '../models/index.js'
import { calcularPaginacion, metadataPaginacion } from '../utils/paginacion.js'

// Validación de documentos peruanos
const validarDocumento = (tipo, numero) => {
  if (tipo === 'DNI') return /^\d{8}$/.test(numero)
  if (tipo === 'RUC') return /^\d{11}$/.test(numero)
  return false
}

export const clientesService = {

  // ── LISTAR CON BÚSQUEDA ──
  async listar({ search, page, limit }) {
    const { pagina, porPagina, offset } = calcularPaginacion(page, limit)

    const where = { activo: 1 }
    if (search) {
      where[Op.or] = [
        { nombre:           { [Op.like]: `%${search}%` } },
        { apellidos:        { [Op.like]: `%${search}%` } },
        { numero_documento: { [Op.like]: `%${search}%` } },
        { telefono:         { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows } = await Cliente.findAndCountAll({
      where,
      order: [['nombre', 'ASC']],
      limit: porPagina,
      offset
    })

    return {
      clientes:   rows,
      pagination: metadataPaginacion(count, pagina, porPagina)
    }
  },

  // ── OBTENER POR ID CON TOTAL ACUMULADO ──
  async obtenerPorId(id) {
    const cliente = await Cliente.findByPk(id)
    if (!cliente) {
      throw { mensaje: 'Cliente no encontrado', status: 404 }
    }

    // Calcular total acumulado de compras
    const ventas = await Venta.findAll({
      where: { cliente_id: id, estado: 'COMPLETADA' },
      attributes: ['total']
    })

    const totalAcumulado = ventas.reduce(
      (acc, v) => acc + parseFloat(v.total), 0
    )

    return {
      ...cliente.toJSON(),
      total_compras:    ventas.length,
      total_acumulado:  parseFloat(totalAcumulado.toFixed(2))
    }
  },

  // ── HISTORIAL DE COMPRAS ──
  async obtenerVentas(id, { page, limit }) {
    const { pagina, porPagina, offset } = calcularPaginacion(page, limit)

    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(id)
    if (!cliente) {
      throw { mensaje: 'Cliente no encontrado', status: 404 }
    }

    const { count, rows } = await Venta.findAndCountAll({
      where:   { cliente_id: id, estado: 'COMPLETADA' },
      include: [{
        model:   DetalleVenta,
        as:      'items',
        include: [{
          model:      Producto,
          as:         'producto',
          attributes: ['nombre', 'codigo']
        }]
      }],
      order:  [['fecha_venta', 'DESC']],
      limit:  porPagina,
      offset,
      distinct: true
    })

    // Total acumulado de todas las ventas (no solo la página)
    const todasLasVentas = await Venta.findAll({
      where:      { cliente_id: id, estado: 'COMPLETADA' },
      attributes: ['total']
    })
    const totalAcumulado = todasLasVentas.reduce(
      (acc, v) => acc + parseFloat(v.total), 0
    )

    return {
      ventas:          rows,
      pagination:      metadataPaginacion(count, pagina, porPagina),
      total_acumulado: parseFloat(totalAcumulado.toFixed(2))
    }
  },

  // ── CREAR CLIENTE ──
  async crear(datos) {
    const { nombre, tipo_documento, numero_documento,
            apellidos, telefono, email, direccion } = datos

    // Validar formato del documento
    if (!validarDocumento(tipo_documento, numero_documento)) {
      const longitud = tipo_documento === 'DNI' ? '8' : '11'
      throw {
        mensaje: `El ${tipo_documento} debe tener exactamente ${longitud} dígitos numéricos`,
        status:  400
      }
    }

    // Verificar unicidad del documento
    const existe = await Cliente.findOne({
      where:    { numero_documento },
      paranoid: false
    })
    if (existe) {
      throw {
        mensaje: `Ya existe un cliente con el documento ${numero_documento}`,
        status:  400
      }
    }

    return await Cliente.create({
      nombre, apellidos: apellidos || null,
      tipo_documento, numero_documento,
      telefono: telefono || null,
      email:    email    || null,
      direccion: direccion || null
    })
  },

  // ── EDITAR CLIENTE ──
  async editar(id, datos) {
    const cliente = await Cliente.findByPk(id)
    if (!cliente) {
      throw { mensaje: 'Cliente no encontrado', status: 404 }
    }

    // Si cambia el documento, revalidar
    if (datos.numero_documento &&
        datos.numero_documento !== cliente.numero_documento) {

      const tipo = datos.tipo_documento || cliente.tipo_documento
      if (!validarDocumento(tipo, datos.numero_documento)) {
        const longitud = tipo === 'DNI' ? '8' : '11'
        throw {
          mensaje: `El ${tipo} debe tener exactamente ${longitud} dígitos numéricos`,
          status:  400
        }
      }

      const existe = await Cliente.findOne({
        where:    { numero_documento: datos.numero_documento },
        paranoid: false
      })
      if (existe) {
        throw {
          mensaje: `Ya existe un cliente con el documento ${datos.numero_documento}`,
          status:  400
        }
      }
    }

    await cliente.update(datos)
    return cliente
  },

  // ── DESACTIVAR CLIENTE ──
  async desactivar(id) {
    const cliente = await Cliente.findByPk(id)
    if (!cliente) {
      throw { mensaje: 'Cliente no encontrado', status: 404 }
    }

    await cliente.update({ activo: 0 })
    await cliente.destroy()
    return { mensaje: 'Cliente desactivado correctamente' }
  }
}