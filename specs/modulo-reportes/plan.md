# plan.md — Módulo de Reportes y Dashboard
# FerreStock Pro — Sprint 6
# Flujo SDD: /speckit.plan

---

## 1. ENDPOINTS A IMPLEMENTAR

```
GET /api/reportes/dashboard               → métricas completas del día/mes
GET /api/reportes/ventas                  → reporte por período (?fecha_inicio&fecha_fin)
GET /api/reportes/productos-mas-vendidos  → top 10 (?periodo=mes|semana|hoy)
GET /api/reportes/stock                   → inventario completo con valor total
```

---

## 2. ARCHIVOS A CREAR

### Backend
```
backend/src/
├── services/
│   └── reportes.service.js
├── controllers/
│   └── reportes.controller.js
└── routes/
    └── reportes.routes.js
```

### Frontend
```
frontend/src/
├── pages/
│   ├── dashboard/
│   │   └── DashboardPage.jsx    ← Dashboard principal del Admin
│   └── reportes/
│       └── ReportesPage.jsx     ← Página con 3 secciones de reportes
├── services/
│   └── reportes.service.js
└── hooks/
    └── useReportes.js
```

---

## 3. QUERIES SQL CLAVE

### Ventas del día
```javascript
Venta.findAll({
  where: {
    estado: 'COMPLETADA',
    fecha_venta: {
      [Op.gte]: inicio del día actual,
      [Op.lte]: fin del día actual
    }
  }
})
```

### Ventas de los últimos 7 días (para el gráfico)
```javascript
// Iterar por cada uno de los últimos 7 días
// Para cada día: contar ventas y sumar montos
// Devolver array: [{ fecha, total_ventas, monto }]
```

### Top productos más vendidos
```javascript
DetalleVenta.findAll({
  attributes: [
    'producto_id',
    [sequelize.fn('SUM', sequelize.col('cantidad')), 'unidades_vendidas'],
    [sequelize.fn('SUM', sequelize.col('subtotal')), 'ingreso_generado']
  ],
  include: [{
    model: Venta, as: 'venta',
    where: { estado: 'COMPLETADA', fecha_venta: { [Op.between]: [inicio, fin] } },
    attributes: []
  }],
  group: ['producto_id'],
  order: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'DESC']],
  limit: 10
})
```

### Valor del inventario
```javascript
// stock_actual × precio_compra por cada producto
// SUM de todos = valor total del inventario
```

---

## 4. FORMATO RESPUESTA — DASHBOARD

```json
{
  "success": true,
  "data": {
    "ventas_hoy": {
      "cantidad": 3,
      "monto_total": 245.50,
      "promedio": 81.83
    },
    "ventas_mes": {
      "cantidad": 47,
      "monto_total": 3820.00
    },
    "stock_critico": 3,
    "ultimas_ventas": [...],
    "top_productos_mes": [...],
    "ventas_7_dias": [
      { "fecha": "2025-01-09", "cantidad": 2, "monto": 180.00 },
      { "fecha": "2025-01-10", "cantidad": 5, "monto": 420.50 }
    ]
  }
}
```

---

## 5. LIBRERÍA DE GRÁFICOS

Usar **Recharts** (ya disponible en el proyecto).

```jsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
```

### Gráfico de ventas por día (DashboardPage)
```jsx
<ResponsiveContainer width="100%" height={200}>
  <BarChart data={ventas7dias}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="fecha" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="monto" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>
```

### Gráfico de top productos (ReportesPage)
```jsx
<BarChart data={topProductos} layout="vertical">
  <XAxis type="number" />
  <YAxis dataKey="nombre" type="category" width={150} />
  <Bar dataKey="unidades_vendidas" fill="#10b981" />
</BarChart>
```
