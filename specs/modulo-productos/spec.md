# spec.md — Módulo de Productos
# FerreStock Pro — Sprint 1
# Flujo SDD: /speckit.specify

---

## 1. DESCRIPCIÓN DE LA FEATURE

El módulo de productos permite gestionar el catálogo completo de la ferretería.
Incluye la creación, edición, desactivación y búsqueda de productos, así como
la gestión de categorías y unidades de medida que los organizan.

Es el módulo base del sistema: sin productos no puede funcionar el inventario,
las ventas ni los reportes.

---

## 2. HISTORIAS DE USUARIO CUBIERTAS

- HU-006: Gestión de categorías (P2 — Alta)
- HU-007: CRUD de productos (P2 — Alta)
- HU-008: Búsqueda y filtros de productos (P2 — Alta)

---

## 3. ACTORES

- Administrador: acceso completo (crear, editar, desactivar, ver)
- Bodeguero: puede crear y editar productos, NO puede desactivarlos
- Vendedor: solo puede ver y buscar productos (para el POS)

---

## 4. QUÉ DEBE HACER EL SISTEMA

### 4.1 Categorías
- Listar todas las categorías activas
- Crear una categoría nueva (nombre único)
- Editar el nombre y descripción de una categoría
- Desactivar una categoría (soft delete)
- No se puede desactivar una categoría que tiene productos activos

### 4.2 Productos — Listado
- Mostrar todos los productos activos en tabla paginada (10 por página)
- Columnas: código, nombre, categoría, unidad, precio venta, stock actual
- El stock actual viene de la tabla inventario en tiempo real

### 4.3 Productos — Crear
- Campos obligatorios: nombre, categoría, unidad de medida, precio compra,
  precio venta, stock mínimo
- Campos opcionales: código (se autogenera), descripción, proveedor
- El código se autogenera en formato CATEG-XXXX si no se ingresa
  Ejemplo: HERR-0011, PINT-0005, ELCT-0023
- Validación: precio_venta >= precio_compra
- Validación: stock_minimo >= 0
- Al crear el producto, se crea automáticamente su registro en inventario con stock 0
- Se crea un movimiento de tipo ENTRADA con cantidad 0 como registro inicial

### 4.4 Productos — Editar
- Se pueden editar todos los campos EXCEPTO el código
- El código es inmutable una vez creado

### 4.5 Productos — Desactivar
- Soft delete: cambia deleted_at, no elimina el registro
- Un producto desactivado no aparece en el catálogo ni en el POS
- Su historial de ventas y movimientos se conserva

### 4.6 Búsqueda y filtros
- Buscar por nombre o código (case-insensitive)
- Filtrar por categoría
- Debounce de 300ms en el frontend
- Mostrar mensaje amigable si no hay resultados

---

## 5. QUÉ NO HACE ESTE MÓDULO

- No gestiona el stock directamente (eso es el módulo de inventario)
- No incluye carga de imágenes de productos
- No incluye precios diferenciados por cliente

---

## 6. CRITERIOS DE ACEPTACIÓN

- [ ] GET /api/productos lista productos paginados (10/página) solo activos
- [ ] GET /api/productos?search=martillo filtra por nombre o código
- [ ] GET /api/productos?categoria_id=1 filtra por categoría
- [ ] POST /api/productos crea producto con código autogenerado
- [ ] POST /api/productos valida precio_venta >= precio_compra
- [ ] PUT /api/productos/:id edita producto (excepto código)
- [ ] DELETE /api/productos/:id hace soft delete
- [ ] Al crear producto se crea registro en inventario con stock 0
- [ ] GET /api/categorias lista categorías activas
- [ ] CRUD completo de categorías solo para Administrador
- [ ] Frontend: tabla de productos con paginación funcional
- [ ] Frontend: búsqueda con debounce 300ms
- [ ] Frontend: formulario crear/editar con todas las validaciones
- [ ] Frontend: indicador visual de stock bajo en la tabla
- [ ] Probado en Postman: todos los endpoints

---

## 7. REGLAS DE NEGOCIO

- El código de producto es ÚNICO e INMUTABLE
- Formato del código autogenerado: primeras 4 letras de la categoría + guión + número de 4 dígitos
  Ejemplos: HERR-0001, PINT-0001, ELCT-0001, PLOM-0001
- precio_venta debe ser mayor o igual a precio_compra (nunca vender a pérdida)
- stock_minimo debe ser 0 o positivo (nunca negativo)
- Solo el Administrador puede desactivar productos y categorías
- No se puede desactivar una categoría con productos activos asociados
