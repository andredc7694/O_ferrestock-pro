# spec.md — Módulo de Inventario
# FerreStock Pro — Sprint 2
# Flujo SDD: /speckit.specify

---

## 1. DESCRIPCIÓN DE LA FEATURE

El módulo de inventario controla el stock de cada producto en tiempo real.
Permite registrar entradas (compras a proveedores), salidas manuales (productos
dañados, muestras, ajustes) y devoluciones. Cada movimiento queda registrado
con auditoría completa: quién lo hizo, cuándo, cuánto había antes y después.

Es el módulo más crítico para la integridad de datos del sistema: el stock
nunca puede quedar negativo y los movimientos son inmutables una vez registrados.

---

## 2. HISTORIAS DE USUARIO CUBIERTAS

- HU-009: Control de stock actual (P2 — Alta)
- HU-010: Registro de movimientos de inventario (P2 — Alta)
- HU-011: Alertas de reposición (P3 — Media)

---

## 3. ACTORES

- Administrador: acceso completo
- Bodeguero: acceso completo al inventario
- Vendedor: NO tiene acceso a este módulo

---

## 4. QUÉ DEBE HACER EL SISTEMA

### 4.1 Ver stock actual
- Mostrar todos los productos con su stock actual
- Indicador de color por estado:
  - 🟢 NORMAL: stock_actual > stock_minimo
  - 🟡 CRITICO: 0 < stock_actual <= stock_minimo
  - 🔴 SIN_STOCK: stock_actual = 0
- Mostrar el proveedor asociado a cada producto

### 4.2 Registrar movimiento de ENTRADA
- Producto llega del proveedor → stock sube
- Campos: producto, cantidad (> 0), motivo
- El stock se actualiza inmediatamente
- Registra: producto, tipo ENTRADA, cantidad,
  stock_antes, stock_despues, usuario, fecha

### 4.3 Registrar movimiento de SALIDA manual
- Productos dañados, muestras, ajustes → stock baja
- Campos: producto, cantidad (> 0), motivo (obligatorio)
- NO puede registrarse si la cantidad supera el stock disponible
- Registra con tipo SALIDA o AJUSTE según corresponda

### 4.4 Registrar devolución
- Producto devuelto por cliente → stock sube
- Registra con tipo DEVOLUCION

### 4.5 Ver historial de movimientos
- Lista paginada de todos los movimientos
- Filtros: por producto, por tipo (ENTRADA/SALIDA/AJUSTE/DEVOLUCION),
  por rango de fechas
- Muestra: producto, tipo, cantidad, stock antes, stock después,
  usuario que lo registró, fecha y hora

### 4.6 Alertas de stock crítico
- Lista de productos con stock_actual <= stock_minimo
- Incluye: nombre, código, stock actual, stock mínimo,
  proveedor y teléfono del proveedor
- El dashboard principal muestra el conteo de alertas

---

## 5. QUÉ NO HACE ESTE MÓDULO

- No genera órdenes de compra formales a proveedores
- No maneja múltiples almacenes o ubicaciones
- Las salidas por venta las maneja automáticamente el módulo de ventas

---

## 6. CRITERIOS DE ACEPTACIÓN

- [ ] GET /api/inventario lista todos los productos con stock actual
- [ ] GET /api/inventario/alertas lista productos en stock crítico con proveedor
- [ ] GET /api/inventario/movimientos lista historial paginado con filtros
- [ ] POST /api/inventario/movimientos registra ENTRADA y actualiza stock
- [ ] POST /api/inventario/movimientos registra SALIDA y valida stock suficiente
- [ ] No se puede registrar salida mayor al stock disponible → error claro
- [ ] El stock nunca queda negativo (validación en backend Y constraint en BD)
- [ ] Cada movimiento registra stock_antes y stock_despues para auditoría
- [ ] Los movimientos son inmutables (no hay PUT ni DELETE en movimientos)
- [ ] Frontend: tabla de inventario con colores de estado
- [ ] Frontend: formulario para registrar movimiento
- [ ] Frontend: historial de movimientos con filtros
- [ ] Frontend: sección de alertas visible con datos del proveedor
- [ ] Probado en Postman: entrada, salida válida, salida inválida (sin stock)

---

## 7. REGLAS DE NEGOCIO CRÍTICAS

- El stock NUNCA puede ser negativo. Si la salida supera el stock → error 400
- Los movimientos son INMUTABLES: no se editan ni eliminan nunca
- Toda operación de stock es atómica: actualiza inventario Y registra movimiento
  en una sola transacción. Si falla cualquier parte, se revierte todo
- El motivo es OBLIGATORIO para salidas manuales y ajustes
- Solo Administrador y Bodeguero pueden registrar movimientos
