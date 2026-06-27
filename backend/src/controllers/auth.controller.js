import { authService } from '../services/auth.service.js'
import { respuestaExito, respuestaError } from '../utils/respuesta.js'

export const authController = {

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body

      // Validación básica de campos requeridos
      if (!email || !password) {
        return respuestaError(res, 'El email y la contraseña son requeridos', 400)
      }

      const resultado = await authService.login(email, password)

      return respuestaExito(res, resultado, 'Sesión iniciada correctamente')

    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al iniciar sesión',
        error.status || 500,
        error.codigo || 'ERROR_LOGIN'
      )
    }
  },

  // POST /api/auth/logout
  async logout(req, res) {
    // El token se elimina en el cliente (frontend)
    // El backend solo confirma la operación
    return respuestaExito(res, null, 'Sesión cerrada correctamente')
  },

  // GET /api/auth/me
  async me(req, res) {
    try {
      // req.usuario viene del middleware verificarToken
      return respuestaExito(res, req.usuario, 'Datos del usuario obtenidos')
    } catch (error) {
      return respuestaError(res, 'Error al obtener datos del usuario', 500)
    }
  },

  // PUT /api/auth/cambiar-password
  async cambiarPassword(req, res) {
    try {
      const { password_actual, password_nueva, password_confirmacion } = req.body

      // Validar que los campos estén presentes
      if (!password_actual || !password_nueva || !password_confirmacion) {
        return respuestaError(res, 'Todos los campos son requeridos', 400)
      }

      // Validar que la nueva contraseña y su confirmación coincidan
      if (password_nueva !== password_confirmacion) {
        return respuestaError(res, 'La nueva contraseña y su confirmación no coinciden', 400)
      }

      // Validar longitud mínima
      if (password_nueva.length < 6) {
        return respuestaError(res, 'La nueva contraseña debe tener al menos 6 caracteres', 400)
      }

      const resultado = await authService.cambiarPassword(
        req.usuario.id,
        password_actual,
        password_nueva
      )

      return respuestaExito(res, resultado, 'Contraseña actualizada correctamente')

    } catch (error) {
      return respuestaError(
        res,
        error.mensaje || 'Error al cambiar la contraseña',
        error.status || 500,
        error.codigo
      )
    }
  }
}