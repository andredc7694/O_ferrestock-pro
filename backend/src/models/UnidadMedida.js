import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const UnidadMedida = sequelize.define('UnidadMedida', {
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
  abreviatura: {
    type: DataTypes.STRING(10),
    allowNull: false
  }
}, {
  tableName: 'unidades_medida',
  paranoid: false
})

export default UnidadMedida