import { Router } from 'express'
import { ventasController } from '../controllers/ventas.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'
import { verificarRol } from '../middlewares/rol.middleware.js'

const router = Router()

const adminVendedor = [verificarToken, verificarRol('Administrador', 'Vendedor')]

router.get('/',                   ...adminVendedor, ventasController.listar)
router.get('/:id',                ...adminVendedor, ventasController.obtener)
router.get('/:id/comprobante',    ...adminVendedor, ventasController.comprobante)
router.post('/',                  ...adminVendedor, ventasController.registrar)

export default router