# spec.md — Módulo de Reportes y Dashboard
# FerreStock Pro — Sprint 6
# Flujo SDD: /speckit.specify

---

## 1. DESCRIPCIÓN DE LA FEATURE

El módulo de reportes es la capa de inteligencia del sistema. Transforma los
datos de ventas, inventario y productos en información útil para que el
administrador tome decisiones rápidas sobre el negocio.

El dashboard principal muestra las métricas más importantes del día en una
sola pantalla, con gráficos visuales y alertas de stock crítico.

---

## 2. HISTORIAS DE USUARIO CUBIERTAS

- HU-020: Dashboard principal con métricas (P2 — Alta)
- HU-021: Reporte de ventas por período (P2 — Alta)
- HU-022: Reporte de productos más vendidos (P3 — Media)
- HU-023: Reporte de stock actual (P3 — Media)

---

## 3. ACTORES

- Administrador: acceso completo a todos los reportes
- Vendedor: SIN acceso a reportes ni dashboard financiero
- Bodeguero: SIN acceso a reportes financieros

---

## 4. QUÉ DEBE HACER EL SISTEMA

### 4.1 Dashboard principal
Métricas del día y del mes en una sola llamada:
- Ventas del día: cantidad de transacciones y monto total
- Ventas del mes: cantidad y monto total
- Número de productos en stock crítico
- Últimas 5 ventas del día con número, total y método de pago
- Top 5 productos más vendidos del mes
- Gráfico de barras: ventas de los últimos 7 días (monto por día)

### 4.2 Reporte de ventas por período
Para un rango de fechas seleccionado:
- Total de transacciones en el período
- Monto total en soles
- Promedio por venta
- Desglose por método de pago (Efectivo, Yape, Plin, Transferencia)
- Desglose por vendedor (nombre y monto)
- Gráfico de ventas por día dentro del período

### 4.3 Reporte de productos más vendidos
Top 10 del mes o período seleccionado:
- Nombre y código del producto
- Categoría
- Unidades vendidas
- Ingreso generado en soles
- Gráfico de barras horizontal con top 5

### 4.4 Reporte de stock actual
Estado completo del inventario:
- Todos los productos con stock, estado y valor
- Valor total del inventario (stock × precio compra)
- Filtro por categoría y estado de stock
- Total en soles del inventario

---

## 5. QUÉ NO HACE ESTE MÓDULO

- No exporta a PDF ni Excel (fuera del alcance MVP)
- No incluye reportes de compras a proveedores
- No incluye proyecciones ni análisis predictivo

---

## 6. CRITERIOS DE ACEPTACIÓN

- [ ] GET /api/reportes/dashboard devuelve todas las métricas en una llamada
- [ ] GET /api/reportes/ventas?fecha_inicio=X&fecha_fin=Y devuelve reporte
- [ ] GET /api/reportes/productos-mas-vendidos?periodo=mes devuelve top 10
- [ ] GET /api/reportes/stock devuelve inventario completo con valor total
- [ ] Frontend: DashboardPage con tarjetas, gráfico de 7 días y alertas
- [ ] Frontend: ReportesPage con 3 secciones (ventas, productos, stock)
- [ ] Gráfico de barras con Recharts para ventas por día
- [ ] Gráfico de barras horizontal para top productos
- [ ] Solo el Administrador puede acceder a reportes
- [ ] Probado en Postman: todos los endpoints

---

## 7. REGLAS DE NEGOCIO

- Solo ventas con estado COMPLETADA se incluyen en los reportes
- El período por defecto del dashboard es el día y mes actual
- Los reportes de ventas filtran por fecha_venta, no por created_at
- El valor del inventario = stock_actual × precio_compra por producto
