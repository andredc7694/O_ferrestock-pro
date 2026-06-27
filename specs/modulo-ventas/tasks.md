# tasks.md — Módulo de Ventas (POS)
# FerreStock Pro — Sprint 4
# Flujo SDD: /speckit.tasks

---

## TAREA 1 — Modelos: Venta y DetalleVenta

**Criterios de aceptación:**
- [ ] Venta.js mapea tabla ventas con todos los campos y ENUMs
- [ ] DetalleVenta.js mapea tabla detalle_ventas sin paranoid
- [ ] Asociaciones en models/index.js:
      Venta belongsTo Cliente, Venta belongsTo Usuario (vendedor)
      Venta hasMany DetalleVenta
      DetalleVenta belongsTo Producto

---

## TAREA 2 — Generador de número de venta

**Archivo:** backend/src/utils/generadores.js (agregar función)

**Criterios de aceptación:**
- [ ] generarNumeroVenta() genera formato VTA-YYYY-XXXX
- [ ] El número es secuencial dentro del año actual
- [ ] Si no hay ventas en el año → VTA-YYYY-0001

---

## TAREA 3 — Servicio de ventas

**Criterios de aceptación:**
- [ ] registrar(datos, vendedorId): transacción atómica completa
- [ ] Valida que items no esté vacío
- [ ] Verifica stock de TODOS los productos antes de iniciar la transacción
- [ ] Si algún producto no tiene stock suficiente → error 400 con nombre del producto
- [ ] Crea venta + detalles + descuenta stock + registra movimientos SALIDA
- [ ] Si falla cualquier paso → rollback completo
- [ ] listar(filtros, paginacion): historial con filtros por fecha/vendedor/método
- [ ] Admin ve todas, Vendedor solo las suyas
- [ ] obtenerPorId(id): devuelve venta con todos sus detalles

---

## TAREA 4 — Controlador y Rutas de Ventas

**Criterios de aceptación:**
- [ ] POST valida que items sea array no vacío
- [ ] GET /api/ventas filtra por rol automáticamente
- [ ] GET /api/ventas/:id/comprobante devuelve datos formateados
- [ ] Rutas registradas en routes/index.js

---

## TAREA 5 — PosPage: Punto de venta

**Criterios de aceptación:**
- [ ] Buscador de productos con debounce 300ms
- [ ] Al seleccionar producto se agrega al carrito
- [ ] Si ya existe en carrito → incrementa cantidad
- [ ] Cantidad editable directamente en el carrito
- [ ] No permite cantidad mayor al stock disponible
- [ ] Subtotal por ítem se recalcula automáticamente
- [ ] Campo de descuento % con restricción >10% para Vendedor
- [ ] Selector de método de pago
- [ ] Botón confirmar deshabilitado si carrito vacío
- [ ] Al confirmar → muestra comprobante

---

## TAREA 6 — ComprobantePage

**Criterios de aceptación:**
- [ ] Muestra todos los datos de la venta
- [ ] Diseño limpio para imprimir
- [ ] Botón imprimir abre window.print()
- [ ] Botón nueva venta limpia el carrito y vuelve al POS

---

## TAREA 7 — VentasPage: Historial

**Criterios de aceptación:**
- [ ] Tabla paginada con: número, fecha, cliente, total, método, vendedor
- [ ] Filtros: rango de fechas, método de pago
- [ ] Clic en fila → detalle de la venta
- [ ] Admin ve todas, Vendedor solo las suyas

---

## TAREA 8 — Actualizar App.jsx

**Criterios de aceptación:**
- [ ] /pos → PosPage (Admin y Vendedor)
- [ ] /ventas → VentasPage (Admin y Vendedor)
- [ ] /ventas/:id/comprobante → ComprobantePage
- [ ] Acceso desde el Dashboard

---

## TAREA 9 — Pruebas en Postman

**Criterios de aceptación:**
- [ ] POST venta válida → VTA-2025-0001 creada, stock descontado
- [ ] POST con stock insuficiente → error 400 con nombre del producto
- [ ] POST con carrito vacío → error 400
- [ ] GET /api/ventas → historial con paginación
- [ ] GET /api/ventas/1 → detalle completo
- [ ] Verificar en MySQL: ventas, detalle_ventas, movimientos_inventario, inventario
