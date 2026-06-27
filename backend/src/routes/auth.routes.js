import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'

const router = Router()

// Rutas públicas (no requieren token)
router.post('/login', authController.login)

// Rutas protegidas (requieren token válido)
router.post('/logout', verificarToken, authController.logout)
router.get('/me', verificarToken, authController.me)
router.put('/cambiar-password', verificarToken, authController.cambiarPassword)

export default router