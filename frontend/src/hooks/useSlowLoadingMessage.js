import { useState, useEffect } from 'react'

const MENSAJE_SERVIDOR_INICIANDO =
  'El servidor está iniciando, esto puede tardar hasta un minuto...'

export const useSlowLoadingMessage = (loading, umbralMs = 8000) => {
  const [esLento, setEsLento] = useState(false)

  useEffect(() => {
    if (!loading) {
      setEsLento(false)
      return
    }
    const timer = setTimeout(() => setEsLento(true), umbralMs)
    return () => clearTimeout(timer)
  }, [loading, umbralMs])

  return esLento ? MENSAJE_SERVIDOR_INICIANDO : null
}
