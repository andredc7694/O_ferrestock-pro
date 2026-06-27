import { Router } from 'express'
import authRoutes from './auth.routes.js'

const router = Router()

// Registrar todas las rutas bajo /api
router.use('/auth', authRoutes)

// Aquí irán las demás rutas en los próximos sprints:
// router.use('/usuarios', usuariosRoutes)
// router.use('/productos', productosRoutes)
// router.use('/inventario', inventarioRoutes)
// router.use('/ventas', ventasRoutes)
// router.use('/clientes', clientesRoutes)
// router.use('/reportes', reportesRoutes)

export default router