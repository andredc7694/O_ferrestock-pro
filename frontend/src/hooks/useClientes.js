import { useState, useEffect, useCallback } from 'react'
import { clientesService } from '../services/clientes.service.js'

export const useClientes = () => {
  const [clientes,   setClientes]   = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const cargar = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const res = await clientesService.listar(params)
      setClientes(res.data.data)
      setPagination(res.data.pagination)
    } catch {
      setError('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [])

  return { clientes, pagination, loading, error, recargar: cargar }
}