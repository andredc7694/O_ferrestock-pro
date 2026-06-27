import { Producto, Categoria, Venta } from '../models/index.js'
import { Op } from 'sequelize'

// Genera código de producto automático — Ej: HERR-0001
export const generarCodigoProducto = async (categoriaId) => {

  // 1. Obtener el nombre de la categoría
  const categoria = await Categoria.findByPk(categoriaId)
  if (!categoria) throw new Error('Categoría no encontrada')

  // 2. Tomar las primeras 4 letras en mayúsculas
  const prefijo = categoria.nombre
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 4)

  // 3. Buscar el último código con ese prefijo
  const ultimoProducto = await Producto.findOne({
    where: {
      codigo: { [Op.like]: `${prefijo}-%` }
    },
    order: [['codigo', 'DESC']],
    paranoid: false
  })

  // 4. Calcular el siguiente número
  let siguienteNumero = 1
  if (ultimoProducto) {
    const partes = ultimoProducto.codigo.split('-')
    const ultimoNumero = parseInt(partes[1]) || 0
    siguienteNumero = ultimoNumero + 1
  }

  // 5. Formatear con ceros a la izquierda (4 dígitos)
  const numeroFormateado = String(siguienteNumero).padStart(4, '0')

  return `${prefijo}-${numeroFormateado}`
}

// Genera número de venta automático — Ej: VTA-2025-0001
export const generarNumeroVenta = async () => {
  const anio    = new Date().getFullYear()
  const prefijo = `VTA-${anio}-`

  const ultimaVenta = await Venta.findOne({
    where: { numero_venta: { [Op.like]: `${prefijo}%` } },
    order: [['numero_venta', 'DESC']],
    paranoid: false
  })

  let siguiente = 1
  if (ultimaVenta) {
    const partes  = ultimaVenta.numero_venta.split('-')
    siguiente = parseInt(partes[2]) + 1
  }

  return `${prefijo}${String(siguiente).padStart(4, '0')}`
}