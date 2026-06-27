import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const app = express()

// ── MIDDLEWARES GLOBALES ──
// Permite recibir JSON en las peticiones
app.use(express.json())

// Permite peticiones desde el frontend (CORS)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

// ── RUTA DE PRUEBA ──
// Esta ruta sirve para verificar que el servidor está vivo
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor FerreStock Pro activo',
    timestamp: new Date().toISOString()
  })
})

// ── MANEJO DE RUTAS NO ENCONTRADAS ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  })
})

// ── MANEJO GLOBAL DE ERRORES ──
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message)
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  })
})

export default app