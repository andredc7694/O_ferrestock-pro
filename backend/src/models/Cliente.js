import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipo_documento: {
    type: DataTypes.ENUM('DNI', 'RUC'),
    allowNull: false,
    defaultValue: 'DNI'
  },
  numero_documento: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  activo: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1
  }
}, {
  tableName: 'clientes',
  paranoid: true
})

export default Cliente