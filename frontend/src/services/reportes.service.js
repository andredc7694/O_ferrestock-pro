import api from './api.js'

export const reportesService = {
  dashboard:     ()       => api.get('/reportes/dashboard'),
  ventas:        (params) => api.get('/reportes/ventas', { params }),
  topProductos:  (params) => api.get('/reportes/productos-mas-vendidos', { params }),
  stock:         (params) => api.get('/reportes/stock', { params })
}