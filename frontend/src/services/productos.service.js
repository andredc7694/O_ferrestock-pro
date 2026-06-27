import api from './api.js'

export const productosService = {
  listar: (params) => api.get('/productos', { params }),
  obtener: (id) => api.get(`/productos/${id}`),
  crear: (datos) => api.post('/productos', datos),
  editar: (id, datos) => api.put(`/productos/${id}`, datos),
  desactivar: (id) => api.delete(`/productos/${id}`)
}