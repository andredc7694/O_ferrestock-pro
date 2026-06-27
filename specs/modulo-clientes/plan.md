# plan.md — Módulo de Productos
# FerreStock Pro — Sprint 1
# Flujo SDD: /speckit.plan

---

## 1. ENDPOINTS A IMPLEMENTAR

### Categorías
```
GET    /api/categorias          → todos (Admin, Vendedor, Bodeguero)
POST   /api/categorias          → solo Admin
PUT    /api/categorias/:id      → solo Admin
DELETE /api/categorias/:id      → solo Admin
```

### Productos
```
GET    /api/productos           → todos (con paginación, búsqueda, filtros)
GET    /api/productos/:id       → todos
POST   /api/productos           → Admin y Bodeguero
PUT    /api/productos/:id       → Admin y Bodeguero
DELETE /api/productos/:id       → solo Admin
```

---

## 2. ARCHIVOS A CREAR

### Backend
```
backend/src/
├── models/
│   ├── Categoria.js
│   ├── UnidadMedida.js
│   ├── Proveedor.js
│   ├── Producto.js
│   └── Inventario.js
├── controllers/
│   ├── categorias.controller.js
│   └── productos.controller.js
├── services/
│   ├── categorias.service.js
│   └── productos.service.js
└── routes/
    ├── categorias.routes.js
    └── productos.routes.js
```

### Frontend
```
frontend/src/
├── pages/productos/
│   ├── ProductosPage.jsx       ← Tabla con búsqueda y filtros
│   └── ProductoFormPage.jsx    ← Formulario crear/editar
├── services/
│   ├── categorias.service.js
│   └── productos.service.js
└── hooks/
    ├── useCategorias.js
    └── useProductos.js
```

---

## 3. MODELOS SEQUELIZE

### Categoria
```javascript
id, nombre (único), descripcion, created_at, updated_at, deleted_at
```

### UnidadMedida
```javascript
id, nombre (único), abreviatura, created_at, updated_at
```

### Proveedor
```javascript
id, razon_social, ruc (único), telefono, email, direccion,
nombre_contacto, activo, created_at, updated_at, deleted_at
```

### Producto
```javascript
id, categoria_id (FK), unidad_medida_id (FK), proveedor_id (FK nullable),
codigo (único), nombre, descripcion, precio_compra, precio_venta,
stock_minimo, activo, created_at, updated_at, deleted_at
```

### Inventario
```javascript
id, producto_id (FK único 1:1), stock_actual (default 0),
created_at, updated_at
```

---

## 4. ASOCIACIONES

```
Categoria    hasMany  Producto  (FK: categoria_id)
Producto     belongsTo Categoria
UnidadMedida hasMany  Producto  (FK: unidad_medida_id)
Producto     belongsTo UnidadMedida
Proveedor    hasMany  Producto  (FK: proveedor_id)
Producto     belongsTo Proveedor
Producto     hasOne   Inventario (FK: producto_id)
Inventario   belongsTo Producto
```

---

## 5. LÓGICA DEL CÓDIGO AUTOGENERADO

```javascript
// Tomar las primeras 4 letras de la categoría en mayúsculas
// Buscar el último código de esa categoría en la BD
// Incrementar el número en 1
// Formatear con ceros a la izquierda hasta 4 dígitos

// Ejemplos:
// Categoría "Herramientas Manuales" → prefijo "HERR"
// Último código HERR-0010 → nuevo código HERR-0011
// Si no existe ninguno → HERR-0001
```

---

## 6. FLUJO CREAR PRODUCTO (transacción)

```
1. Validar datos de entrada
2. Verificar que el código no exista (si se ingresó uno manual)
3. Si no hay código → autogenerar
4. Crear registro en tabla productos
5. Crear registro en tabla inventario con stock_actual = 0
6. Todo en una transacción Sequelize (si falla algo, revierte todo)
7. Devolver el producto creado con su stock
```

---

## 7. QUERY DE LISTADO CON JOINS

```javascript
// El listado de productos debe incluir:
// - Nombre de la categoría
// - Abreviatura de la unidad de medida
// - Stock actual (JOIN con inventario)
// - Nombre del proveedor (opcional)
// - Estado de stock: NORMAL, CRITICO, SIN_STOCK

Producto.findAndCountAll({
  where: { activo: 1, deleted_at: null },
  include: [
    { model: Categoria, as: 'categoria', attributes: ['nombre'] },
    { model: UnidadMedida, as: 'unidad_medida', attributes: ['nombre', 'abreviatura'] },
    { model: Inventario, as: 'inventario', attributes: ['stock_actual'] },
    { model: Proveedor, as: 'proveedor', attributes: ['razon_social'] }
  ],
  limit: porPagina,
  offset: offset
})
```

---

## 8. FORMATO DE RESPUESTA — LISTADO DE PRODUCTOS

```json
{
  "success": true,
  "message": "Productos obtenidos correctamente",
  "data": [
    {
      "id": 1,
      "codigo": "HERR-0001",
      "nombre": "Martillo carpintero 16oz",
      "descripcion": "Martillo de acero con mango de madera",
      "precio_compra": 18.00,
      "precio_venta": 28.00,
      "stock_minimo": 5,
      "activo": 1,
      "categoria": { "nombre": "Herramientas Manuales" },
      "unidad_medida": { "nombre": "Unidad", "abreviatura": "und" },
      "inventario": { "stock_actual": 20 },
      "proveedor": { "razon_social": "Distribuidora Ferretera SAC" },
      "estado_stock": "NORMAL"
    }
  ],
  "pagination": {
    "total": 10,
    "pagina_actual": 1,
    "total_paginas": 1,
    "por_pagina": 10
  }
}
```
