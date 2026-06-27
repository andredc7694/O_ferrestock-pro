import { Op } from 'sequelize'
import sequelize from '../config/database.js'
import {
  Venta, DetalleVenta, Producto, Inventario,
  MovimientoInventario, Cliente, Usuario
} from '../models/index.js'
import { generarNumeroVenta } from '../utils/generadores.js'
import { calcularPaginacion, metadataPaginacion } from '../utils/paginacion.js'

// Includes para obtener venta con todos sus datos
const includesVenta = [
  { model: Cliente,  as: 'cliente',  attributes: ['id','nombre','apellidos','numero_documento'], required: false },
  { model: Usuario,  as: 'vendedor', attributes: ['id','nombre','apellidos'] },
  {
    model: DetalleVenta, as: 'items',
    include: [{
      model: Producto, as: 'producto',
      attributes: ['id','codigo','nombre']
    }]
  }
]

export const ventasService = {

  // ── REGISTRAR VENTA (TRANSACCIÓN ATÓMICA) ──
  async registrar({ cliente_id, items, porcentaje_desc = 0, metodo_pago, observaciones }, vendedorId) {

    // 1. Validar que hay items
    if (!items || items.length === 0) {
      throw { mensaje: 'El carrito no puede estar vacío', status: 400 }
    }

    // 2. Validar cada producto y stock ANTES de iniciar la transacción
    const itemsValidados = []
    for (const item of items) {
      const producto = await Producto.findByPk(item.producto_id, {
        include: [{ model: Inventario, as: 'inventario' }]
      })

      if (!producto || !producto.activo) {
        throw {
          mensaje: `Producto no encontrado o inactivo (ID: ${item.producto_id})`,
          status: 400
        }
      }

      const stockDisponible = producto.inventario?.stock_actual ?? 0
      if (item.cantidad > stockDisponible) {
        throw {
          mensaje: `Stock insuficiente para "${producto.nombre}". Disponible: ${stockDisponible}, solicitado: ${item.cantidad}`,
          status: 400,
          codigo: 'STOCK_INSUFICIENTE'
        }
      }

      const subtotalItem = parseFloat(item.precio_unitario) * parseInt(item.cantidad)
      itemsValidados.push({
        producto_id:     producto.id,
        cantidad:        parseInt(item.cantidad),
        precio_unitario: parseFloat(item.precio_unitario),
        subtotal:        subtotalItem,
        inventario:      producto.inventario
      })
    }

    // 3. Calcular totales
    const subtotal       = itemsValidados.reduce((acc, i) => acc + i.subtotal, 0)
    const descuento      = parseFloat(porcentaje_desc) || 0
    const montoDescuento = parseFloat((subtotal * descuento / 100).toFixed(2))
    const total          = parseFloat((subtotal - montoDescuento).toFixed(2))

    // 4. Generar número de venta
    const numeroVenta = await generarNumeroVenta()

    // 5. TRANSACCIÓN ATÓMICA
    const venta = await sequelize.transaction(async (t) => {

      // a. Crear la venta
      const nuevaVenta = await Venta.create({
        cliente_id:      cliente_id || null,
        vendedor_id:     vendedorId,
        numero_venta:    numeroVenta,
        subtotal:        subtotal.toFixed(2),
        porcentaje_desc: descuento,
        monto_descuento: montoDescuento,
        total:           total,
        metodo_pago:     metodo_pago || 'EFECTIVO',
        estado:          'COMPLETADA',
        observaciones:   observaciones || null
      }, { transaction: t })

      // b. Crear detalles y descontar stock
      for (const item of itemsValidados) {
        // Crear detalle de venta
        await DetalleVenta.create({
          venta_id:        nuevaVenta.id,
          producto_id:     item.producto_id,
          cantidad:        item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal:        item.subtotal
        }, { transaction: t })

        // Descontar stock en inventario
        const stockAntes   = item.inventario.stock_actual
        const stockDespues = stockAntes - item.cantidad

        await item.inventario.update(
          { stock_actual: stockDespues },
          { transaction: t }
        )

        // Registrar movimiento SALIDA
        await MovimientoInventario.create({
          producto_id:   item.producto_id,
          usuario_id:    vendedorId,
          venta_id:      nuevaVenta.id,
          tipo:          'SALIDA',
          cantidad:      item.cantidad,
          stock_antes:   stockAntes,
          stock_despues: stockDespues,
          motivo:        `Venta ${numeroVenta}`
        }, { transaction: t })
      }

      return nuevaVenta
    })

    // 6. Devolver la venta completa
    return await Venta.findByPk(venta.id, { include: includesVenta })
  },

  // ── LISTAR VENTAS CON FILTROS ──
  async listar({ fecha_inicio, fecha_fin, metodo_pago, vendedor_id, page, limit }, usuarioActual) {
    const { pagina, porPagina, offset } = calcularPaginacion(page, limit)

    const where = { estado: 'COMPLETADA' }

    // Vendedor solo ve sus propias ventas
    if (usuarioActual.rol === 'Vendedor') {
      where.vendedor_id = usuarioActual.id
    } else if (vendedor_id) {
      where.vendedor_id = vendedor_id
    }

    if (metodo_pago) where.metodo_pago = metodo_pago

    if (fecha_inicio || fecha_fin) {
      where.fecha_venta = {}
      if (fecha_inicio) where.fecha_venta[Op.gte] = new Date(fecha_inicio)
      if (fecha_fin) {
        const fin = new Date(fecha_fin)
        fin.setHours(23, 59, 59, 999)
        where.fecha_venta[Op.lte] = fin
      }
    }

    const { count, rows } = await Venta.findAndCountAll({
      where,
      include: [
        { model: Cliente,  as: 'cliente',  attributes: ['nombre','apellidos'], required: false },
        { model: Usuario,  as: 'vendedor', attributes: ['nombre','apellidos'] }
      ],
      order: [['fecha_venta', 'DESC']],
      limit: porPagina,
      offset,
      distinct: true
    })

    return {
      ventas: rows,
      pagination: metadataPaginacion(count, pagina, porPagina)
    }
  },

  // ── OBTENER VENTA POR ID ──
  async obtenerPorId(id) {
    const venta = await Venta.findByPk(id, { include: includesVenta })
    if (!venta) {
      throw { mensaje: 'Venta no encontrada', status: 404 }
    }
    return venta
  }
}