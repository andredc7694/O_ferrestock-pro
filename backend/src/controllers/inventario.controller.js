import { inventarioService } from '../services/inventario.service.js'
import { respuestaExito, respuestaPaginada, respuestaError } from '../utils/respuesta.js'

export const inventarioController = {

  // GET /api/inventario
  async stock(req, res) {
    try {
      const stock = await inventarioService.obtenerStock()
      return respuestaExito(res, stock, 'Stock obtenido correctamente')
    } catch (error) {
      return respuestaError(res, 'Error al obtener el stock', 500)
    }
  },

  // GET /api/inventario/alertas
  async alertas(req, res) {
    try {
      const alertas = await inventarioService.obtenerAlertas()
      return respuestaExito(res, alertas, `${alertas.length} producto(s) en alerta de stock`)
    } catch (error) {
      return respuestaError(res, 'Error al obtener alertas', 500)
    }
  },

  // GET /api/inventario/movimientos
  async movimientos(req, res) {
    try {
      const { producto_id, tipo, fecha_inicio, fecha_fin, page, limit } = req.query
      const { movimientos, pagination } = await inventarioService.obtenerMovimientos({
        producto_id, tipo, fecha_inicio, fecha_fin, page, limit
      })
      return respuestaPaginada(res, movimientos, pagination, 'Movimientos obtenidos correctamente')
    } catch (error) {
      return respuestaError(res, 'Error al obtener movimientos', 500)
    }
  },

  // POST /api/inventario/movimientos
  async registrar(req, res) {
    try {
      const { producto_id, tipo, cantidad, motivo } = req.body

      // Validar campos requeridos
      if (!producto_id || !tipo || !cantidad) {
        return respuestaError(res, 'Producto, tipo y cantidad son requeridos', 400)
      }

      // Validar que el tipo sea válido
      const tiposValidos = ['ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION']
      if (!tiposValidos.includes(tipo)) {
        return respuestaError(res, `Tipo inválido. Use: ${tiposValidos.join(', ')}`, 400)
      }

      // req.usuario viene del middleware verificarToken
      const movimiento = await inventarioService.registrarMovimiento(
        { producto_id, tipo, cantidad, motivo },
        req.usuario.id
      )

      return respuestaExito(res, movimiento, 'Movimiento registrado correctamente', 201)

    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al registrar movimiento',
        error.status || 500,
        error.codigo
      )
    }
  }
}