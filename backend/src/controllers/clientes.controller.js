import { clientesService } from '../services/clientes.service.js'
import { respuestaExito, respuestaPaginada, respuestaError } from '../utils/respuesta.js'

export const clientesController = {

  // GET /api/clientes
  async listar(req, res) {
    try {
      const { search, page, limit } = req.query
      const { clientes, pagination } = await clientesService.listar({
        search, page, limit
      })
      return respuestaPaginada(
        res, clientes, pagination,
        'Clientes obtenidos correctamente'
      )
    } catch (error) {
      return respuestaError(res, 'Error al obtener clientes', 500)
    }
  },

  // GET /api/clientes/:id
  async obtener(req, res) {
    try {
      const cliente = await clientesService.obtenerPorId(req.params.id)
      return respuestaExito(res, cliente, 'Cliente obtenido correctamente')
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al obtener cliente',
        error.status  || 500
      )
    }
  },

  // GET /api/clientes/:id/ventas
  async ventas(req, res) {
    try {
      const { page, limit } = req.query
      const resultado = await clientesService.obtenerVentas(
        req.params.id, { page, limit }
      )
      return respuestaPaginada(
        res,
        resultado.ventas,
        resultado.pagination,
        'Historial de compras obtenido correctamente',
        { total_acumulado: resultado.total_acumulado }
      )
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al obtener historial',
        error.status  || 500
      )
    }
  },

  // POST /api/clientes
  async crear(req, res) {
    try {
      const { nombre, tipo_documento, numero_documento } = req.body

      if (!nombre || !tipo_documento || !numero_documento) {
        return respuestaError(
          res,
          'Nombre, tipo de documento y número de documento son obligatorios',
          400
        )
      }

      const cliente = await clientesService.crear(req.body)
      return respuestaExito(res, cliente, 'Cliente creado correctamente', 201)
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al crear cliente',
        error.status  || 500
      )
    }
  },

  // PUT /api/clientes/:id
  async editar(req, res) {
    try {
      const cliente = await clientesService.editar(req.params.id, req.body)
      return respuestaExito(res, cliente, 'Cliente actualizado correctamente')
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al editar cliente',
        error.status  || 500
      )
    }
  },

  // DELETE /api/clientes/:id
  async desactivar(req, res) {
    try {
      const resultado = await clientesService.desactivar(req.params.id)
      return respuestaExito(res, resultado, resultado.mensaje)
    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al desactivar cliente',
        error.status  || 500
      )
    }
  }
}