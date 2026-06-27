import { Op } from 'sequelize'
import sequelize from '../config/database.js'
import { Producto, Categoria, UnidadMedida, Proveedor, Inventario } from '../models/index.js'
import { generarCodigoProducto } from '../utils/generadores.js'
import { calcularPaginacion, metadataPaginacion } from '../utils/paginacion.js'

// Calcula el estado del stock de un producto
const calcularEstadoStock = (stockActual, stockMinimo) => {
  if (stockActual === 0) return 'SIN_STOCK'
  if (stockActual <= stockMinimo) return 'CRITICO'
  return 'NORMAL'
}

// Includes reutilizables para los JOINs
const includesBase = [
  { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
  { model: UnidadMedida, as: 'unidad_medida', attributes: ['id', 'nombre', 'abreviatura'] },
  { model: Inventario, as: 'inventario', attributes: ['stock_actual'] },
  { model: Proveedor, as: 'proveedor', attributes: ['id', 'razon_social'], required: false }
]

export const productosService = {

  async listar({ search, categoria_id, page, limit }) {
    const { pagina, porPagina, offset } = calcularPaginacion(page, limit)

    // Construir filtros dinámicamente
    const where = { activo: 1 }

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { codigo: { [Op.like]: `%${search}%` } }
      ]
    }

    if (categoria_id) {
      where.categoria_id = categoria_id
    }

    const { count, rows } = await Producto.findAndCountAll({
      where,
      include: includesBase,
      limit: porPagina,
      offset,
      order: [['nombre', 'ASC']],
      distinct: true
    })

    // Agregar estado_stock a cada producto
    const productos = rows.map(p => {
      const producto = p.toJSON()
      const stockActual = producto.inventario?.stock_actual ?? 0
      producto.estado_stock = calcularEstadoStock(stockActual, producto.stock_minimo)
      return producto
    })

    return {
      productos,
      pagination: metadataPaginacion(count, pagina, porPagina)
    }
  },

  async obtenerPorId(id) {
    const producto = await Producto.findByPk(id, { include: includesBase })
    if (!producto) {
      throw { mensaje: 'Producto no encontrado', status: 404 }
    }
    const prod = producto.toJSON()
    prod.estado_stock = calcularEstadoStock(
      prod.inventario?.stock_actual ?? 0,
      prod.stock_minimo
    )
    return prod
  },

  async crear(datos) {
    const {
      categoria_id, unidad_medida_id, proveedor_id,
      codigo, nombre, descripcion,
      precio_compra, precio_venta, stock_minimo
    } = datos

    // Validar precio
    if (parseFloat(precio_venta) < parseFloat(precio_compra)) {
      throw { mensaje: 'El precio de venta no puede ser menor al precio de compra', status: 400 }
    }

    // Validar stock mínimo
    if (parseInt(stock_minimo) < 0) {
      throw { mensaje: 'El stock mínimo no puede ser negativo', status: 400 }
    }

    // Determinar el código a usar
    let codigoFinal = codigo
    if (!codigoFinal) {
      codigoFinal = await generarCodigoProducto(categoria_id)
    } else {
      // Verificar que el código manual no exista
      const existeCodigo = await Producto.findOne({
        where: { codigo: codigoFinal },
        paranoid: false
      })
      if (existeCodigo) {
        throw { mensaje: `El código "${codigoFinal}" ya está en uso`, status: 400 }
      }
    }

    // Crear producto e inventario en una transacción atómica
    const resultado = await sequelize.transaction(async (t) => {
      const producto = await Producto.create({
        categoria_id, unidad_medida_id, proveedor_id: proveedor_id || null,
        codigo: codigoFinal, nombre, descripcion,
        precio_compra, precio_venta, stock_minimo: stock_minimo || 0
      }, { transaction: t })

      // Crear el registro de inventario con stock 0
      await Inventario.create({
        producto_id: producto.id,
        stock_actual: 0
      }, { transaction: t })

      return producto
    })

    return await this.obtenerPorId(resultado.id)
  },

  async editar(id, datos) {
    const producto = await Producto.findByPk(id)
    if (!producto) {
      throw { mensaje: 'Producto no encontrado', status: 404 }
    }

    // No permitir cambiar el código
    delete datos.codigo

    // Validar precio si se están actualizando
    const precioVenta = datos.precio_venta ?? producto.precio_venta
    const precioCompra = datos.precio_compra ?? producto.precio_compra
    if (parseFloat(precioVenta) < parseFloat(precioCompra)) {
      throw { mensaje: 'El precio de venta no puede ser menor al precio de compra', status: 400 }
    }

    await producto.update(datos)
    return await this.obtenerPorId(id)
  },

  async desactivar(id) {
    const producto = await Producto.findByPk(id)
    if (!producto) {
      throw { mensaje: 'Producto no encontrado', status: 404 }
    }

    await producto.update({ activo: 0 })
    await producto.destroy() // soft delete
    return { mensaje: 'Producto desactivado correctamente' }
  }
}