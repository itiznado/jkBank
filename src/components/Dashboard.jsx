import { useState } from 'react'
import { logoutUser, getAuthErrorMessage } from '../services/authService'
import { useUserProfile } from '../hooks/useUserProfile'
import { formatSaldo } from '../utils/formatSaldo'
import TransferForm from './TransferForm'

function Dashboard({ user }) {
  const { profile, loading, error: profileError } = useUserProfile(user.uid)
  const [logoutError, setLogoutError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogoutClick() {
    setIsLoggingOut(true)
    setLogoutError('')

    try {
      await logoutUser()
    } catch (logoutErr) {
      setLogoutError(getAuthErrorMessage(logoutErr.code))
      setIsLoggingOut(false)
    }
  }

  function renderBalance() {
    if (loading) {
      return <p className="dashboard__status">Cargando saldo...</p>
    }

    if (profileError) {
      return <p className="dashboard__error">{profileError}</p>
    }

    if (!profile) {
      return (
        <p className="dashboard__status">
          No encontramos tu perfil bancario. Contacta soporte.
        </p>
      )
    }

    return (
      <>
        <p className="dashboard__greeting">Hola, {profile.nombre}</p>
        <p className="dashboard__label">Saldo disponible</p>
        <p className="dashboard__balance">{formatSaldo(profile.saldo)}</p>
      </>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>jkBank</h1>
        <button
          type="button"
          className="dashboard__logout"
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}
        </button>
      </header>

      <section className="dashboard__welcome">
        <h2>Tu cuenta</h2>
        <p className="dashboard__email">{user.email}</p>
        {renderBalance()}
      </section>

      {profile && (
        <TransferForm user={user} saldoDisponible={profile.saldo} />
      )}

      {logoutError && <p className="dashboard__error">{logoutError}</p>}
    </div>
  )
}

export default Dashboard
