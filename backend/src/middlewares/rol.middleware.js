import { respuestaError } from '../utils/respuesta.js'

// Recibe un array de roles permitidos
// Ejemplo de uso: verificarRol(['Administrador', 'Vendedor'])
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    // verificarToken debe ejecutarse ANTES que este middleware
    if (!req.usuario) {
      return respuestaError(
        res,
        'Acceso no autorizado',
        401,
        'TOKEN_REQUERIDO'
      )
    }

    const rolUsuario = req.usuario.rol

    if (!rolesPermitidos.includes(rolUsuario)) {
      return respuestaError(
        res,
        `No tienes permiso para acceder a este recurso. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
        403,
        'ACCESO_DENEGADO'
      )
    }

    next()
  }
}