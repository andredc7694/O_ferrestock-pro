import { Op } from 'sequelize'
import { Proveedor, Producto, Categoria, Inventario } from '../models/index.js'
import { calcularPaginacion, metadataPaginacion } from '../utils/paginacion.js'

// Validación de RUC peruano: exactamente 11 dígitos numéricos
const validarRUC = (ruc) => /^\d{11}$/.test(ruc)

export const proveedoresService = {

  // ── LISTAR CON BÚSQUEDA Y PAGINACIÓN ──
  async listar({ search, page, limit }) {
    const { pagina, porPagina, offset } = calcularPaginacion(page, limit)

    const where = {}
    if (search) {
      where[Op.or] = [
        { razon_social: { [Op.like]: `%${search}%` } },
        { ruc: { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows } = await Proveedor.findAndCountAll({
      where,
      order: [['razon_social', 'ASC']],
      limit: porPagina,
      offset
    })

    return {
      proveedores: rows,
      pagination: metadataPaginacion(count, pagina, porPagina)
    }
  },

  // ── OBTENER DETALLE CON PRODUCTOS ASOCIADOS ──
  async obtenerPorId(id) {
    const proveedor = await Proveedor.findByPk(id, {
      include: [{
        model: Producto,
        as: 'productos',
        where: { activo: 1 },
        required: false,
        include: [
          { model: Categoria, as: 'categoria', attributes: ['nombre'] },
          { model: Inventario, as: 'inventario', attributes: ['stock_actual'] }
        ]
      }]
    })

    if (!proveedor) {
      throw { mensaje: 'Proveedor no encontrado', status: 404 }
    }

    return proveedor
  },

  // ── CREAR PROVEEDOR ──
  async crear(datos) {
    const { razon_social, ruc, telefono, email, direccion, nombre_contacto } = datos

    // Validar RUC
    if (!validarRUC(ruc)) {
      throw { mensaje: 'El RUC debe tener exactamente 11 dígitos numéricos', status: 400 }
    }

    // Verificar RUC único
    const existe = await Proveedor.findOne({
      where: { ruc },
      paranoid: false
    })
    if (existe) {
      throw { mensaje: `Ya existe un proveedor con el RUC ${ruc}`, status: 400 }
    }

    return await Proveedor.create({
      razon_social, ruc, telefono,
      email: email || null,
      direccion: direccion || null,
      nombre_contacto: nombre_contacto || null
    })
  },

  // ── EDITAR PROVEEDOR ──
  async editar(id, datos) {
    const proveedor = await Proveedor.findByPk(id)
    if (!proveedor) {
      throw { mensaje: 'Proveedor no encontrado', status: 404 }
    }

    // Si cambia el RUC, validar formato y unicidad
    if (datos.ruc && datos.ruc !== proveedor.ruc) {
      if (!validarRUC(datos.ruc)) {
        throw { mensaje: 'El RUC debe tener exactamente 11 dígitos numéricos', status: 400 }
      }
      const existe = await Proveedor.findOne({
        where: { ruc: datos.ruc },
        paranoid: false
      })
      if (existe) {
        throw { mensaje: `Ya existe un proveedor con el RUC ${datos.ruc}`, status: 400 }
      }
    }

    await proveedor.update(datos)
    return proveedor
  },

  // ── DESACTIVAR PROVEEDOR ──
  async desactivar(id) {
    const proveedor = await Proveedor.findByPk(id)
    if (!proveedor) {
      throw { mensaje: 'Proveedor no encontrado', status: 404 }
    }

    await proveedor.update({ activo: 0 })
    await proveedor.destroy() // soft delete
    return { mensaje: 'Proveedor desactivado correctamente' }
  }
}