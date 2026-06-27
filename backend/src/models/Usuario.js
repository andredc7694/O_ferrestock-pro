import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  rol_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  activo: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1
  }
}, {
  tableName: 'usuarios',
  paranoid: true,  // soft delete con deleted_at
  defaultScope: {
    // El password NUNCA se devuelve por defecto en ninguna consulta
    attributes: { exclude: ['password'] }
  },
  scopes: {
    // Scope especial: solo para login (necesitamos el password)
    conPassword: {
      attributes: { include: ['password'] }
    }
  }
})

export default Usuario