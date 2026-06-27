import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'roles',
  paranoid: false  // roles no tienen soft delete
})

export default Rol