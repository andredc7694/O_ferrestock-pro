# plan.md — Módulo de Proveedores
# FerreStock Pro — Sprint 3
# Flujo SDD: /speckit.plan

---

## 1. ENDPOINTS A IMPLEMENTAR

```
GET    /api/proveedores          → lista paginada (solo Admin)
GET    /api/proveedores/:id      → detalle con productos (solo Admin)
POST   /api/proveedores          → crear (solo Admin)
PUT    /api/proveedores/:id      → editar (solo Admin)
DELETE /api/proveedores/:id      → desactivar soft delete (solo Admin)
```

---

## 2. ARCHIVOS A CREAR

### Backend
```
backend/src/
├── services/
│   └── proveedores.service.js
├── controllers/
│   └── proveedores.controller.js
└── routes/
    └── proveedores.routes.js
```

### Frontend
```
frontend/src/
├── pages/proveedores/
│   ├── ProveedoresPage.jsx       ← Tabla con búsqueda y paginación
│   ├── ProveedorFormPage.jsx     ← Formulario crear/editar
│   └── ProveedorDetallePage.jsx  ← Detalle con productos asociados
├── services/
│   └── proveedores.service.js
└── hooks/
    └── useProveedores.js
```

---

## 3. NOTA SOBRE EL MODELO

El modelo Proveedor.js ya fue creado en el Sprint 1.
Solo necesitamos el servicio, controlador y rutas.

---

## 4. QUERY DE DETALLE CON PRODUCTOS

```javascript
Proveedor.findByPk(id, {
  include: [{
    model: Producto,
    as: 'productos',
    where: { activo: 1 },
    required: false,
    include: [
      { model: Categoria, as: 'categoria', attributes: ['nombre'] },
      { model: Inventario, as: 'inventario', attributes: ['stock_actual'] }
    ]
  }]
})
```

---

## 5. VALIDACIÓN DE RUC

```javascript
// RUC peruano: exactamente 11 dígitos numéricos
const validarRUC = (ruc) => {
  return /^\d{11}$/.test(ruc)
}
```

---

## 6. FORMATO DE RESPUESTA — DETALLE DE PROVEEDOR

```json
{
  "success": true,
  "data": {
    "id": 1,
    "razon_social": "Distribuidora Ferretera SAC",
    "ruc": "20601234567",
    "telefono": "066-312000",
    "email": "ventas@distferretera.com",
    "direccion": "Av. Mariscal Cáceres 450, Ayacucho",
    "nombre_contacto": "Juan Quispe",
    "activo": 1,
    "productos": [
      {
        "id": 1,
        "codigo": "HERR-0001",
        "nombre": "Martillo carpintero 16oz",
        "categoria": { "nombre": "Herramientas Manuales" },
        "inventario": { "stock_actual": 20 }
      }
    ]
  }
}
```
