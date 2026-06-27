import { Categoria, Producto } from '../models/index.js'

export const categoriasService = {

  async listar() {
    return await Categoria.findAll({
      order: [['nombre', 'ASC']]
    })
  },

  async crear(datos) {
    const { nombre, descripcion } = datos

    // Verificar nombre único
    const existe = await Categoria.findOne({ where: { nombre } })
    if (existe) {
      throw { mensaje: `Ya existe una categoría con el nombre "${nombre}"`, status: 400 }
    }

    return await Categoria.create({ nombre, descripcion })
  },

  async editar(id, datos) {
    const categoria = await Categoria.findByPk(id)
    if (!categoria) {
      throw { mensaje: 'Categoría no encontrada', status: 404 }
    }

    // Si cambia el nombre, verificar que no exista otro igual
    if (datos.nombre && datos.nombre !== categoria.nombre) {
      const existe = await Categoria.findOne({ where: { nombre: datos.nombre } })
      if (existe) {
        throw { mensaje: `Ya existe una categoría con el nombre "${datos.nombre}"`, status: 400 }
      }
    }

    await categoria.update(datos)
    return categoria
  },

  async desactivar(id) {
    const categoria = await Categoria.findByPk(id)
    if (!categoria) {
      throw { mensaje: 'Categoría no encontrada', status: 404 }
    }

    // Verificar que no tenga productos activos
    const productosActivos = await Producto.count({
      where: { categoria_id: id, activo: 1 }
    })

    if (productosActivos > 0) {
      throw {
        mensaje: `No se puede desactivar. Hay ${productosActivos} producto(s) activo(s) en esta categoría`,
        status: 400
      }
    }

    await categoria.destroy() // soft delete con paranoid
    return { mensaje: 'Categoría desactivada correctamente' }
  }
}