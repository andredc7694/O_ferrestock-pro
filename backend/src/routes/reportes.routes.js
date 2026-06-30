import { Router } from 'express'
import { reportesController } from '../controllers/reportes.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'
import { verificarRol }   from '../middlewares/rol.middleware.js'

const router = Router()

const soloAdmin = [verificarToken, verificarRol('Administrador')]

router.get('/dashboard',              ...soloAdmin, reportesController.dashboard)
router.get('/ventas',                 ...soloAdmin, reportesController.ventas)
router.get('/productos-mas-vendidos', ...soloAdmin, reportesController.topProductos)
router.get('/stock',                  ...soloAdmin, reportesController.stock)

export default router