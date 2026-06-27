import { Router } from 'express'
import { categoriasController } from '../controllers/categorias.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'
import { verificarRol } from '../middlewares/rol.middleware.js'

const router = Router()

router.get('/', verificarToken, categoriasController.listar)
router.post('/', verificarToken, verificarRol('Administrador'), categoriasController.crear)
router.put('/:id', verificarToken, verificarRol('Administrador'), categoriasController.editar)
router.delete('/:id', verificarToken, verificarRol('Administrador'), categoriasController.desactivar)

export default router