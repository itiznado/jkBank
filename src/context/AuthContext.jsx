import { createContext, useContext, useEffect, useReducer } from 'react'
import { subscribeToAuthState } from '../services/authService'

const AuthContext = createContext(null)

const initialState = { user: null, loading: true }

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_STATE_CHANGED':
      return { user: action.payload, loading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: firebaseUser })
    })

    return unsubscribe
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider')
  }
  return context
}