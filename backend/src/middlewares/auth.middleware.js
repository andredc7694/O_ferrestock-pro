import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/jwt.js'
import { respuestaError } from '../utils/respuesta.js'

export const verificarToken = (req, res, next) => {
  try {
    // Extraer el token del header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return respuestaError(
        res,
        'Acceso no autorizado. Inicia sesión primero',
        401,
        'TOKEN_REQUERIDO'
      )
    }

    const token = authHeader.split(' ')[1]

    // Verificar y decodificar el token
    const payload = jwt.verify(token, jwtConfig.secret)

    // Agregar los datos del usuario a la request
    // Ahora todos los controllers pueden usar req.usuario
    req.usuario = payload

    next()

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return respuestaError(
        res,
        'Tu sesión ha expirado. Inicia sesión nuevamente',
        401,
        'TOKEN_EXPIRADO'
      )
    }
    return respuestaError(
      res,
      'Token inválido',
      401,
      'TOKEN_INVALIDO'
    )
  }
}