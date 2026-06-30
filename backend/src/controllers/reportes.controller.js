import { reportesService } from '../services/reportes.service.js'
import { respuestaExito, respuestaError } from '../utils/respuesta.js'

export const reportesController = {

  // GET /api/reportes/dashboard
  async dashboard(req, res) {
    try {
      const datos = await reportesService.obtenerDashboard()
      return respuestaExito(res, datos, 'Dashboard obtenido correctamente')
    } catch (error) {
      console.error('Error dashboard:', error)
      return respuestaError(res, 'Error al obtener el dashboard', 500)
    }
  },

  // GET /api/reportes/ventas
  async ventas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query

      if (!fecha_inicio || !fecha_fin) {
        return respuestaError(
          res,
          'fecha_inicio y fecha_fin son requeridos',
          400
        )
      }

      const datos = await reportesService.obtenerReporteVentas(
        fecha_inicio, fecha_fin
      )
      return respuestaExito(res, datos, 'Reporte de ventas generado')
    } catch (error) {
      return respuestaError(res, 'Error al generar reporte de ventas', 500)
    }
  },

  // GET /api/reportes/productos-mas-vendidos
  async topProductos(req, res) {
    try {
      const { periodo } = req.query
      const datos = await reportesService.obtenerTopProductos(periodo)
      return respuestaExito(res, datos, 'Top productos obtenido')
    } catch (error) {
      return respuestaError(res, 'Error al obtener top productos', 500)
    }
  },

  // GET /api/reportes/stock
  async stock(req, res) {
    try {
      const { categoria_id, estado } = req.query
      const datos = await reportesService.obtenerReporteStock({
        categoria_id, estado
      })
      return respuestaExito(res, datos, 'Reporte de stock generado')
    } catch (error) {
      return respuestaError(res, 'Error al generar reporte de stock', 500)
    }
  }
}