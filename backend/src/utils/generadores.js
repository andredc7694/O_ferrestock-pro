import { Producto, Categoria } from '../models/index.js'
import { Op } from 'sequelize'

export const generarCodigoProducto = async (categoriaId) => {
  // 1. Obtener el nombre de la categoría
  const categoria = await Categoria.findByPk(categoriaId)
  if (!categoria) throw new Error('Categoría no encontrada')

  // 2. Tomar las primeras 4 letras en mayúsculas y quitar espacios/caracteres especiales
  const prefijo = categoria.nombre
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 4)

  // 3. Buscar el último código con ese prefijo (incluyendo inactivos)
  const ultimoProducto = await Producto.findOne({
    where: {
      codigo: { [Op.like]: `${prefijo}-%` }
    },
    order: [['codigo', 'DESC']],
    paranoid: false // incluir soft-deleted
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