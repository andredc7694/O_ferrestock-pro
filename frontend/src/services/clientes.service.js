import api from './api.js'

export const clientesService = {
  listar:         (params) => api.get('/clientes', { params }),
  obtener:        (id)     => api.get(`/clientes/${id}`),
  obtenerVentas:  (id, params) => api.get(`/clientes/${id}/ventas`, { params }),
  crear:          (datos)  => api.post('/clientes', datos),
  editar:         (id, datos) => api.put(`/clientes/${id}`, datos),
  desactivar:     (id)     => api.delete(`/clientes/${id}`)
}