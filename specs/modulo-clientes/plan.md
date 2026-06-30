# plan.md — Módulo de Clientes
# FerreStock Pro — Sprint 5
# Flujo SDD: /speckit.plan

---

## 1. ENDPOINTS A IMPLEMENTAR

```
GET    /api/clientes              → lista paginada con búsqueda
GET    /api/clientes/:id          → detalle con total acumulado
GET    /api/clientes/:id/ventas   → historial de compras paginado
POST   /api/clientes              → crear cliente
PUT    /api/clientes/:id          → editar cliente
DELETE /api/clientes/:id          → desactivar (solo Admin)
```

---

## 2. ARCHIVOS A CREAR

### Backend
```
backend/src/
├── services/
│   └── clientes.service.js
├── controllers/
│   └── clientes.controller.js
└── routes/
    └── clientes.routes.js
```

### Frontend
```
frontend/src/
├── pages/clientes/
│   ├── ClientesPage.jsx        ← Tabla con búsqueda
│   ├── ClienteFormPage.jsx     ← Formulario crear/editar
│   └── ClienteDetallePage.jsx  ← Detalle con historial
├── services/
│   └── clientes.service.js
└── hooks/
    └── useClientes.js
```

---

## 3. NOTA SOBRE EL MODELO

El modelo Cliente.js ya fue creado en el Sprint 4.
Solo necesitamos servicio, controlador y rutas.

---

## 4. VALIDACIÓN DE DOCUMENTOS

```javascript
const validarDocumento = (tipo, numero) => {
  if (tipo === 'DNI') return /^\d{8}$/.test(numero)
  if (tipo === 'RUC') return /^\d{11}$/.test(numero)
  return false
}
```

---

## 5. QUERY HISTORIAL CON TOTAL ACUMULADO

```javascript
// Obtener todas las ventas del cliente
const ventas = await Venta.findAll({
  where: { cliente_id: id, estado: 'COMPLETADA' },
  include: [{ model: DetalleVenta, as: 'items' }]
})

// Calcular total acumulado
const totalAcumulado = ventas.reduce(
  (acc, v) => acc + parseFloat(v.total), 0
)
```

---

## 6. INTEGRACIÓN CON EL POS

El POS necesita buscar clientes rápidamente.
Se reutiliza el endpoint GET /api/clientes?search=DNI
y se muestra un dropdown con los resultados.

---

## 7. FORMATO RESPUESTA — DETALLE CON HISTORIAL

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellidos": "Quispe Flores",
    "tipo_documento": "DNI",
    "numero_documento": "12345678",
    "telefono": "987654321",
    "total_acumulado": 245.50,
    "total_compras": 5
  }
}
```