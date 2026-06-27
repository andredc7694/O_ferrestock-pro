import api from './api.js'

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),

  cambiarPassword: (password_actual, password_nueva, password_confirmacion) =>
    api.put('/auth/cambiar-password', {
      password_actual,
      password_nueva,
      password_confirmacion
    })
}