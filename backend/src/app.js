import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/index.js'

dotenv.config()

const app = express()

// ── MIDDLEWARES GLOBALES ──
app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

// ── RUTA DE SALUD ──
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor FerreStock Pro activo',
    timestamp: new Date().toISOString()
  })
})

// ── TODAS LAS RUTAS DEL SISTEMA ──
app.use('/api', router)

// ── RUTAS NO ENCONTRADAS ──
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