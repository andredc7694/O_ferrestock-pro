import { useState, useEffect, useCallback } from 'react'
import { proveedoresService } from '../services/proveedores.service.js'

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [pagination, setPagination]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const cargar = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const res = await proveedoresService.listar(params)
      setProveedores(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      setError('Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [])

  return { proveedores, pagination, loading, error, recargar: cargar }
}