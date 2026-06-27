import sequelize from '../config/database.js'
import Rol from './Rol.js'
import Usuario from './Usuario.js'

// ── ASOCIACIONES ──
// Un usuario pertenece a un rol
Usuario.belongsTo(Rol, {
  foreignKey: 'rol_id',
  as: 'rol'
})

// Un rol tiene muchos usuarios
Rol.hasMany(Usuario, {
  foreignKey: 'rol_id',
  as: 'usuarios'
})

export { sequelize, Rol, Usuario }