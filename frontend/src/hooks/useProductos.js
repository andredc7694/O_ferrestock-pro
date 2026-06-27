import { useState, useEffect, useCallback } from 'react'
import { productosService } from '../services/productos.service.js'

export const useProductos = (filtrosIniciales = {}) => {
  const [productos, setProductos] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState(filtrosIniciales)

  const cargar = useCallback(async (params = filtros) => {
    try {
      setLoading(true)
      setError(null)
      const res = await productosService.listar(params)
      setProductos(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar(filtros) }, [filtros])

  const cambiarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros, page: 1 }))
  }

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }))
  }

  return {
    productos, pagination, loading, error,
    filtros, cambiarFiltros, cambiarPagina,
    recargar: cargar
  }
}