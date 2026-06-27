import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Inventario = sequelize.define('Inventario', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true
  },
  stock_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'inventario',
  paranoid: false
})

export default Inventario