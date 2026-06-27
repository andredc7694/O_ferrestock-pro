import api from './api.js'

export const proveedoresService = {
  listar:     (params) => api.get('/proveedores', { params }),
  obtener:    (id)     => api.get(`/proveedores/${id}`),
  crear:      (datos)  => api.post('/proveedores', datos),
  editar:     (id, datos) => api.put(`/proveedores/${id}`, datos),
  desactivar: (id)     => api.delete(`/proveedores/${id}`)
}