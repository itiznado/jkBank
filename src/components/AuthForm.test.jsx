import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from './AuthForm'
import { loginUser } from '../services/authService'

vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getAuthErrorMessage: (errorCode) => {
    const messages = {
      'auth/email-already-in-use': 'Ese correo ya está registrado.',
      'auth/invalid-email': 'El correo no es válido.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/user-not-found': 'Correo o contraseña incorrectos.',
      'auth/wrong-password': 'Correo o contraseña incorrectos.',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
    }
    return messages[errorCode] ?? 'Ocurrió un error. Intenta de nuevo.'
  },
}))

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no llama al servicio de autenticación al enviar el formulario con campos vacíos', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<AuthForm />)

    // Act
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    // Assert
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('renderiza un mensaje de error legible cuando el servicio rechaza las credenciales', async () => {
    // Arrange
    loginUser.mockRejectedValue({ code: 'auth/invalid-credential' })
    const user = userEvent.setup()
    render(<AuthForm />)

    // Act
    await user.type(screen.getByLabelText(/correo/i), 'usuario@correo.cl')
    await user.type(screen.getByLabelText(/contraseña/i), 'clave123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    // Assert
    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
  })
})