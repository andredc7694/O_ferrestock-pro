import { useState, useEffect, useCallback } from 'react'
import { inventarioService } from '../services/inventario.service.js'

export const useInventario = () => {
  const [stock, setStock] = useState([])
  const [alertas, setAlertas] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingMovimientos, setLoadingMovimientos] = useState(true)
  const [errorMovimientos, setErrorMovimientos] = useState(null)

  const cargarStock = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [resStock, resAlertas] = await Promise.all([
        inventarioService.obtenerStock(),
        inventarioService.obtenerAlertas()
      ])
      setStock(resStock.data.data)
      setAlertas(resAlertas.data.data)
    } catch (err) {
      setError('Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }, [])

  const cargarMovimientos = useCallback(async (params = {}) => {
    try {
      setLoadingMovimientos(true)
      setErrorMovimientos(null)
      const res = await inventarioService.obtenerMovimientos(params)
      setMovimientos(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      setErrorMovimientos('Error al cargar el historial de movimientos')
    } finally {
      setLoadingMovimientos(false)
    }
  }, [])

  useEffect(() => {
    cargarStock()
    cargarMovimientos()
  }, [])

  return {
    stock, alertas, movimientos, pagination,
    loading, error,
    loadingMovimientos, errorMovimientos,
    recargar: cargarStock,
    recargarMovimientos: cargarMovimientos
  }
}