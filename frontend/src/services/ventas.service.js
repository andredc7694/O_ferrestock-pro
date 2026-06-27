import api from './api.js'

export const ventasService = {
  registrar:  (datos)  => api.post('/ventas', datos),
  listar:     (params) => api.get('/ventas', { params }),
  obtener:    (id)     => api.get(`/ventas/${id}`),
  comprobante:(id)     => api.get(`/ventas/${id}/comprobante`)
}