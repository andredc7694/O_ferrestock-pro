# spec.md — Módulo de Proveedores
# FerreStock Pro — Sprint 3
# Flujo SDD: /speckit.specify

---

## 1. DESCRIPCIÓN DE LA FEATURE

El módulo de proveedores permite gestionar el directorio de empresas que
abastecen a la ferretería. Centraliza los datos de contacto de cada proveedor
y permite asociarlos a los productos que suministran.

Es fundamental para las alertas de stock crítico: cuando un producto baja del
mínimo, el sistema muestra automáticamente el proveedor y su teléfono para
facilitar la reposición inmediata.

---

## 2. HISTORIAS DE USUARIO CUBIERTAS

- HU-012: CRUD de proveedores (P2 — Alta)
- HU-013: Asociación de productos a proveedores (P3 — Media)

---

## 3. ACTORES

- Administrador: acceso completo (crear, editar, desactivar, ver detalle)
- Vendedor: SIN acceso a este módulo
- Bodeguero: SIN acceso a este módulo

---

## 4. QUÉ DEBE HACER EL SISTEMA

### 4.1 Listar proveedores
- Tabla paginada con todos los proveedores activos
- Columnas: razón social, RUC, teléfono, email, contacto, estado
- Búsqueda por nombre (razón social) o RUC

### 4.2 Crear proveedor
- Campos obligatorios: razón social, RUC, teléfono
- Campos opcionales: email, dirección, nombre del contacto
- Validación: RUC debe tener exactamente 11 dígitos numéricos
- Validación: RUC único en el sistema

### 4.3 Editar proveedor
- Se pueden editar todos los campos
- El RUC solo puede editarse si no genera duplicado

### 4.4 Desactivar proveedor
- Soft delete: conserva el historial de productos asociados
- Un proveedor desactivado no aparece en el listado principal

### 4.5 Ver detalle del proveedor
- Datos completos del proveedor
- Lista de productos que suministra con su stock actual

### 4.6 Asociar productos al proveedor
- Desde el formulario de producto ya existe campo proveedor_id
- El detalle del proveedor muestra sus productos asociados

---

## 5. QUÉ NO HACE ESTE MÓDULO

- No genera órdenes de compra formales
- No maneja múltiples contactos por proveedor
- No incluye historial de compras al proveedor

---

## 6. CRITERIOS DE ACEPTACIÓN

- [ ] GET /api/proveedores lista paginada con búsqueda por nombre o RUC
- [ ] GET /api/proveedores/:id devuelve proveedor con sus productos y stock
- [ ] POST /api/proveedores crea con validación de RUC (11 dígitos, único)
- [ ] PUT /api/proveedores/:id actualiza datos
- [ ] DELETE /api/proveedores/:id hace soft delete
- [ ] Frontend: tabla de proveedores con búsqueda
- [ ] Frontend: formulario crear/editar con validación de RUC en tiempo real
- [ ] Frontend: vista detalle con lista de productos asociados y stock
- [ ] Probado en Postman: todos los endpoints

---

## 7. REGLAS DE NEGOCIO

- RUC peruano: exactamente 11 dígitos numéricos, único en el sistema
- Razón social y teléfono son obligatorios
- Un proveedor desactivado conserva su relación con productos históricos
- Solo el Administrador tiene acceso a este módulo
