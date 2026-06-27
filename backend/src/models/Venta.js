import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Venta = sequelize.define('Venta', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true  // null = venta anónima
  },
  vendedor_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  numero_venta: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  porcentaje_desc: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  monto_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  metodo_pago: {
    type: DataTypes.ENUM('EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA'),
    allowNull: false,
    defaultValue: 'EFECTIVO'
  },
  estado: {
    type: DataTypes.ENUM('COMPLETADA', 'ANULADA', 'CREDITO'),
    allowNull: false,
    defaultValue: 'COMPLETADA'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_venta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ventas',
  paranoid: true
})

export default Venta