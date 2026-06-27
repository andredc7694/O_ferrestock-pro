import sequelize from '../config/database.js'
import Rol from './Rol.js'
import Usuario from './Usuario.js'
import Categoria from './Categoria.js'
import UnidadMedida from './UnidadMedida.js'
import Proveedor from './Proveedor.js'
import Producto from './Producto.js'
import Inventario from './Inventario.js'

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

export {
  sequelize,
  Rol, Usuario,
  Categoria, UnidadMedida, Proveedor,
  Producto, Inventario
}