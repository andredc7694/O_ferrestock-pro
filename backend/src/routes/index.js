import { Router } from 'express'
import authRoutes        from './auth.routes.js'
import categoriasRoutes  from './categorias.routes.js'
import productosRoutes   from './productos.routes.js'
import inventarioRoutes  from './inventario.routes.js'
import proveedoresRoutes from './proveedores.routes.js'
import ventasRoutes      from './ventas.routes.js'
import clientesRoutes    from './clientes.routes.js'

const router = Router()

router.use('/auth',        authRoutes)
router.use('/categorias',  categoriasRoutes)
router.use('/productos',   productosRoutes)
router.use('/inventario',  inventarioRoutes)
router.use('/proveedores', proveedoresRoutes)
router.use('/ventas',      ventasRoutes)
router.use('/clientes',    clientesRoutes)

export default router