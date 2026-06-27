import { productosService } from '../services/productos.service.js'
import { respuestaExito, respuestaPaginada, respuestaError } from '../utils/respuesta.js'

export const productosController = {

  async listar(req, res) {
    try {
      const { search, categoria_id, page, limit } = req.query
      const { productos, pagination } = await productosService.listar({
        search, categoria_id, page, limit
      })
      return respuestaPaginada(res, productos, pagination, 'Productos obtenidos correctamente')
    } catch (error) {
      return respuestaError(res, 'Error al obtener productos', 500)
    }
  },

  async obtener(req, res) {
    try {
      const producto = await productosService.obtenerPorId(req.params.id)
      return respuestaExito(res, producto, 'Producto obtenido correctamente')
    } catch (error) {
      return respuestaError(res, error.mensaje || 'Error al obtener producto', error.status || 500)
    }
  },

  async crear(req, res) {
    try {
      const { nombre, categoria_id, unidad_medida_id, precio_compra, precio_venta } = req.body

      if (!nombre || !categoria_id || !unidad_medida_id || !precio_compra || !precio_venta) {
        return respuestaError(res, 'Faltan campos obligatorios: nombre, categoría, unidad, precios', 400)
      }

      const producto = await productosService.crear(req.body)
      return respuestaExito(res, producto, 'Producto creado correctamente', 201)
    } catch (error) {
      return respuestaError(res, error.mensaje || 'Error al crear producto', error.status || 500)
    }
  },

  async editar(req, res) {
    try {
      const producto = await productosService.editar(req.params.id, req.body)
      return respuestaExito(res, producto, 'Producto actualizado correctamente')
    } catch (error) {
      return respuestaError(res, error.mensaje || 'Error al editar producto', error.status || 500)
    }
  },

  async desactivar(req, res) {
    try {
      const resultado = await productosService.desactivar(req.params.id)
      return respuestaExito(res, resultado, resultado.mensaje)
    } catch (error) {
      return respuestaError(res, error.mensaje || 'Error al desactivar producto', error.status || 500)
    }
  }
}