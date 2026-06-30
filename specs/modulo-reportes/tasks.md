# tasks.md — Módulo de Reportes y Dashboard
# FerreStock Pro — Sprint 6
# Flujo SDD: /speckit.tasks

---

## TAREA 1 — Servicio de Reportes

**Criterios de aceptación:**
- [ ] obtenerDashboard(): ventas hoy, mes, stock crítico, últimas 5, top 5, 7 días
- [ ] obtenerReporteVentas(fecha_inicio, fecha_fin): métricas del período
- [ ] obtenerTopProductos(periodo): top 10 con unidades e ingreso
- [ ] obtenerReporteStock(categoria_id, estado): inventario con valor total
- [ ] Todos calculan correctamente con ventas estado COMPLETADA

---

## TAREA 2 — Controlador y Rutas de Reportes

**Criterios de aceptación:**
- [ ] Todos los endpoints solo accesibles por Administrador
- [ ] dashboard(): llama obtenerDashboard() y responde
- [ ] ventas(): extrae fechas del query y llama obtenerReporteVentas()
- [ ] topProductos(): extrae período y llama obtenerTopProductos()
- [ ] stock(): extrae filtros y llama obtenerReporteStock()
- [ ] Rutas registradas en routes/index.js

---

## TAREA 3 — Instalar Recharts

**Criterios de aceptación:**
- [ ] Recharts instalado en frontend/
- [ ] Import funciona sin errores

---

## TAREA 4 — DashboardPage

**Criterios de aceptación:**
- [ ] 4 tarjetas: ventas hoy (cantidad y monto), ventas mes, stock crítico
- [ ] Gráfico de barras: ventas de los últimos 7 días con Recharts
- [ ] Lista de últimas 5 ventas del día
- [ ] Lista de top 5 productos del mes
- [ ] Lista de alertas de stock crítico con enlace a inventario
- [ ] Loading skeleton mientras carga
- [ ] Se convierte en la página principal al hacer login como Admin

---

## TAREA 5 — ReportesPage con 3 secciones

**Criterios de aceptación:**
- [ ] Sección 1: Ventas por período con selector de fechas
- [ ] Muestra: total transacciones, monto, promedio, desglose por método y vendedor
- [ ] Gráfico de ventas por día dentro del período
- [ ] Sección 2: Top productos con selector de período
- [ ] Tabla top 10 y gráfico de barras horizontal top 5
- [ ] Sección 3: Stock actual con valor total del inventario
- [ ] Filtros por categoría y estado de stock

---

## TAREA 6 — Actualizar App.jsx y navegación

**Criterios de aceptación:**
- [ ] /dashboard → DashboardPage (solo Admin)
- [ ] /reportes → ReportesPage (solo Admin)
- [ ] Admin hace login → va directo al nuevo DashboardPage
- [ ] Sidebar/Dashboard muestra Reportes solo para Admin

---

## TAREA 7 — Pruebas en Postman

**Criterios de aceptación:**
- [ ] GET /api/reportes/dashboard → todas las métricas correctas
- [ ] GET /api/reportes/ventas?fecha_inicio=2025-01-01&fecha_fin=2025-12-31
- [ ] GET /api/reportes/productos-mas-vendidos?periodo=mes
- [ ] GET /api/reportes/stock → valor total del inventario calculado
