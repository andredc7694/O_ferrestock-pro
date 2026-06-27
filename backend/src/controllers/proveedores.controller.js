import { proveedoresService } from '../services/proveedores.service.js'
import { respuestaExito, respuestaPaginada, respuestaError } from '../utils/respuesta.js'

export const proveedoresController = {

  // GET /api/proveedores
  async listar(req, res) {
    try {
      const { search, page, limit } = req.query
      const { proveedores, pagination } = await proveedoresService.listar({
        search, page, limit
      })
      return respuestaPaginada(
        res, proveedores, pagination,
        'Proveedores obtenidos correctamente'
      )
    } catch (error) {
      return respuestaError(res, 'Error al obtener proveedores', 500)
    }
  },

  // GET /api/proveedores/:id
  async obtener(req, res) {
    try {
      const proveedor = await proveedoresService.obtenerPorId(req.params.id)
      return respuestaExito(res, proveedor, 'Proveedor obtenido correctamente')
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al obtener proveedor',
        error.status || 500
      )
    }
  },

  // POST /api/proveedores
  async crear(req, res) {
    try {
      const { razon_social, ruc, telefono } = req.body

      if (!razon_social || !ruc || !telefono) {
        return respuestaError(
          res,
          'Razón social, RUC y teléfono son obligatorios',
          400
        )
      }

      const proveedor = await proveedoresService.crear(req.body)
      return respuestaExito(res, proveedor, 'Proveedor creado correctamente', 201)
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al crear proveedor',
        error.status || 500
      )
    }
  },

  // PUT /api/proveedores/:id
  async editar(req, res) {
    try {
      const proveedor = await proveedoresService.editar(req.params.id, req.body)
      return respuestaExito(res, proveedor, 'Proveedor actualizado correctamente')
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al editar proveedor',
        error.status || 500
      )
    }
  },

  // DELETE /api/proveedores/:id
  async desactivar(req, res) {
    try {
      const resultado = await proveedoresService.desactivar(req.params.id)
      return respuestaExito(res, resultado, resultado.mensaje)
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al desactivar proveedor',
        error.status || 500
      )
    }
  }
}