import { Op } from 'sequelize'
import sequelize from '../config/database.js'
import {
  Inventario, Producto, Categoria,
  Proveedor, MovimientoInventario, Usuario
} from '../models/index.js'
import { calcularPaginacion, metadataPaginacion } from '../utils/paginacion.js'

// Calcula el estado del stock
const calcularEstado = (stockActual, stockMinimo) => {
  if (stockActual === 0) return 'SIN_STOCK'
  if (stockActual <= stockMinimo) return 'CRITICO'
  return 'NORMAL'
}

export const inventarioService = {

  // ── OBTENER STOCK ACTUAL DE TODOS LOS PRODUCTOS ──
  async obtenerStock() {
    const registros = await Inventario.findAll({
      include: [{
        model: Producto,
        as: 'producto',
        where: { activo: 1 },
        include: [
          { model: Categoria, as: 'categoria', attributes: ['nombre'] },
          {
            model: Proveedor,
            as: 'proveedor',
            attributes: ['razon_social', 'telefono'],
            required: false
          }
        ]
      }],
      order: [[{ model: Producto, as: 'producto' }, 'nombre', 'ASC']]
    })

    return registros.map(reg => {
      const r = reg.toJSON()
      return {
        producto_id: r.producto.id,
        codigo: r.producto.codigo,
        nombre: r.producto.nombre,
        categoria: r.producto.categoria?.nombre,
        stock_actual: r.stock_actual,
        stock_minimo: r.producto.stock_minimo,
        estado_stock: calcularEstado(r.stock_actual, r.producto.stock_minimo),
        proveedor: r.producto.proveedor?.razon_social || null,
        telefono_proveedor: r.producto.proveedor?.telefono || null
      }
    })
  },

  // ── OBTENER ALERTAS DE STOCK CRÍTICO ──
  async obtenerAlertas() {
    const registros = await Inventario.findAll({
      include: [{
        model: Producto,
        as: 'producto',
        where: { activo: 1 },
        include: [{
          model: Proveedor,
          as: 'proveedor',
          attributes: ['razon_social', 'telefono'],
          required: false
        }]
      }]
    })

    // Filtrar solo los críticos y sin stock
    return registros
      .filter(reg => reg.stock_actual <= reg.producto.stock_minimo)
      .map(reg => {
        const r = reg.toJSON()
        return {
          producto_id: r.producto.id,
          codigo: r.producto.codigo,
          nombre: r.producto.nombre,
          stock_actual: r.stock_actual,
          stock_minimo: r.producto.stock_minimo,
          estado_stock: calcularEstado(r.stock_actual, r.producto.stock_minimo),
          proveedor: r.producto.proveedor?.razon_social || 'Sin proveedor asignado',
          telefono_proveedor: r.producto.proveedor?.telefono || null
        }
      })
  },

  // ── OBTENER HISTORIAL DE MOVIMIENTOS ──
  async obtenerMovimientos({ producto_id, tipo, fecha_inicio, fecha_fin, page, limit }) {
    const { pagina, porPagina, offset } = calcularPaginacion(page, limit)

    // Construir filtros dinámicamente
    const where = {}

    if (producto_id) where.producto_id = producto_id
    if (tipo) where.tipo = tipo

    if (fecha_inicio || fecha_fin) {
      where.created_at = {}
      if (fecha_inicio) where.created_at[Op.gte] = new Date(fecha_inicio)
      if (fecha_fin) {
        const fin = new Date(fecha_fin)
        fin.setHours(23, 59, 59, 999)
        where.created_at[Op.lte] = fin
      }
    }

    const { count, rows } = await MovimientoInventario.findAndCountAll({
      where,
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'codigo', 'nombre']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellidos']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: porPagina,
      offset
    })

    return {
      movimientos: rows.map(m => m.toJSON()),
      pagination: metadataPaginacion(count, pagina, porPagina)
    }
  },

  // ── REGISTRAR MOVIMIENTO (TRANSACCIÓN ATÓMICA) ──
  async registrarMovimiento({ producto_id, tipo, cantidad, motivo }, usuarioId) {

    // 1. Validar que la cantidad sea positiva
    if (cantidad <= 0) {
      throw { mensaje: 'La cantidad debe ser mayor a cero', status: 400 }
    }

    // 2. Validar motivo obligatorio para salidas y ajustes
    if (['SALIDA', 'AJUSTE'].includes(tipo) && !motivo?.trim()) {
      throw { mensaje: 'El motivo es obligatorio para salidas y ajustes', status: 400 }
    }

    // 3. Verificar que el producto existe
    const producto = await Producto.findByPk(producto_id)
    if (!producto || !producto.activo) {
      throw { mensaje: 'Producto no encontrado o inactivo', status: 404 }
    }

    // 4. Obtener el registro de inventario actual
    const inventario = await Inventario.findOne({ where: { producto_id } })
    if (!inventario) {
      throw { mensaje: 'Registro de inventario no encontrado', status: 404 }
    }

    const stockAntes = inventario.stock_actual

    // 5. Calcular el nuevo stock según el tipo de movimiento
    let stockDespues
    if (tipo === 'ENTRADA' || tipo === 'DEVOLUCION') {
      stockDespues = stockAntes + parseInt(cantidad)
    } else {
      // SALIDA o AJUSTE → stock baja
      // Verificar que hay suficiente stock
      if (parseInt(cantidad) > stockAntes) {
        throw {
          mensaje: `Stock insuficiente. Stock actual: ${stockAntes}, cantidad solicitada: ${cantidad}`,
          status: 400,
          codigo: 'STOCK_INSUFICIENTE'
        }
      }
      stockDespues = stockAntes - parseInt(cantidad)
    }

    // 6. Ejecutar todo en una transacción atómica
    const movimiento = await sequelize.transaction(async (t) => {
      // a. Actualizar el stock en inventario
      await inventario.update(
        { stock_actual: stockDespues },
        { transaction: t }
      )

      // b. Registrar el movimiento con auditoría completa
      const nuevoMovimiento = await MovimientoInventario.create({
        producto_id,
        usuario_id: usuarioId,
        tipo,
        cantidad: parseInt(cantidad),
        stock_antes: stockAntes,
        stock_despues: stockDespues,
        motivo: motivo || null
      }, { transaction: t })

      return nuevoMovimiento
    })

    // 7. Devolver el movimiento con sus relaciones
    return await MovimientoInventario.findByPk(movimiento.id, {
      include: [
        { model: Producto, as: 'producto', attributes: ['codigo', 'nombre'] },
        { model: Usuario, as: 'usuario', attributes: ['nombre', 'apellidos'] }
      ]
    })
  }
}