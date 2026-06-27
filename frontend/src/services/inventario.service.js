import api from './api.js'

export const inventarioService = {
  obtenerStock: () =>
    api.get('/inventario'),

  obtenerAlertas: () =>
    api.get('/inventario/alertas'),

  obtenerMovimientos: (params) =>
    api.get('/inventario/movimientos', { params }),

  registrarMovimiento: (datos) =>
    api.post('/inventario/movimientos', datos)
}