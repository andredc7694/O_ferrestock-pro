import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Proveedor = sequelize.define('Proveedor', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  razon_social: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  ruc: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nombre_contacto: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  activo: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1
  }
}, {
  tableName: 'proveedores',
  paranoid: true
})

export default Proveedor