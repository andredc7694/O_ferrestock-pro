import { useState, useEffect } from 'react'
import { categoriasService } from '../services/categorias.service.js'

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await categoriasService.listar()
      setCategorias(res.data.data)
    } catch (err) {
      setError('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return { categorias, loading, error, recargar: cargar }
}