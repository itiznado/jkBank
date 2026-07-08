import { useState } from 'react'
import {
  getAuthErrorMessage,
  loginUser,
  registerUser,
} from '../services/authService'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthForm() {
  const [mode, setMode] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegisterMode = mode === 'register'

  function handleNombreChange(event) {
    setNombre(event.target.value)
    setError('')
  }

  function handleEmailChange(event) {
    setEmail(event.target.value)
    setError('')
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value)
    setError('')
  }

  function handleModeToggle() {
    setMode(isRegisterMode ? 'login' : 'register')
    setError('')
  }

  function validateForm() {
    const trimmedEmail = email.trim()
    const trimmedNombre = nombre.trim()

    if (isRegisterMode && !trimmedNombre) {
      return 'Ingresa tu nombre.'
    }

    if (!trimmedEmail) {
      return 'Ingresa tu correo.'
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return 'El correo no tiene un formato válido.'
    }

    if (!password) {
      return 'Ingresa tu contraseña.'
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const trimmedEmail = email.trim()

      if (isRegisterMode) {
        await registerUser({
          nombre: nombre.trim(),
          email: trimmedEmail,
          password,
        })
      } else {
        await loginUser({ email: trimmedEmail, password })
      }
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError.code))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <header className="auth__header">
        <h1>jkBank</h1>
        <p>Tu banca digital</p>
      </header>

      <form className="auth__form" onSubmit={handleSubmit}>
        <h2>{isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}</h2>

        {isRegisterMode && (
          <label className="auth__field">
            Nombre
            <input
              type="text"
              name="nombre"
              value={nombre}
              onChange={handleNombreChange}
              autoComplete="name"
              disabled={isSubmitting}
            />
          </label>
        )}

        <label className="auth__field">
          Correo
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            autoComplete="email"
            disabled={isSubmitting}
          />
        </label>

        <label className="auth__field">
          Contraseña
          <input
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
            disabled={isSubmitting}
          />
        </label>

        {error && <p className="auth__error">{error}</p>}

        <button type="submit" className="auth__submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Procesando...'
            : isRegisterMode
              ? 'Registrarse'
              : 'Entrar'}
        </button>
      </form>

      <button
        type="button"
        className="auth__toggle"
        onClick={handleModeToggle}
        disabled={isSubmitting}
      >
        {isRegisterMode
          ? '¿Ya tienes cuenta? Inicia sesión'
          : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  )
}

export default AuthForm
