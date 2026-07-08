import { useEffect, useState } from 'react'
import { subscribeToMovimientos } from '../services/movimientoService'

export function useMovimientos(uid) {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!uid) {
      setMovimientos([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const unsubscribe = subscribeToMovimientos(uid, {
      onData: (data) => {
        setMovimientos(data)
        setLoading(false)
      },
      onError: () => {
        setError('No se pudo cargar tu historial de movimientos.')
        setLoading(false)
      },
    })

    return unsubscribe
  }, [uid])

  return { movimientos, loading, error }
}