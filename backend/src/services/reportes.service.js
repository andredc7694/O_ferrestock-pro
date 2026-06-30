import { Op, fn, col, literal } from 'sequelize'
import sequelize from '../config/database.js'
import {
  Venta, DetalleVenta, Producto, Categoria,
  Inventario, Usuario, Inventario as Inv
} from '../models/index.js'

// Helpers de fechas
const inicioDia  = (fecha) => { const d = new Date(fecha); d.setHours(0,0,0,0);   return d }
const finDia     = (fecha) => { const d = new Date(fecha); d.setHours(23,59,59,999); return d }
const inicioMes  = ()      => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d }

export const reportesService = {

  // ── DASHBOARD PRINCIPAL ──
  async obtenerDashboard() {
    const ahora = new Date()
    const hoy   = { [Op.gte]: inicioDia(ahora), [Op.lte]: finDia(ahora) }
    const mes   = { [Op.gte]: inicioMes(), [Op.lte]: ahora }

    const whereCompletada = { estado: 'COMPLETADA', deleted_at: null }

    // 1. Ventas del día
    const ventasHoy = await Venta.findAll({
      where: { ...whereCompletada, fecha_venta: hoy }
    })
    const montoHoy = ventasHoy.reduce((a, v) => a + parseFloat(v.total), 0)

    // 2. Ventas del mes
    const ventasMes = await Venta.findAll({
      where: { ...whereCompletada, fecha_venta: mes }
    })
    const montoMes = ventasMes.reduce((a, v) => a + parseFloat(v.total), 0)

    // 3. Stock crítico
    const stockCritico = await Inventario.findAll({
      include: [{
        model: Producto, as: 'producto',
        where: { activo: 1 },
        attributes: ['stock_minimo']
      }]
    })
    const cantidadCritico = stockCritico.filter(
      s => s.stock_actual <= s.producto.stock_minimo
    ).length

    // 4. Últimas 5 ventas del día
    const ultimasVentas = await Venta.findAll({
      where:   { ...whereCompletada, fecha_venta: hoy },
      include: [
        { model: Usuario, as: 'vendedor', attributes: ['nombre'] }
      ],
      order:  [['fecha_venta', 'DESC']],
      limit:  5
    })

    // 5. Top 5 productos del mes
    const topProductos = await DetalleVenta.findAll({
      attributes: [
        'producto_id',
        [fn('SUM', col('DetalleVenta.cantidad')), 'unidades_vendidas'],
        [fn('SUM', col('DetalleVenta.subtotal')),  'ingreso_generado']
      ],
      include: [
        {
          model:      Venta,
          as:         'venta',
          where:      { ...whereCompletada, fecha_venta: mes },
          attributes: []
        },
        {
          model:      Producto,
          as:         'producto',
          attributes: ['nombre', 'codigo']
        }
      ],
      group:  ['producto_id', 'producto.id', 'producto.nombre', 'producto.codigo'],
      order:  [[fn('SUM', col('DetalleVenta.cantidad')), 'DESC']],
      limit:  5
    })

    // 6. Ventas de los últimos 7 días (para el gráfico)
    const ventas7Dias = []
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)

      const ventasDia = await Venta.findAll({
        where: {
          ...whereCompletada,
          fecha_venta: {
            [Op.gte]: inicioDia(fecha),
            [Op.lte]: finDia(fecha)
          }
        }
      })

      const monto = ventasDia.reduce((a, v) => a + parseFloat(v.total), 0)

      ventas7Dias.push({
        fecha:    fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),
        cantidad: ventasDia.length,
        monto:    parseFloat(monto.toFixed(2))
      })
    }

    return {
      ventas_hoy: {
        cantidad:   ventasHoy.length,
        monto_total: parseFloat(montoHoy.toFixed(2)),
        promedio:   ventasHoy.length
          ? parseFloat((montoHoy / ventasHoy.length).toFixed(2))
          : 0
      },
      ventas_mes: {
        cantidad:    ventasMes.length,
        monto_total: parseFloat(montoMes.toFixed(2))
      },
      stock_critico:    cantidadCritico,
      ultimas_ventas:   ultimasVentas,
      top_productos_mes: topProductos,
      ventas_7_dias:    ventas7Dias
    }
  },

  // ── REPORTE DE VENTAS POR PERÍODO ──
  async obtenerReporteVentas(fecha_inicio, fecha_fin) {
    const inicio = inicioDia(new Date(fecha_inicio))
    const fin    = finDia(new Date(fecha_fin))

    const ventas = await Venta.findAll({
      where: {
        estado:      'COMPLETADA',
        deleted_at:  null,
        fecha_venta: { [Op.between]: [inicio, fin] }
      },
      include: [
        { model: Usuario, as: 'vendedor', attributes: ['id','nombre','apellidos'] }
      ],
      order: [['fecha_venta', 'ASC']]
    })

    const total       = ventas.length
    const montoTotal  = ventas.reduce((a, v) => a + parseFloat(v.total), 0)
    const promedio    = total ? montoTotal / total : 0

    // Desglose por método de pago
    const porMetodo = {}
    ventas.forEach(v => {
      if (!porMetodo[v.metodo_pago]) porMetodo[v.metodo_pago] = { cantidad: 0, monto: 0 }
      porMetodo[v.metodo_pago].cantidad++
      porMetodo[v.metodo_pago].monto += parseFloat(v.total)
    })

    // Desglose por vendedor
    const porVendedor = {}
    ventas.forEach(v => {
      const key = v.vendedor_id
      if (!porVendedor[key]) {
        porVendedor[key] = {
          nombre:   `${v.vendedor?.nombre} ${v.vendedor?.apellidos || ''}`.trim(),
          cantidad: 0,
          monto:    0
        }
      }
      porVendedor[key].cantidad++
      porVendedor[key].monto += parseFloat(v.total)
    })

    // Ventas por día (para gráfico)
    const porDia = {}
    ventas.forEach(v => {
      const dia = new Date(v.fecha_venta).toLocaleDateString('es-PE', {
        day: '2-digit', month: '2-digit'
      })
      if (!porDia[dia]) porDia[dia] = { fecha: dia, cantidad: 0, monto: 0 }
      porDia[dia].cantidad++
      porDia[dia].monto = parseFloat((porDia[dia].monto + parseFloat(v.total)).toFixed(2))
    })

    return {
      periodo:      { inicio: fecha_inicio, fin: fecha_fin },
      total_ventas: total,
      monto_total:  parseFloat(montoTotal.toFixed(2)),
      promedio:     parseFloat(promedio.toFixed(2)),
      por_metodo:   Object.entries(porMetodo).map(([metodo, datos]) => ({
        metodo,
        cantidad: datos.cantidad,
        monto:    parseFloat(datos.monto.toFixed(2))
      })),
      por_vendedor: Object.values(porVendedor).map(v => ({
        ...v,
        monto: parseFloat(v.monto.toFixed(2))
      })),
      ventas_por_dia: Object.values(porDia)
    }
  },

  // ── TOP PRODUCTOS MÁS VENDIDOS ──
  async obtenerTopProductos(periodo = 'mes') {
    const ahora = new Date()
    let inicio

    if (periodo === 'hoy') {
      inicio = inicioDia(ahora)
    } else if (periodo === 'semana') {
      inicio = new Date()
      inicio.setDate(inicio.getDate() - 7)
      inicio.setHours(0, 0, 0, 0)
    } else {
      inicio = inicioMes()
    }

    const top = await DetalleVenta.findAll({
      attributes: [
        'producto_id',
        [fn('SUM', col('DetalleVenta.cantidad')), 'unidades_vendidas'],
        [fn('SUM', col('DetalleVenta.subtotal')),  'ingreso_generado']
      ],
      include: [
        {
          model:      Venta,
          as:         'venta',
          where:      {
            estado:      'COMPLETADA',
            deleted_at:  null,
            fecha_venta: { [Op.between]: [inicio, ahora] }
          },
          attributes: []
        },
        {
          model:      Producto,
          as:         'producto',
          attributes: ['nombre', 'codigo'],
          include:    [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }]
        }
      ],
      group:  [
        'producto_id',
        'producto.id', 'producto.nombre', 'producto.codigo',
        'producto->categoria.id', 'producto->categoria.nombre'
      ],
      order:  [[fn('SUM', col('DetalleVenta.cantidad')), 'DESC']],
      limit:  10
    })

    return top.map(item => ({
      producto_id:      item.producto_id,
      codigo:           item.producto?.codigo,
      nombre:           item.producto?.nombre,
      categoria:        item.producto?.categoria?.nombre,
      unidades_vendidas: parseInt(item.dataValues.unidades_vendidas),
      ingreso_generado:  parseFloat(parseFloat(item.dataValues.ingreso_generado).toFixed(2))
    }))
  },

  // ── REPORTE DE STOCK ACTUAL ──
  async obtenerReporteStock({ categoria_id, estado } = {}) {
    const whereProducto = { activo: 1 }
    if (categoria_id) whereProducto.categoria_id = categoria_id

    const registros = await Inventario.findAll({
      include: [{
        model:      Producto,
        as:         'producto',
        where:      whereProducto,
        include:    [{
          model:      Categoria,
          as:         'categoria',
          attributes: ['nombre']
        }]
      }],
      order: [[{ model: Producto, as: 'producto' }, 'nombre', 'ASC']]
    })

    // Calcular estado y valor por producto
    let items = registros.map(r => {
      const stock  = r.stock_actual
      const minimo = r.producto.stock_minimo
      const estadoStock = stock === 0
        ? 'SIN_STOCK'
        : stock <= minimo ? 'CRITICO' : 'NORMAL'

      const valorInventario = parseFloat(
        (stock * parseFloat(r.producto.precio_compra)).toFixed(2)
      )

      return {
        producto_id:      r.producto.id,
        codigo:           r.producto.codigo,
        nombre:           r.producto.nombre,
        categoria:        r.producto.categoria?.nombre,
        stock_actual:     stock,
        stock_minimo:     minimo,
        precio_compra:    parseFloat(r.producto.precio_compra),
        valor_inventario: valorInventario,
        estado_stock:     estadoStock
      }
    })

    // Filtrar por estado si se especificó
    if (estado) items = items.filter(i => i.estado_stock === estado)

    const valorTotal = parseFloat(
      items.reduce((a, i) => a + i.valor_inventario, 0).toFixed(2)
    )

    return { items, valor_total: valorTotal }
  }
}