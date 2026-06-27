import sequelize from '../config/database.js'
import Rol from './Rol.js'
import Usuario from './Usuario.js'
import Categoria from './Categoria.js'
import UnidadMedida from './UnidadMedida.js'
import Proveedor from './Proveedor.js'
import Producto from './Producto.js'
import Inventario from './Inventario.js'
import MovimientoInventario from './MovimientoInventario.js'
import Cliente from './Cliente.js'
import Venta from './Venta.js'
import DetalleVenta from './DetalleVenta.js'

// ── ASOCIACIONES ──

// Usuario - Rol
Usuario.belongsTo(Rol, { foreignKey: 'rol_id', as: 'rol' })
Rol.hasMany(Usuario, { foreignKey: 'rol_id', as: 'usuarios' })

// Producto - Categoria
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' })
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' })

// Producto - UnidadMedida
Producto.belongsTo(UnidadMedida, { foreignKey: 'unidad_medida_id', as: 'unidad_medida' })
UnidadMedida.hasMany(Producto, { foreignKey: 'unidad_medida_id', as: 'productos' })

// Producto - Proveedor
Producto.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' })
Proveedor.hasMany(Producto, { foreignKey: 'proveedor_id', as: 'productos' })

// Producto - Inventario (1:1)
Producto.hasOne(Inventario, { foreignKey: 'producto_id', as: 'inventario' })
Inventario.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' })

// MovimientoInventario
MovimientoInventario.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' })
Producto.hasMany(MovimientoInventario, { foreignKey: 'producto_id', as: 'movimientos' })
MovimientoInventario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' })
Usuario.hasMany(MovimientoInventario, { foreignKey: 'usuario_id', as: 'movimientos' })

// Venta - Cliente
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' })
Cliente.hasMany(Venta, { foreignKey: 'cliente_id', as: 'ventas' })

// Venta - Usuario (vendedor)
Venta.belongsTo(Usuario, { foreignKey: 'vendedor_id', as: 'vendedor' })
Usuario.hasMany(Venta, { foreignKey: 'vendedor_id', as: 'ventas' })

// Venta - DetalleVenta
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'items' })
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' })

// DetalleVenta - Producto
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' })
Producto.hasMany(DetalleVenta, { foreignKey: 'producto_id', as: 'detalles' })

export {
  sequelize,
  Rol, Usuario,
  Categoria, UnidadMedida, Proveedor,
  Producto, Inventario, MovimientoInventario,
  Cliente, Venta, DetalleVenta
}