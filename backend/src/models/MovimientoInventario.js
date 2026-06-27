import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const MovimientoInventario = sequelize.define('MovimientoInventario', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  venta_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true  // null cuando no viene de una venta
  },
  tipo: {
    type: DataTypes.ENUM('ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION'),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_antes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_despues: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'movimientos_inventario',
  // INMUTABLE: sin updated_at ni deleted_at
  timestamps: true,
  updatedAt: false,
  paranoid: false
})

export default MovimientoInventario