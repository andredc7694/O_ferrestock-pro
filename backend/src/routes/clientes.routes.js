import { Router } from 'express'
import { clientesController } from '../controllers/clientes.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'
import { verificarRol }   from '../middlewares/rol.middleware.js'

const router = Router()

const adminVendedor = [verificarToken, verificarRol('Administrador', 'Vendedor')]
const soloAdmin     = [verificarToken, verificarRol('Administrador')]

router.get('/',           ...adminVendedor, clientesController.listar)
router.get('/:id',        ...adminVendedor, clientesController.obtener)
router.get('/:id/ventas', ...adminVendedor, clientesController.ventas)
router.post('/',          ...adminVendedor, clientesController.crear)
router.put('/:id',        ...adminVendedor, clientesController.editar)
router.delete('/:id',     ...soloAdmin,     clientesController.desactivar)

export default router