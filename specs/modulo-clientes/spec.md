# spec.md — Módulo de Clientes
# FerreStock Pro — Sprint 5
# Flujo SDD: /speckit.specify

---

## 1. DESCRIPCIÓN DE LA FEATURE

El módulo de clientes permite registrar y gestionar los clientes de la
ferretería. Centraliza sus datos de contacto y mantiene un historial completo
de sus compras con el total acumulado.

También permite asociar un cliente a una venta desde el POS, lo que mejora
el seguimiento comercial y facilita atención personalizada.

---

## 2. HISTORIAS DE USUARIO CUBIERTAS

- HU-017: CRUD de clientes (P2 — Alta)
- HU-018: Historial de compras del cliente (P3 — Media)

---

## 3. ACTORES

- Administrador: acceso completo (crear, editar, desactivar, ver historial)
- Vendedor: puede crear, editar y ver clientes y su historial
- Bodeguero: SIN acceso a este módulo

---

## 4. QUÉ DEBE HACER EL SISTEMA

### 4.1 Listar clientes
- Tabla paginada con todos los clientes activos
- Búsqueda por nombre, DNI o teléfono

### 4.2 Crear cliente
- Campos obligatorios: nombre completo, tipo de documento, número de documento
- Campos opcionales: apellidos, teléfono, email, dirección
- Validación: DNI = 8 dígitos numéricos
- Validación: RUC = 11 dígitos numéricos
- El número de documento es único en el sistema

### 4.3 Editar cliente
- Se pueden editar todos los campos
- El número de documento solo puede cambiar si no genera duplicado

### 4.4 Desactivar cliente
- Soft delete: conserva el historial de compras
- Solo el Administrador puede desactivar

### 4.5 Ver historial de compras
- Lista de todas las ventas del cliente con paginación
- Muestra: número de venta, fecha, total, método de pago
- Muestra el total acumulado de todas sus compras

### 4.6 Buscar cliente desde el POS
- Campo de búsqueda rápida en el POS por DNI o nombre
- Resultado muestra nombre y documento del cliente
- Al seleccionar se asocia a la venta actual

---

## 5. QUÉ NO HACE ESTE MÓDULO

- No maneja créditos (HU-019, P4 — fuera del alcance MVP)
- No incluye foto o avatar del cliente
- No maneja múltiples direcciones por cliente

---

## 6. CRITERIOS DE ACEPTACIÓN

- [ ] GET /api/clientes lista paginada con búsqueda
- [ ] GET /api/clientes/:id devuelve cliente con total acumulado
- [ ] GET /api/clientes/:id/ventas historial de compras paginado
- [ ] POST /api/clientes crea con validación DNI/RUC
- [ ] PUT /api/clientes/:id actualiza datos
- [ ] DELETE /api/clientes/:id soft delete (solo Admin)
- [ ] Frontend: tabla de clientes con búsqueda
- [ ] Frontend: formulario crear/editar con validación DNI/RUC
- [ ] Frontend: detalle del cliente con historial de compras
- [ ] Frontend: búsqueda de cliente integrada en el POS
- [ ] Probado en Postman: todos los endpoints

---

## 7. REGLAS DE NEGOCIO

- DNI: exactamente 8 dígitos numéricos
- RUC: exactamente 11 dígitos numéricos
- El número de documento es ÚNICO en el sistema
- El nombre completo es obligatorio
- Solo Admin puede desactivar clientes
- Admin y Vendedor pueden crear y editar