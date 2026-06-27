import { categoriasService } from '../services/categorias.service.js'
import { respuestaExito, respuestaError } from '../utils/respuesta.js'

export const categoriasController = {

  async listar(req, res) {
    try {
      const categorias = await categoriasService.listar()
      return respuestaExito(res, categorias, 'Categorías obtenidas correctamente')
    } catch (error) {
      return respuestaError(res, 'Error al obtener categorías', 500)
    }
  },

  async crear(req, res) {
    try {
      const { nombre, descripcion } = req.body
      if (!nombre) return respuestaError(res, 'El nombre de la categoría es requerido', 400)

      const categoria = await categoriasService.crear({ nombre, descripcion })
      return respuestaExito(res, categoria, 'Categoría creada correctamente', 201)
    } catch (error) {
      return respuestaError(res, error.mensaje || 'Error al crear categoría', error.status || 500)
    }
  },

  async editar(req, res) {
    try {
      const { id } = req.params
      const categoria = await categoriasService.editar(id, req.body)
      return respuestaExito(res, categoria, 'Categoría actualizada correctamente')
    } catch (error) {
      return respuestaError(res, error.mensaje || 'Error al editar categoría', error.status || 500)
    }
  },

  async desactivar(req, res) {
    try {
      const { id } = req.params
      const resultado = await categoriasService.desactivar(id)
      return respuestaExito(res, resultado, resultado.mensaje)
    } catch (error) {
      return respuestaError(res, error.mensaje || 'Error al desactivar categoría', error.status || 500)
    }
  }
}