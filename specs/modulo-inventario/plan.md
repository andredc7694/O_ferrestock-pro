# plan.md — Módulo de Inventario
# FerreStock Pro — Sprint 2
# Flujo SDD: /speckit.plan

---

## 1. ENDPOINTS A IMPLEMENTAR

```
GET  /api/inventario                → stock actual de todos los productos
GET  /api/inventario/alertas        → productos con stock crítico
GET  /api/inventario/movimientos    → historial paginado con filtros
POST /api/inventario/movimientos    → registrar nuevo movimiento
```

---

## 2. ARCHIVOS A CREAR

### Backend
```
backend/src/
├── models/
│   └── MovimientoInventario.js
├── services/
│   └── inventario.service.js
├── controllers/
│   └── inventario.controller.js
└── routes/
    └── inventario.routes.js
```

### Frontend
```
frontend/src/
├── pages/inventario/
│   ├── InventarioPage.jsx       ← Stock actual + alertas + botón nuevo movimiento
│   └── MovimientoFormPage.jsx   ← Formulario registrar movimiento
├── services/
│   └── inventario.service.js
└── hooks/
    └── useInventario.js
```

---

## 3. MODELO: MovimientoInventario

```javascript
id, producto_id (FK), usuario_id (FK), venta_id (FK nullable),
tipo ENUM('ENTRADA','SALIDA','AJUSTE','DEVOLUCION'),
cantidad INT (positivo = entrada, negativo = salida),
stock_antes INT, stock_despues INT,
motivo VARCHAR(255),
created_at DATETIME
// SIN updated_at ni deleted_at → INMUTABLE
```

---

## 4. FLUJO DE REGISTRO DE MOVIMIENTO (transacción atómica)

```
POST /api/inventario/movimientos
  Body: { producto_id, tipo, cantidad, motivo }

  1. Verificar que el producto existe y está activo
  2. Obtener stock_actual del inventario
  3. Si es SALIDA o AJUSTE:
     → Verificar que cantidad <= stock_actual
     → Si no hay suficiente stock → error 400
  4. Calcular nuevo stock:
     → ENTRADA: stock_nuevo = stock_actual + cantidad
     → SALIDA/AJUSTE: stock_nuevo = stock_actual - cantidad
     → DEVOLUCION: stock_nuevo = stock_actual + cantidad
  5. Iniciar transacción Sequelize:
     a. UPDATE inventario SET stock_actual = stock_nuevo WHERE producto_id = X
     b. INSERT movimientos_inventario (producto_id, usuario_id, tipo, cantidad,
        stock_antes, stock_despues, motivo)
  6. Si todo OK → commit → devolver movimiento registrado
  7. Si algo falla → rollback → error 500
```

---

## 5. QUERY DE STOCK ACTUAL (con alertas)

```javascript
Inventario.findAll({
  include: [
    {
      model: Producto,
      as: 'producto',
      where: { activo: 1 },
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre'] },
        { model: Proveedor, as: 'proveedor',
          attributes: ['razon_social', 'telefono'], required: false }
      ]
    }
  ],
  order: [[{ model: Producto, as: 'producto' }, 'nombre', 'ASC']]
})
// Luego calcular estado_stock por cada registro
```

---

## 6. QUERY DE HISTORIAL DE MOVIMIENTOS

```javascript
MovimientoInventario.findAndCountAll({
  where: filtros,          // producto_id, tipo, rango de fechas
  include: [
    { model: Producto, as: 'producto', attributes: ['codigo', 'nombre'] },
    { model: Usuario, as: 'usuario', attributes: ['nombre', 'apellidos'] }
  ],
  order: [['created_at', 'DESC']],
  limit, offset
})
```

---

## 7. FORMATO DE RESPUESTA — MOVIMIENTO REGISTRADO

```json
{
  "success": true,
  "message": "Movimiento registrado correctamente",
  "data": {
    "id": 11,
    "tipo": "ENTRADA",
    "cantidad": 20,
    "stock_antes": 5,
    "stock_despues": 25,
    "motivo": "Compra a proveedor - Factura 001-0123",
    "producto": { "codigo": "HERR-0001", "nombre": "Martillo carpintero 16oz" },
    "usuario": { "nombre": "Admin", "apellidos": "Sistema" },
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 8. FORMATO DE RESPUESTA — ALERTAS

```json
{
  "success": true,
  "message": "Alertas de stock crítico",
  "data": [
    {
      "producto_id": 4,
      "codigo": "ELEC-0001",
      "nombre": "Taladro percutor 650W",
      "stock_actual": 2,
      "stock_minimo": 2,
      "estado_stock": "CRITICO",
      "proveedor": "Distribuidora Ferretera SAC",
      "telefono_proveedor": "066-312000"
    }
  ]
}
```
