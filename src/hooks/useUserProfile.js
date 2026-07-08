import { useEffect, useState } from 'react'
import { subscribeToUserProfile } from '../services/userService'

export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!uid) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const unsubscribe = subscribeToUserProfile(uid, {
      onData: (userProfile) => {
        setProfile(userProfile)
        setLoading(false)
      },
      onError: () => {
        setError('No se pudo cargar tu perfil.')
        setLoading(false)
      },
    })

    return unsubscribe
  }, [uid])

  return { profile, loading, error }
}
