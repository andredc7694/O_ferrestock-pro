# tasks.md — Módulo de Productos
# FerreStock Pro — Sprint 1
# Flujo SDD: /speckit.tasks

---

## TAREA 1 — Modelos Sequelize: Categoria, UnidadMedida, Proveedor, Producto, Inventario

**Criterios de aceptación:**
- [ ] Categoria.js mapea tabla categorias con soft delete
- [ ] UnidadMedida.js mapea tabla unidades_medida sin soft delete
- [ ] Proveedor.js mapea tabla proveedores con soft delete
- [ ] Producto.js mapea tabla productos con todas las FK y soft delete
- [ ] Inventario.js mapea tabla inventario sin soft delete (1:1 con producto)
- [ ] Todas las asociaciones definidas en models/index.js
- [ ] Los modelos se importan correctamente desde index.js

---

## TAREA 2 — Servicio y Controlador de Categorías

**Criterios de aceptación:**
- [ ] listar(): devuelve todas las categorías activas
- [ ] crear(datos): valida nombre único, crea categoría
- [ ] editar(id, datos): actualiza nombre y descripción
- [ ] desactivar(id): verifica que no tenga productos activos antes de soft delete
- [ ] Controlador maneja errores con try/catch en todos los métodos

---

## TAREA 3 — Rutas de Categorías

**Criterios de aceptación:**
- [ ] GET /api/categorias → verificarToken (todos los roles)
- [ ] POST /api/categorias → verificarToken + verificarRol('Administrador')
- [ ] PUT /api/categorias/:id → verificarToken + verificarRol('Administrador')
- [ ] DELETE /api/categorias/:id → verificarToken + verificarRol('Administrador')
- [ ] Rutas registradas en routes/index.js

---

## TAREA 4 — Utilidad: generador de código de producto

**Archivo:** backend/src/utils/generadores.js

**Criterios de aceptación:**
- [ ] generarCodigoProducto(categoriaId) busca la categoría en BD
- [ ] Toma las primeras 4 letras del nombre en mayúsculas
- [ ] Busca el último código de ese prefijo en la tabla productos
- [ ] Retorna el siguiente código en formato XXXX-NNNN
- [ ] Si no existe ningún código con ese prefijo, retorna XXXX-0001

---

## TAREA 5 — Servicio de Productos

**Criterios de aceptación:**
- [ ] listar(filtros, paginacion): busca con JOIN a categoria, unidad, inventario y proveedor
- [ ] listar(): aplica filtro search (nombre O código, case-insensitive)
- [ ] listar(): aplica filtro categoria_id
- [ ] listar(): calcula estado_stock (NORMAL/CRITICO/SIN_STOCK) por cada producto
- [ ] obtenerPorId(id): devuelve producto con todos sus datos
- [ ] crear(datos): valida precio_venta >= precio_compra
- [ ] crear(datos): autogenera código si no se proporciona
- [ ] crear(datos): crea producto E inventario en una transacción
- [ ] editar(id, datos): actualiza producto, no permite cambiar código
- [ ] desactivar(id): soft delete del producto

---

## TAREA 6 — Controlador de Productos

**Criterios de aceptación:**
- [ ] listar: extrae query params (search, categoria_id, page, limit)
- [ ] obtener: devuelve 404 si no existe
- [ ] crear: valida campos obligatorios antes de llamar al servicio
- [ ] editar: devuelve 404 si no existe el producto
- [ ] desactivar: devuelve 404 si no existe, solo Admin puede ejecutarlo
- [ ] Todos los métodos tienen try/catch

---

## TAREA 7 — Rutas de Productos

**Criterios de aceptación:**
- [ ] GET /api/productos → verificarToken (todos)
- [ ] GET /api/productos/:id → verificarToken (todos)
- [ ] POST /api/productos → verificarToken + verificarRol('Administrador','Bodeguero')
- [ ] PUT /api/productos/:id → verificarToken + verificarRol('Administrador','Bodeguero')
- [ ] DELETE /api/productos/:id → verificarToken + verificarRol('Administrador')
- [ ] Rutas registradas en routes/index.js

---

## TAREA 8 — Servicios frontend: categorias y productos

**Criterios de aceptación:**
- [ ] categorias.service.js: listar(), crear(), editar(), desactivar()
- [ ] productos.service.js: listar(params), obtener(id), crear(), editar(), desactivar()
- [ ] Todos usan la instancia api.js de Axios

---

## TAREA 9 — Custom Hooks

**Criterios de aceptación:**
- [ ] useCategorias.js: devuelve { categorias, loading, error, recargar }
- [ ] useProductos.js: devuelve { productos, pagination, loading, error, recargar }
- [ ] useProductos acepta filtros como parámetro: useProductos({ search, categoria_id })
- [ ] Ambos hooks manejan los 3 estados: loading, error, data
- [ ] useProductos implementa debounce de 300ms para el search

---

## TAREA 10 — Página ProductosPage (tabla principal)

**Criterios de aceptación:**
- [ ] Muestra tabla con columnas: Código, Nombre, Categoría, Unidad, Precio Venta, Stock, Estado, Acciones
- [ ] Buscador por nombre/código con debounce 300ms
- [ ] Dropdown para filtrar por categoría
- [ ] Paginación funcional (botones anterior/siguiente + número de página)
- [ ] Badge de estado de stock: verde (NORMAL), amarillo (CRITICO), rojo (SIN_STOCK)
- [ ] Botones de Editar y Desactivar por fila (según rol)
- [ ] Botón "Nuevo Producto" que navega al formulario
- [ ] Muestra Spinner mientras carga
- [ ] Muestra mensaje si no hay productos

---

## TAREA 11 — Página ProductoFormPage (formulario)

**Criterios de aceptación:**
- [ ] Funciona para CREAR (ruta: /productos/nuevo) y EDITAR (ruta: /productos/:id/editar)
- [ ] Campos: código (deshabilitado en edición), nombre, descripción, categoría (select),
      unidad de medida (select), precio compra, precio venta, stock mínimo, proveedor (select)
- [ ] Validación en tiempo real: precio_venta >= precio_compra
- [ ] Validación: stock_minimo >= 0
- [ ] Todos los campos obligatorios validados antes de enviar
- [ ] Muestra mensaje de éxito y redirige a la lista al guardar
- [ ] Muestra mensaje de error si falla el backend
- [ ] Botón cancelar regresa a la lista

---

## TAREA 12 — Actualizar rutas en App.jsx y Sidebar

**Criterios de aceptación:**
- [ ] Ruta /productos → ProductosPage (protegida, todos los roles)
- [ ] Ruta /productos/nuevo → ProductoFormPage (Admin y Bodeguero)
- [ ] Ruta /productos/:id/editar → ProductoFormPage (Admin y Bodeguero)
- [ ] Link a Productos visible en el Sidebar para todos los roles

---

## TAREA 13 — Pruebas en Postman

**Criterios de aceptación:**
- [ ] GET /api/productos → lista paginada con stock incluido
- [ ] GET /api/productos?search=martillo → filtra correctamente
- [ ] GET /api/productos?categoria_id=1 → filtra por categoría
- [ ] POST /api/productos → crea producto y su inventario
- [ ] POST /api/productos con precio_venta < precio_compra → error 400
- [ ] PUT /api/productos/:id → actualiza datos
- [ ] DELETE /api/productos/:id → soft delete
- [ ] GET /api/categorias → lista categorías
- [ ] POST /api/categorias → crea categoría (con token Admin)
