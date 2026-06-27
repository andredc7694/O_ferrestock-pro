# tasks.md — Módulo de Proveedores
# FerreStock Pro — Sprint 3
# Flujo SDD: /speckit.tasks

---

## TAREA 1 — Servicio de Proveedores

**Criterios de aceptación:**
- [ ] listar(filtros, paginacion): búsqueda por razon_social o ruc
- [ ] obtenerPorId(id): devuelve proveedor con sus productos y stock
- [ ] crear(datos): valida RUC 11 dígitos y único
- [ ] editar(id, datos): valida RUC si cambia
- [ ] desactivar(id): soft delete

---

## TAREA 2 — Controlador y Rutas de Proveedores

**Criterios de aceptación:**
- [ ] Todos los endpoints solo accesibles por Administrador
- [ ] Controlador valida campos obligatorios
- [ ] Rutas registradas en routes/index.js

---

## TAREA 3 — Servicio frontend + Hook

**Criterios de aceptación:**
- [ ] proveedores.service.js: listar, obtener, crear, editar, desactivar
- [ ] useProveedores.js: { proveedores, pagination, loading, error, recargar }

---

## TAREA 4 — Página ProveedoresPage (tabla)

**Criterios de aceptación:**
- [ ] Tabla con columnas: Razón Social, RUC, Teléfono, Email, Contacto, Acciones
- [ ] Búsqueda por nombre o RUC con debounce 300ms
- [ ] Paginación funcional
- [ ] Botones: Ver detalle, Editar, Desactivar
- [ ] Botón "Nuevo Proveedor"

---

## TAREA 5 — Página ProveedorFormPage (formulario)

**Criterios de aceptación:**
- [ ] Funciona para crear y editar
- [ ] Validación RUC: exactamente 11 dígitos numéricos
- [ ] Validación en tiempo real con mensaje junto al campo
- [ ] Campos obligatorios: razón social, RUC, teléfono
- [ ] Mensaje de éxito y redirección al guardar

---

## TAREA 6 — Página ProveedorDetallePage (detalle)

**Criterios de aceptación:**
- [ ] Muestra todos los datos del proveedor
- [ ] Lista de productos que suministra con stock actual
- [ ] Badge de stock por producto (NORMAL/CRITICO/SIN_STOCK)
- [ ] Botón para volver a la lista

---

## TAREA 7 — Actualizar App.jsx

**Criterios de aceptación:**
- [ ] Ruta /proveedores → ProveedoresPage
- [ ] Ruta /proveedores/nuevo → ProveedorFormPage
- [ ] Ruta /proveedores/:id → ProveedorDetallePage
- [ ] Ruta /proveedores/:id/editar → ProveedorFormPage
- [ ] Acceso directo desde el Dashboard

---

## TAREA 8 — Pruebas en Postman

**Criterios de aceptación:**
- [ ] GET /api/proveedores → lista los 2 del seed
- [ ] GET /api/proveedores/1 → detalle con productos asociados
- [ ] POST con RUC de 10 dígitos → error 400
- [ ] POST con RUC duplicado → error 400
- [ ] POST válido → proveedor creado
- [ ] PUT → datos actualizados
- [ ] DELETE → soft delete
