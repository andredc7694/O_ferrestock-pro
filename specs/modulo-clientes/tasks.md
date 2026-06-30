# tasks.md — Módulo de Clientes
# FerreStock Pro — Sprint 5
# Flujo SDD: /speckit.tasks

---

## TAREA 1 — Servicio de Clientes

**Criterios de aceptación:**
- [ ] listar(filtros): búsqueda por nombre, numero_documento o teléfono
- [ ] obtenerPorId(id): devuelve cliente con total_acumulado y total_compras
- [ ] obtenerVentas(id, paginacion): historial de compras del cliente
- [ ] crear(datos): valida tipo y número de documento, unicidad
- [ ] editar(id, datos): revalida documento si cambia
- [ ] desactivar(id): soft delete

---

## TAREA 2 — Controlador y Rutas

**Criterios de aceptación:**
- [ ] GET /api/clientes → Admin y Vendedor
- [ ] GET /api/clientes/:id → Admin y Vendedor
- [ ] GET /api/clientes/:id/ventas → Admin y Vendedor
- [ ] POST /api/clientes → Admin y Vendedor
- [ ] PUT /api/clientes/:id → Admin y Vendedor
- [ ] DELETE /api/clientes/:id → solo Admin
- [ ] Rutas registradas en routes/index.js

---

## TAREA 3 — Servicio frontend + Hook

**Criterios de aceptación:**
- [ ] clientes.service.js: listar, obtener, obtenerVentas, crear, editar, desactivar
- [ ] useClientes.js: { clientes, pagination, loading, error, recargar }

---

## TAREA 4 — ClientesPage (tabla)

**Criterios de aceptación:**
- [ ] Tabla: Nombre, Documento, Teléfono, Email, Acciones
- [ ] Búsqueda con debounce 300ms
- [ ] Botones: Ver detalle, Editar, Desactivar (solo Admin)
- [ ] Botón "Nuevo Cliente"

---

## TAREA 5 — ClienteFormPage (formulario)

**Criterios de aceptación:**
- [ ] Funciona para crear y editar
- [ ] Select tipo documento (DNI/RUC) cambia la validación
- [ ] Validación en tiempo real con indicador visual
- [ ] Mensaje de éxito y redirección al guardar

---

## TAREA 6 — ClienteDetallePage (detalle + historial)

**Criterios de aceptación:**
- [ ] Datos del cliente con total acumulado destacado
- [ ] Historial de compras paginado
- [ ] Clic en venta → abre comprobante
- [ ] Botón editar cliente

---

## TAREA 7 — Integrar búsqueda de cliente en PosPage

**Criterios de aceptación:**
- [ ] Campo de búsqueda de cliente en el POS
- [ ] Busca por DNI o nombre con debounce
- [ ] Dropdown con resultados
- [ ] Al seleccionar muestra nombre del cliente
- [ ] Botón para quitar cliente seleccionado (venta anónima)

---

## TAREA 8 — Actualizar App.jsx y Dashboard

**Criterios de aceptación:**
- [ ] /clientes → ClientesPage
- [ ] /clientes/nuevo → ClienteFormPage
- [ ] /clientes/:id → ClienteDetallePage
- [ ] /clientes/:id/editar → ClienteFormPage
- [ ] Acceso desde Dashboard para Admin y Vendedor

---

## TAREA 9 — Pruebas en Postman

**Criterios de aceptación:**
- [ ] POST con DNI de 7 dígitos → error 400
- [ ] POST con DNI duplicado → error 400
- [ ] POST válido → cliente creado
- [ ] GET /api/clientes/1 → datos con total acumulado
- [ ] GET /api/clientes/1/ventas → historial paginado