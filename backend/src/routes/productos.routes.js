import { Router } from 'express'
import { productosController } from '../controllers/productos.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'
import { verificarRol } from '../middlewares/rol.middleware.js'

const router = Router()

router.get('/', verificarToken, productosController.listar)
router.get('/:id', verificarToken, productosController.obtener)
router.post('/', verificarToken, verificarRol('Administrador', 'Bodeguero'), productosController.crear)
router.put('/:id', verificarToken, verificarRol('Administrador', 'Bodeguero'), productosController.editar)
router.delete('/:id', verificarToken, verificarRol('Administrador'), productosController.desactivar)

export default router