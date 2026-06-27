import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  categoria_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  unidad_medida_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  proveedor_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio_compra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  stock_minimo: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1
  }
}, {
  tableName: 'productos',
  paranoid: true
})

export default Producto