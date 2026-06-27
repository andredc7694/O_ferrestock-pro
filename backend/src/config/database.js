import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // Cambia a console.log si quieres ver las queries SQL
    define: {
      underscored: true,      // Usa snake_case en la BD
      timestamps: true,       // Agrega created_at y updated_at automáticamente
      paranoid: true          // Agrega deleted_at para soft delete automático
    }
  }
)

export default sequelize