# spec.md — Módulo de Ventas (POS)
# FerreStock Pro — Sprint 4
# Flujo SDD: /speckit.specify

---

## 1. DESCRIPCIÓN DE LA FEATURE

El módulo de ventas es el corazón operativo del sistema. Permite al vendedor
registrar transacciones completas desde una pantalla de punto de venta (POS):
busca productos, los agrega a un carrito, aplica descuentos, selecciona el
método de pago y confirma la venta.

Al confirmar, el sistema ejecuta una transacción atómica que registra la venta,
sus detalles y descuenta el stock de cada producto simultáneamente. Si algo
falla, todo se revierte. Después genera un comprobante imprimible.

---

## 2. HISTORIAS DE USUARIO CUBIERTAS

- HU-014: Registro de venta con carrito (P2 — Alta)
- HU-015: Comprobante de venta (P2 — Alta)
- HU-016: Historial de ventas con filtros (P3 — Media)

---

## 3. ACTORES

- Vendedor: puede registrar ventas y ver su propio historial
- Administrador: puede registrar ventas y ver TODO el historial
- Bodeguero: SIN acceso al módulo de ventas

---

## 4. QUÉ DEBE HACER EL SISTEMA

### 4.1 Pantalla POS
- Campo de búsqueda de productos (por nombre o código)
- Panel lateral con el carrito activo
- Al seleccionar producto: muestra precio y stock disponible
- Si el producto ya está en el carrito: aumenta la cantidad

### 4.2 Carrito de compra
- Agregar productos con cantidad editable
- No se puede agregar más cantidad que el stock disponible
- Subtotal por ítem se recalcula al cambiar cantidad
- Eliminar ítems individuales del carrito
- Limpiar carrito completo

### 4.3 Descuento
- Campo de descuento porcentual (0 a 100%)
- Descuentos mayores al 10% solo para Administrador
- Muestra monto del descuento en soles y total final

### 4.4 Cliente (opcional)
- Búsqueda de cliente por DNI o nombre
- Si no se selecciona cliente → venta anónima

### 4.5 Método de pago
- Opciones: Efectivo, Yape, Plin, Transferencia

### 4.6 Confirmar venta (transacción atómica)
- No se puede confirmar si el carrito está vacío
- Genera número secuencial: VTA-2025-XXXX
- Descuenta stock de cada producto
- Registra movimiento SALIDA en inventario por cada producto
- Limpia el carrito automáticamente
- Muestra el comprobante generado

### 4.7 Comprobante
- Número de venta, fecha y hora, cliente (si aplica)
- Lista de productos con cantidad, precio unitario y subtotal
- Subtotal, descuento y total en soles
- Nombre del vendedor
- Botón de imprimir (diálogo del navegador)
- Consultable desde el historial

### 4.8 Historial de ventas
- Lista paginada con filtros por fecha, vendedor y método de pago
- Admin ve todas las ventas, Vendedor solo las suyas
- Clic en una venta muestra el detalle completo

---

## 5. QUÉ NO HACE ESTE MÓDULO

- No integra pasarela de pagos real
- No genera facturas electrónicas SUNAT
- No maneja ventas al crédito (eso es HU-019, P4)

---

## 6. CRITERIOS DE ACEPTACIÓN

- [ ] POST /api/ventas registra venta con transacción atómica completa
- [ ] POST /api/ventas descuenta stock de cada producto vendido
- [ ] POST /api/ventas registra movimiento SALIDA en inventario
- [ ] POST /api/ventas genera número VTA-YYYY-XXXX único y secuencial
- [ ] POST /api/ventas valida stock suficiente antes de confirmar
- [ ] GET /api/ventas lista historial con filtros y paginación
- [ ] GET /api/ventas/:id devuelve detalle completo de la venta
- [ ] GET /api/ventas/:id/comprobante devuelve datos del comprobante
- [ ] Frontend: PosPage con buscador + carrito lateral funcional
- [ ] Frontend: subtotales y total se recalculan en tiempo real
- [ ] Frontend: descuento con restricción >10% solo Admin
- [ ] Frontend: ComprobantePage con opción imprimir
- [ ] Frontend: VentasPage con historial y filtros
- [ ] Probado en Postman: venta completa, venta sin stock

---

## 7. REGLAS DE NEGOCIO CRÍTICAS

- La venta es una TRANSACCIÓN ATÓMICA: si falla el descuento del stock
  de cualquier producto, toda la venta se revierte completamente
- El stock nunca puede quedar negativo
- El número de venta es único y secuencial por año: VTA-2025-0001
- Un Vendedor NO puede aplicar descuentos mayores al 10%
- El carrito no puede confirmarse vacío
- El precio unitario en detalle_ventas es el precio AL MOMENTO de la venta
  (snapshot), no el precio actual del producto
