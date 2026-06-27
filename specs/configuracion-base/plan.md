# plan.md — Módulo de Autenticación
# FerreStock Pro — Sprint 0
# Flujo SDD: /speckit.plan

---

## 1. ARQUITECTURA TÉCNICA

### Backend
```
POST   /api/auth/login            → auth.controller → auth.service
POST   /api/auth/logout           → auth.controller (elimina token cliente)
GET    /api/auth/me               → auth.controller → lee JWT
PUT    /api/auth/cambiar-password → auth.controller → auth.service
```

### Middlewares
```
auth.middleware.js  → verificarToken(req, res, next)
rol.middleware.js   → verificarRol(...roles)(req, res, next)
```

### Frontend
```
AuthContext.jsx     → estado global de sesión
PrivateRoute.jsx    → protege rutas que requieren login
RoleRoute.jsx       → protege rutas que requieren rol específico
LoginPage.jsx       → formulario de ingreso
auth.service.js     → llamadas a la API de autenticación
```

---

## 2. MODELOS INVOLUCRADOS

### Modelo: Usuario (ya existe en la BD)
```
id, rol_id, nombre, apellidos, email, password (bcrypt),
telefono, activo, created_at, updated_at, deleted_at
```

### Modelo: Rol (ya existe en la BD)
```
id, nombre, descripcion, created_at, updated_at
```

---

## 3. ESTRUCTURA DE ARCHIVOS A CREAR

### Backend
```
backend/src/
├── models/
│   ├── index.js           ← Carga todos los modelos y asociaciones
│   ├── Rol.js             ← Modelo Sequelize para tabla roles
│   └── Usuario.js         ← Modelo Sequelize para tabla usuarios
├── middlewares/
│   ├── auth.middleware.js ← verificarToken
│   └── rol.middleware.js  ← verificarRol
├── controllers/
│   └── auth.controller.js ← login, logout, me, cambiarPassword
├── services/
│   └── auth.service.js    ← lógica de negocio de autenticación
└── routes/
    ├── index.js           ← Agrupa todas las rutas bajo /api
    └── auth.routes.js     ← Rutas de autenticación
```

### Frontend
```
frontend/src/
├── context/
│   └── AuthContext.jsx    ← Estado global de sesión
├── routes/
│   ├── PrivateRoute.jsx   ← Redirige si no hay sesión
│   └── RoleRoute.jsx      ← Redirige si el rol no tiene permiso
├── pages/auth/
│   └── LoginPage.jsx      ← Formulario de login
├── services/
│   └── auth.service.js    ← login(), logout(), me()
└── App.jsx                ← Router principal con rutas protegidas
```

---

## 4. FLUJO TÉCNICO DETALLADO

### Login exitoso:
```
1. Usuario llena formulario (email + password)
2. LoginPage llama a authService.login(email, password)
3. authService hace POST /api/auth/login con Axios
4. Backend: auth.middleware NO aplica (ruta pública)
5. Backend: auth.controller recibe email y password
6. Backend: auth.service busca usuario por email en BD
7. Backend: bcrypt.compare(password, usuario.password)
8. Backend: si coincide → jwt.sign({ id, nombre, email, rol })
9. Backend: responde { success: true, data: { token, usuario } }
10. Frontend: AuthContext guarda token en localStorage
11. Frontend: AuthContext guarda datos del usuario en estado
12. Frontend: redirige a /dashboard según el rol
```

### Request a ruta protegida:
```
1. api.js agrega header: Authorization: Bearer <token>
2. auth.middleware.js extrae el token del header
3. jwt.verify(token, JWT_SECRET) → decodifica payload
4. Agrega req.usuario = { id, nombre, email, rol }
5. next() → pasa al siguiente middleware o controller
```

---

## 5. FORMATO DE RESPUESTAS

### Login exitoso:
```json
{
  "success": true,
  "message": "Sesión iniciada correctamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "id": 1,
      "nombre": "Admin",
      "apellidos": "Sistema",
      "email": "admin@ferrestock.com",
      "rol": "Administrador"
    }
  }
}
```

### Login fallido:
```json
{
  "success": false,
  "message": "Credenciales incorrectas",
  "error": "CREDENCIALES_INVALIDAS"
}
```

### Sin token (401):
```json
{
  "success": false,
  "message": "Acceso no autorizado. Inicia sesión primero",
  "error": "TOKEN_REQUERIDO"
}
```

### Rol incorrecto (403):
```json
{
  "success": false,
  "message": "No tienes permiso para acceder a este recurso",
  "error": "ACCESO_DENEGADO"
}
```
