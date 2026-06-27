# plan.md — Módulo de Ventas (POS)
# FerreStock Pro — Sprint 4
# Flujo SDD: /speckit.plan

---

## 1. ENDPOINTS A IMPLEMENTAR

```
GET  /api/ventas                  → historial paginado con filtros
GET  /api/ventas/:id              → detalle completo de una venta
GET  /api/ventas/:id/comprobante  → datos del comprobante
POST /api/ventas                  → registrar venta completa
```

---

## 2. ARCHIVOS A CREAR

### Backend
```
backend/src/
├── models/
│   ├── Venta.js
│   └── DetalleVenta.js
├── services/
│   └── ventas.service.js
├── controllers/
│   └── ventas.controller.js
└── routes/
    └── ventas.routes.js
```

### Frontend
```
frontend/src/
├── pages/ventas/
│   ├── PosPage.jsx           ← Punto de venta con carrito
│   ├── ComprobantePage.jsx   ← Comprobante imprimible
│   └── VentasPage.jsx        ← Historial con filtros
├── services/
│   └── ventas.service.js
└── hooks/
    └── useVentas.js
```

---

## 3. MODELOS

### Venta
```
id, cliente_id (FK nullable), vendedor_id (FK),
numero_venta (único), subtotal, porcentaje_desc,
monto_descuento, total, metodo_pago ENUM, estado ENUM,
observaciones, fecha_venta, created_at, updated_at, deleted_at
```

### DetalleVenta
```
id, venta_id (FK CASCADE), producto_id (FK),
cantidad, precio_unitario (snapshot), subtotal,
created_at
```

---

## 4. FLUJO TRANSACCIÓN ATÓMICA DE VENTA

```
POST /api/ventas
Body: {
  cliente_id: null,        // opcional
  items: [
    { producto_id: 1, cantidad: 2, precio_unitario: 28.00 }
  ],
  porcentaje_desc: 0,
  metodo_pago: 'EFECTIVO',
  observaciones: ''
}

Servicio:
1. Validar que items no esté vacío
2. Para cada item:
   a. Verificar que el producto existe y está activo
   b. Verificar stock suficiente en inventario
   c. Calcular subtotal del ítem
3. Calcular subtotal general, descuento y total
4. Generar número de venta (VTA-YYYY-XXXX)
5. INICIAR TRANSACCIÓN:
   a. INSERT en ventas
   b. INSERT en detalle_ventas (un registro por ítem)
   c. Para cada ítem:
      - UPDATE inventario (stock_actual - cantidad)
      - INSERT en movimientos_inventario (tipo SALIDA)
6. COMMIT si todo OK → devolver venta con comprobante
7. ROLLBACK si algo falla → error 500
```

---

## 5. GENERADOR DE NÚMERO DE VENTA

```javascript
// Formato: VTA-YYYY-XXXX
// Ejemplo: VTA-2025-0001, VTA-2025-0042

const generarNumeroVenta = async () => {
  const anio = new Date().getFullYear()
  const prefijo = `VTA-${anio}-`

  const ultimaVenta = await Venta.findOne({
    where: { numero_venta: { [Op.like]: `${prefijo}%` } },
    order: [['numero_venta', 'DESC']],
    paranoid: false
  })

  let siguiente = 1
  if (ultimaVenta) {
    const partes = ultimaVenta.numero_venta.split('-')
    siguiente = parseInt(partes[2]) + 1
  }

  return `${prefijo}${String(siguiente).padStart(4, '0')}`
}
```

---

## 6. FORMATO BODY — CREAR VENTA

```json
{
  "cliente_id": null,
  "items": [
    { "producto_id": 1, "cantidad": 2, "precio_unitario": 28.00 },
    { "producto_id": 3, "cantidad": 1, "precio_unitario": 20.00 }
  ],
  "porcentaje_desc": 5,
  "metodo_pago": "EFECTIVO",
  "observaciones": ""
}
```

---

## 7. FORMATO RESPUESTA — VENTA CREADA

```json
{
  "success": true,
  "message": "Venta registrada correctamente",
  "data": {
    "id": 1,
    "numero_venta": "VTA-2025-0001",
    "fecha_venta": "2025-01-15T10:30:00.000Z",
    "subtotal": 76.00,
    "porcentaje_desc": 5,
    "monto_descuento": 3.80,
    "total": 72.20,
    "metodo_pago": "EFECTIVO",
    "estado": "COMPLETADA",
    "vendedor": { "nombre": "Admin", "apellidos": "Sistema" },
    "cliente": null,
    "items": [
      {
        "producto": { "codigo": "HERR-0001", "nombre": "Martillo carpintero 16oz" },
        "cantidad": 2,
        "precio_unitario": 28.00,
        "subtotal": 56.00
      }
    ]
  }
}
```
