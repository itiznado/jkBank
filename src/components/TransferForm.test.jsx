import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransferForm from './TransferForm'
import { transferMoney } from '../services/transferService'

vi.mock('../services/transferService', () => ({
  transferMoney: vi.fn(),
  getTransferErrorMessage: (errorCode) => {
    const messages = {
      'transfer/recipient-not-found': 'No encontramos un usuario con ese correo.',
      'transfer/self-transfer': 'No puedes transferirte dinero a ti mismo.',
      'transfer/insufficient-funds': 'No tienes saldo suficiente para esta transferencia.',
    }
    return messages[errorCode] ?? 'No se pudo completar la transferencia. Intenta de nuevo.'
  },
}))

const usuarioLogueado = { uid: 'uid-emisor', email: 'yo@correo.cl' }

describe('TransferForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza todos los campos del formulario y el botón de envío', () => {
    // Arrange / Act
    render(<TransferForm user={usuarioLogueado} saldoDisponible={10000} />)

    // Assert
    expect(screen.getByLabelText(/correo del destinatario/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Monto')).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /transferir/i })).toBeInTheDocument()
  })

  it('muestra el error de validación y no llama al servicio cuando el monto es inválido', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<TransferForm user={usuarioLogueado} saldoDisponible={10000} />)

    // Act
    await user.type(screen.getByLabelText(/correo del destinatario/i), 'destinatario@correo.cl')
    await user.type(screen.getByLabelText('Monto'), '-500')
    await user.click(screen.getByRole('button', { name: /transferir/i }))

    // Assert
    expect(await screen.findByText('El monto debe ser mayor a 0.')).toBeInTheDocument()
    expect(transferMoney).not.toHaveBeenCalled()
  })

  it('llama al servicio exactamente una vez con los argumentos correctos cuando los datos son válidos', async () => {
    // Arrange
    transferMoney.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<TransferForm user={usuarioLogueado} saldoDisponible={10000} />)

    // Act
    await user.type(screen.getByLabelText(/correo del destinatario/i), 'destinatario@correo.cl')
    await user.type(screen.getByLabelText('Monto'), '5000')
    await user.type(screen.getByLabelText(/descripción/i), 'Pago arriendo')
    await user.click(screen.getByRole('button', { name: /transferir/i }))

    // Assert
    await waitFor(() => {
      expect(transferMoney).toHaveBeenCalledTimes(1)
    })
    expect(transferMoney).toHaveBeenCalledWith({
      emisorUid: 'uid-emisor',
      receptorEmail: 'destinatario@correo.cl',
      monto: 5000,
      descripcion: 'Pago arriendo',
    })
  })

  it('debe deshabilitar el botón de envío mientras la transferencia se está procesando', async () => {
    // Arrange: la promesa queda pendiente hasta que la resolvemos manualmente
    let resolveTransfer
    transferMoney.mockImplementation(
      () => new Promise((resolve) => { resolveTransfer = resolve }),
    )
    const user = userEvent.setup()
    render(<TransferForm user={usuarioLogueado} saldoDisponible={10000} />)

    await user.type(screen.getByLabelText(/correo del destinatario/i), 'destinatario@correo.cl')
    await user.type(screen.getByLabelText('Monto'), '5000')

    // Act
    await user.click(screen.getByRole('button', { name: /transferir/i }))

    // Assert: mientras la promesa no resuelve, el botón está deshabilitado
    expect(screen.getByRole('button', { name: /transfiriendo/i })).toBeDisabled()

    resolveTransfer()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /transferir/i })).not.toBeDisabled()
    })
  })

  it('muestra el mensaje de error mapeado cuando el servicio rechaza la transferencia', async () => {
    // Arrange
    transferMoney.mockRejectedValue({ code: 'transfer/insufficient-funds' })
    const user = userEvent.setup()
    render(<TransferForm user={usuarioLogueado} saldoDisponible={10000} />)

    // Act
    await user.type(screen.getByLabelText(/correo del destinatario/i), 'destinatario@correo.cl')
    await user.type(screen.getByLabelText('Monto'), '5000')
    await user.click(screen.getByRole('button', { name: /transferir/i }))

    // Assert
    expect(
      await screen.findByText('No tienes saldo suficiente para esta transferencia.'),
    ).toBeInTheDocument()
  })
})