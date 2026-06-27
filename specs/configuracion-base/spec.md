# spec.md — Módulo de Autenticación
# FerreStock Pro — Sprint 0
# Flujo SDD: /speckit.specify

---

## 1. DESCRIPCIÓN DE LA FEATURE

El módulo de autenticación es la puerta de entrada al sistema FerreStock Pro.
Permite que el personal de la ferretería (Administrador, Vendedor, Bodeguero)
inicie sesión con su correo y contraseña, obtenga un token JWT válido por 8 horas,
y sea redirigido al dashboard según su rol.

Sin autenticación, ningún otro módulo del sistema puede funcionar de forma segura.

---

## 2. HISTORIAS DE USUARIO CUBIERTAS

- HU-005: Módulo de autenticación con JWT (P1 — Crítica)

---

## 3. ACTORES

- Administrador
- Vendedor
- Bodeguero

---

## 4. QUÉ DEBE HACER EL SISTEMA

### 4.1 Login
- El usuario ingresa su correo electrónico y contraseña
- El sistema verifica que el correo existe en la base de datos
- El sistema compara la contraseña con el hash bcrypt almacenado
- Si es correcto: genera un JWT con id, nombre, email y rol del usuario
- El JWT tiene una duración de 8 horas
- El sistema redirige al dashboard según el rol del usuario
- Si es incorrecto: muestra mensaje de error claro en español

### 4.2 Logout
- El sistema elimina el token del cliente (localStorage)
- Redirige al login

### 4.3 Obtener usuario actual
- El sistema devuelve los datos del usuario autenticado leyendo el JWT

### 4.4 Cambio de contraseña
- El usuario ingresa su contraseña actual y la nueva dos veces
- El sistema verifica que la contraseña actual sea correcta
- Actualiza el hash en la base de datos

### 4.5 Protección de rutas (Middlewares)
- verificarToken: valida el JWT en cada ruta privada
- verificarRol: verifica que el rol del usuario tenga permiso para esa ruta
- Si el token es inválido o expiró: responde 401
- Si el rol no tiene permiso: responde 403

### 4.6 Frontend — AuthContext
- Almacena el token JWT en localStorage
- Almacena los datos del usuario en memoria (estado React)
- Provee funciones login() y logout() a toda la app
- Verifica si hay sesión activa al cargar la aplicación

### 4.7 Frontend — Rutas protegidas
- PrivateRoute: redirige al login si no hay sesión activa
- RoleRoute: redirige si el rol no tiene permiso para esa página

---

## 5. QUÉ NO DEBE HACER (FUERA DE ALCANCE)

- No incluye recuperación de contraseña por email
- No incluye autenticación con Google u otras redes sociales
- No incluye autenticación de dos factores (2FA)
- No incluye registro público de usuarios (solo el Admin crea usuarios)

---

## 6. CRITERIOS DE ACEPTACIÓN

- [ ] Login con credenciales correctas devuelve token JWT y redirige al dashboard
- [ ] Login con credenciales incorrectas muestra mensaje de error en español
- [ ] El token JWT contiene: id, nombre, email, rol
- [ ] El token expira en exactamente 8 horas
- [ ] Las contraseñas se almacenan con bcrypt (mínimo 10 rounds), nunca en texto plano
- [ ] Un usuario inactivo (activo=0) no puede iniciar sesión
- [ ] Rutas privadas sin token responden HTTP 401
- [ ] Rutas con rol incorrecto responden HTTP 403
- [ ] El logout elimina el token y redirige al login
- [ ] El AuthContext persiste la sesión al recargar la página
- [ ] Probado en Postman: login exitoso, login fallido, acceso con token, sin token

---

## 7. REGLAS DE NEGOCIO

- Solo el Administrador puede crear nuevos usuarios (esto se implementa en HU-003)
- El correo electrónico es único en el sistema
- Un usuario desactivado (activo=0) no puede autenticarse aunque tenga credenciales válidas
- La contraseña NUNCA se devuelve en ninguna respuesta de la API
