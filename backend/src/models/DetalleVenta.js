import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const DetalleVenta = sequelize.define('DetalleVenta', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  venta_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  producto_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'detalle_ventas',
  paranoid: false,
  updatedAt: false
})

export default DetalleVenta