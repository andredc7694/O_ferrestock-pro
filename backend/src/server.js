import app from './app.js'
import sequelize from './config/database.js'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3001

// Función principal que arranca el servidor
const iniciarServidor = async () => {
  try {
    // 1. Verificar conexión a la base de datos
    await sequelize.authenticate()
    console.log('✅ Conexión a MySQL establecida correctamente')

    // 2. Arrancar el servidor Express
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`)
    })

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message)
    process.exit(1) // Cierra el proceso si hay un error crítico
  }
}

iniciarServidor()