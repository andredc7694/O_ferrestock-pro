import { Router } from 'express'
import { inventarioController } from '../controllers/inventario.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'
import { verificarRol } from '../middlewares/rol.middleware.js'

const router = Router()

const soloAdminBodeguero = [
  verificarToken,
  verificarRol('Administrador', 'Bodeguero')
]

// Stock actual
router.get('/', ...soloAdminBodeguero, inventarioController.stock)

// Alertas de stock crítico
// ⚠️ IMPORTANTE: esta ruta debe ir ANTES de /:id si hubiera
router.get('/alertas', ...soloAdminBodeguero, inventarioController.alertas)

// Historial de movimientos
router.get('/movimientos', ...soloAdminBodeguero, inventarioController.movimientos)

// Registrar nuevo movimiento
router.post('/movimientos', ...soloAdminBodeguero, inventarioController.registrar)

export default router