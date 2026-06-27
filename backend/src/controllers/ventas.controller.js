import { ventasService } from '../services/ventas.service.js'
import { respuestaExito, respuestaPaginada, respuestaError } from '../utils/respuesta.js'

export const ventasController = {

  // POST /api/ventas
  async registrar(req, res) {
    try {
      const { items, metodo_pago } = req.body

      if (!items || !Array.isArray(items) || items.length === 0) {
        return respuestaError(res, 'El carrito no puede estar vacío', 400)
      }

      if (!metodo_pago) {
        return respuestaError(res, 'El método de pago es requerido', 400)
      }

      const venta = await ventasService.registrar(req.body, req.usuario.id)
      return respuestaExito(res, venta, 'Venta registrada correctamente', 201)

    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al registrar la venta',
        error.status  || 500,
        error.codigo
      )
    }
  },

  // GET /api/ventas
  async listar(req, res) {
    try {
      const { fecha_inicio, fecha_fin, metodo_pago, vendedor_id, page, limit } = req.query
      const { ventas, pagination } = await ventasService.listar(
        { fecha_inicio, fecha_fin, metodo_pago, vendedor_id, page, limit },
        req.usuario
      )
      return respuestaPaginada(res, ventas, pagination, 'Ventas obtenidas correctamente')
    } catch (error) {
      return respuestaError(res, 'Error al obtener ventas', 500)
    }
  },

  // GET /api/ventas/:id
  async obtener(req, res) {
    try {
      const venta = await ventasService.obtenerPorId(req.params.id)
      return respuestaExito(res, venta, 'Venta obtenida correctamente')
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al obtener la venta',
        error.status  || 500
      )
    }
  },

  // GET /api/ventas/:id/comprobante
  async comprobante(req, res) {
    try {
      const venta = await ventasService.obtenerPorId(req.params.id)
      return respuestaExito(res, venta, 'Comprobante obtenido correctamente')
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al obtener el comprobante',
        error.status  || 500
      )
    }
  }
}