# tasks.md — Módulo de Inventario
# FerreStock Pro — Sprint 2
# Flujo SDD: /speckit.tasks

---

## TAREA 1 — Modelo MovimientoInventario

**Criterios de aceptación:**
- [ ] Mapea correctamente la tabla movimientos_inventario
- [ ] ENUM tipo: ENTRADA, SALIDA, AJUSTE, DEVOLUCION
- [ ] SIN paranoid (los movimientos no se eliminan nunca)
- [ ] SIN updated_at (inmutable, solo created_at)
- [ ] Asociaciones definidas en models/index.js:
      MovimientoInventario belongsTo Producto
      MovimientoInventario belongsTo Usuario

---

## TAREA 2 — Servicio de inventario

**Criterios de aceptación:**
- [ ] obtenerStock(): lista todos los productos activos con stock e info de proveedor
- [ ] obtenerAlertas(): lista solo productos con stock_actual <= stock_minimo
- [ ] obtenerMovimientos(filtros, paginacion): historial paginado filtrable
- [ ] registrarMovimiento(datos, usuarioId): transacción atómica completa
- [ ] registrarMovimiento valida stock suficiente antes de salidas
- [ ] registrarMovimiento calcula stock_antes y stock_despues correctamente
- [ ] registrarMovimiento hace rollback si falla cualquier operación

---

## TAREA 3 — Controlador de inventario

**Criterios de aceptación:**
- [ ] stock(): llama obtenerStock() y responde con lista
- [ ] alertas(): llama obtenerAlertas() y responde con lista
- [ ] movimientos(): extrae filtros del query y llama obtenerMovimientos()
- [ ] registrar(): valida campos requeridos, llama registrarMovimiento()
- [ ] Todos los métodos tienen try/catch

---

## TAREA 4 — Rutas de inventario

**Criterios de aceptación:**
- [ ] GET /api/inventario → verificarToken + verificarRol(Admin, Bodeguero)
- [ ] GET /api/inventario/alertas → verificarToken + verificarRol(Admin, Bodeguero)
- [ ] GET /api/inventario/movimientos → verificarToken + verificarRol(Admin, Bodeguero)
- [ ] POST /api/inventario/movimientos → verificarToken + verificarRol(Admin, Bodeguero)
- [ ] Rutas registradas en routes/index.js

---

## TAREA 5 — Servicio frontend + Hook

**Criterios de aceptación:**
- [ ] inventario.service.js: obtenerStock(), obtenerAlertas(),
      obtenerMovimientos(params), registrarMovimiento(datos)
- [ ] useInventario.js: devuelve stock, alertas, movimientos, loading, error
- [ ] El hook carga stock y alertas al montar el componente

---

## TAREA 6 — Página InventarioPage

**Criterios de aceptación:**
- [ ] Muestra tabla de stock con columnas:
      Código, Nombre, Categoría, Stock Actual, Stock Mínimo, Estado, Proveedor
- [ ] Badge de color por estado (verde/amarillo/rojo)
- [ ] Sección de alertas: lista productos críticos con proveedor y teléfono
- [ ] Contador de alertas visible en la cabecera de la sección
- [ ] Botón "Registrar Movimiento" navega al formulario
- [ ] Pestaña o sección para ver el historial de movimientos
- [ ] El historial tiene filtros por tipo y paginación

---

## TAREA 7 — Página MovimientoFormPage

**Criterios de aceptación:**
- [ ] Select de producto (busca por nombre)
- [ ] Select de tipo: ENTRADA, SALIDA, AJUSTE, DEVOLUCION
- [ ] Campo cantidad (número positivo)
- [ ] Campo motivo (obligatorio para SALIDA y AJUSTE)
- [ ] Muestra el stock actual del producto seleccionado en tiempo real
- [ ] Validación: cantidad > 0
- [ ] Validación: para SALIDA, cantidad <= stock actual (alerta visual)
- [ ] Al registrar exitosamente, redirige al inventario con mensaje de éxito

---

## TAREA 8 — Actualizar App.jsx y Dashboard

**Criterios de aceptación:**
- [ ] Ruta /inventario → InventarioPage (Admin y Bodeguero)
- [ ] Ruta /inventario/movimiento/nuevo → MovimientoFormPage
- [ ] Dashboard muestra contador de alertas de stock crítico
- [ ] Link a Inventario en el Dashboard

---

## TAREA 9 — Pruebas en Postman

**Criterios de aceptación:**
- [ ] GET /api/inventario → lista con stock y estado
- [ ] GET /api/inventario/alertas → productos críticos con proveedor
- [ ] GET /api/inventario/movimientos → historial paginado
- [ ] POST entrada: stock sube correctamente
- [ ] POST salida válida: stock baja correctamente
- [ ] POST salida inválida (más del stock): error 400 con mensaje claro
- [ ] Verificar en MySQL que movimientos_inventario tiene los registros
