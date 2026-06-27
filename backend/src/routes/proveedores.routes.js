import { Router } from 'express'
import { proveedoresController } from '../controllers/proveedores.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'
import { verificarRol } from '../middlewares/rol.middleware.js'

const router = Router()

const soloAdmin = [verificarToken, verificarRol('Administrador')]

router.get('/',    ...soloAdmin, proveedoresController.listar)
router.get('/:id', ...soloAdmin, proveedoresController.obtener)
router.post('/',   ...soloAdmin, proveedoresController.crear)
router.put('/:id', ...soloAdmin, proveedoresController.editar)
router.delete('/:id', ...soloAdmin, proveedoresController.desactivar)

export default router