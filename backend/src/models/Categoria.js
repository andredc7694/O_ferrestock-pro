import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'categorias',
  paranoid: true
})

export default Categoria