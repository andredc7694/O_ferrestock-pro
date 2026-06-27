import api from './api.js'

export const categoriasService = {
  listar: () => api.get('/categorias'),
  crear: (datos) => api.post('/categorias', datos),
  editar: (id, datos) => api.put(`/categorias/${id}`, datos),
  desactivar: (id) => api.delete(`/categorias/${id}`)
}