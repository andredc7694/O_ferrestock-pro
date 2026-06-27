# tasks.md — Módulo de Autenticación
# FerreStock Pro — Sprint 0
# Flujo SDD: /speckit.tasks

---

## TAREA 1 — Modelos Sequelize: Rol y Usuario

**Archivo:** `backend/src/models/Rol.js`
**Archivo:** `backend/src/models/Usuario.js`
**Archivo:** `backend/src/models/index.js`

**Criterio de aceptación:**
- [ ] El modelo Rol mapea correctamente la tabla `roles`
- [ ] El modelo Usuario mapea correctamente la tabla `usuarios`
- [ ] La asociación Usuario.belongsTo(Rol) está definida
- [ ] El campo `password` está excluido de las consultas por defecto
- [ ] El soft delete (paranoid: true) funciona con deleted_at

---

## TAREA 2 — Middlewares de autenticación y roles

**Archivo:** `backend/src/middlewares/auth.middleware.js`
**Archivo:** `backend/src/middlewares/rol.middleware.js`

**Criterio de aceptación:**
- [ ] verificarToken extrae el token del header Authorization
- [ ] verificarToken responde 401 si no hay token
- [ ] verificarToken responde 401 si el token es inválido o expiró
- [ ] verificarToken agrega req.usuario con los datos del payload
- [ ] verificarRol(['Administrador']) responde 403 si el rol no coincide
- [ ] verificarRol acepta múltiples roles: verificarRol(['Admin', 'Vendedor'])

---

## TAREA 3 — Servicio de autenticación

**Archivo:** `backend/src/services/auth.service.js`

**Criterio de aceptación:**
- [ ] login(email, password) busca el usuario por email
- [ ] login() responde error si el usuario no existe
- [ ] login() responde error si el usuario está inactivo (activo=0)
- [ ] login() usa bcrypt.compare para verificar la contraseña
- [ ] login() genera JWT con { id, nombre, email, rol } como payload
- [ ] cambiarPassword() verifica la contraseña actual antes de cambiarla
- [ ] cambiarPassword() hashea la nueva contraseña con bcrypt (10 rounds)

---

## TAREA 4 — Controlador de autenticación

**Archivo:** `backend/src/controllers/auth.controller.js`

**Criterio de aceptación:**
- [ ] login: llama a authService.login() y responde con token + datos usuario
- [ ] logout: responde success (el cliente elimina el token)
- [ ] me: devuelve los datos del usuario desde req.usuario (sin password)
- [ ] cambiarPassword: llama a authService.cambiarPassword()
- [ ] Todos los métodos tienen try/catch con manejo de errores

---

## TAREA 5 — Rutas de autenticación

**Archivo:** `backend/src/routes/auth.routes.js`
**Archivo:** `backend/src/routes/index.js`

**Criterio de aceptación:**
- [ ] POST /api/auth/login → público (sin middleware de token)
- [ ] POST /api/auth/logout → protegido con verificarToken
- [ ] GET /api/auth/me → protegido con verificarToken
- [ ] PUT /api/auth/cambiar-password → protegido con verificarToken
- [ ] Las rutas están registradas en app.js bajo el prefijo /api

---

## TAREA 6 — Actualizar app.js con las rutas

**Archivo:** `backend/src/app.js`

**Criterio de aceptación:**
- [ ] Las rutas de /api están importadas y registradas
- [ ] El middleware de errores global está al final
- [ ] CORS está configurado para el FRONTEND_URL del .env

---

## TAREA 7 — Actualizar contraseña del admin en la BD

**Criterio de aceptación:**
- [ ] La contraseña del admin (Admin123!) está hasheada con bcrypt en la BD
- [ ] Se puede hacer login con admin@ferrestock.com / Admin123!
- [ ] Probado en Postman: POST /api/auth/login devuelve token

---

## TAREA 8 — AuthContext en React

**Archivo:** `frontend/src/context/AuthContext.jsx`

**Criterio de aceptación:**
- [ ] AuthContext provee: usuario, token, loading, login(), logout()
- [ ] login() guarda el token en localStorage con clave 'ferrestock_token'
- [ ] logout() elimina el token de localStorage y limpia el estado
- [ ] Al cargar la app, verifica si hay token en localStorage
- [ ] Si hay token válido, restaura la sesión automáticamente

---

## TAREA 9 — Rutas protegidas en React

**Archivo:** `frontend/src/routes/PrivateRoute.jsx`
**Archivo:** `frontend/src/routes/RoleRoute.jsx`

**Criterio de aceptación:**
- [ ] PrivateRoute redirige a /login si no hay usuario en AuthContext
- [ ] PrivateRoute muestra Spinner mientras carga (estado loading)
- [ ] RoleRoute redirige a /acceso-denegado si el rol no coincide
- [ ] RoleRoute acepta prop `roles` como array: roles={['Administrador']}

---

## TAREA 10 — Servicio de auth en frontend

**Archivo:** `frontend/src/services/auth.service.js`

**Criterio de aceptación:**
- [ ] login(email, password) hace POST /api/auth/login
- [ ] logout() hace POST /api/auth/logout
- [ ] me() hace GET /api/auth/me
- [ ] cambiarPassword() hace PUT /api/auth/cambiar-password
- [ ] Todos usan la instancia de Axios configurada en api.js

---

## TAREA 11 — Página de Login

**Archivo:** `frontend/src/pages/auth/LoginPage.jsx`

**Criterio de aceptación:**
- [ ] Formulario con campos: email y password
- [ ] Validación: email requerido con formato válido
- [ ] Validación: password requerido, mínimo 6 caracteres
- [ ] Botón deshabilitado mientras carga (estado loading)
- [ ] Muestra mensaje de error si las credenciales son incorrectas
- [ ] Al hacer login exitoso, redirige al /dashboard
- [ ] Diseño responsive con Tailwind CSS

---

## TAREA 12 — Actualizar App.jsx con el Router

**Archivo:** `frontend/src/App.jsx`

**Criterio de aceptación:**
- [ ] AuthContext envuelve toda la aplicación
- [ ] Ruta /login → LoginPage (pública)
- [ ] Ruta /dashboard → DashboardPage (protegida con PrivateRoute)
- [ ] Ruta raíz / redirige a /dashboard si hay sesión, sino a /login
- [ ] Ruta no encontrada muestra página 404 simple

---

## TAREA 13 — Pruebas en Postman

**Criterio de aceptación:**
- [ ] POST /api/auth/login con credenciales correctas → 200 + token
- [ ] POST /api/auth/login con password incorrecta → 400 + error
- [ ] POST /api/auth/login con email inexistente → 400 + error
- [ ] GET /api/auth/me con token válido → 200 + datos usuario
- [ ] GET /api/auth/me sin token → 401
- [ ] GET /api/auth/me con token expirado → 401
- [ ] POST /api/auth/logout con token → 200
