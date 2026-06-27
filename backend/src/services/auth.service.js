import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Usuario, Rol } from '../models/index.js'
import { jwtConfig } from '../config/jwt.js'

export const authService = {

  // ── LOGIN ──
  async login(email, password) {
    // 1. Buscar usuario por email (con scope conPassword para obtener el hash)
    const usuario = await Usuario.scope('conPassword').findOne({
      where: { email },
      include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }]
    })

    // 2. Verificar que el usuario existe
    if (!usuario) {
      throw { mensaje: 'Credenciales incorrectas', codigo: 'CREDENCIALES_INVALIDAS', status: 400 }
    }

    // 3. Verificar que el usuario está activo
    if (!usuario.activo) {
      throw { mensaje: 'Tu cuenta está desactivada. Contacta al administrador', codigo: 'USUARIO_INACTIVO', status: 403 }
    }

    // 4. Verificar la contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password)

    if (!passwordValida) {
      throw { mensaje: 'Credenciales incorrectas', codigo: 'CREDENCIALES_INVALIDAS', status: 400 }
    }

    // 5. Generar el token JWT
    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      rol: usuario.rol.nombre
    }

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    })

    // 6. Devolver token y datos del usuario (sin el password)
    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        rol: usuario.rol.nombre
      }
    }
  },

  // ── CAMBIAR CONTRASEÑA ──
  async cambiarPassword(usuarioId, passwordActual, passwordNueva) {
    // 1. Buscar usuario con su password actual
    const usuario = await Usuario.scope('conPassword').findByPk(usuarioId)

    if (!usuario) {
      throw { mensaje: 'Usuario no encontrado', codigo: 'USUARIO_NO_ENCONTRADO', status: 404 }
    }

    // 2. Verificar que la contraseña actual es correcta
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password)

    if (!passwordValida) {
      throw { mensaje: 'La contraseña actual es incorrecta', codigo: 'PASSWORD_INCORRECTO', status: 400 }
    }

    // 3. Hashear la nueva contraseña
    const nuevoHash = await bcrypt.hash(passwordNueva, 10)

    // 4. Actualizar en la base de datos
    await usuario.update({ password: nuevoHash })

    return { mensaje: 'Contraseña actualizada correctamente' }
  }
}