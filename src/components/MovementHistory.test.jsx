import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MovementHistory from './MovementHistory'
import { useMovimientos } from '../hooks/useMovimientos'

vi.mock('../hooks/useMovimientos', () => ({
  useMovimientos: vi.fn(),
}))

function crearMovimiento(overrides = {}) {
  return {
    id: 'mov-1',
    categoria: 'transferencia',
    tipo: 'envio',
    monto: 1000,
    receptorNombre: 'Destinatario Genérico',
    receptorEmail: 'destinatario@correo.cl',
    emisorNombre: 'Emisor Genérico',
    emisorEmail: 'emisor@correo.cl',
    descripcion: '',
    fecha: { toDate: () => new Date('2026-01-01T10:00:00') },
    ...overrides,
  }
}

describe('MovementHistory', () => {
  it('renderiza los movimientos en el orden recibido (del más reciente al más antiguo)', () => {
    // Arrange: el orden ya viene resuelto por la capa de datos (mergeAndSort);
    // este test verifica que el componente no reordena lo que recibe.
    const movimientos = [
      crearMovimiento({ id: 'mov-reciente', receptorNombre: 'Movimiento Reciente' }),
      crearMovimiento({ id: 'mov-antiguo', receptorNombre: 'Movimiento Antiguo' }),
    ]
    useMovimientos.mockReturnValue({ movimientos, loading: false, error: '' })

    // Act
    render(<MovementHistory uid="uid-1" />)

    // Assert
    const nombres = screen
      .getAllByText(/Movimiento (Reciente|Antiguo)/)
      .map((el) => el.textContent)
    expect(nombres).toEqual(['Movimiento Reciente', 'Movimiento Antiguo'])
  })

  it('distingue visualmente los envíos (egresos) de las recepciones (ingresos)', () => {
    // Arrange
    const movimientos = [
      crearMovimiento({
        id: 'mov-envio',
        tipo: 'envio',
        monto: 5000,
        receptorNombre: 'Destinatario Envío',
      }),
      crearMovimiento({
        id: 'mov-recepcion',
        tipo: 'recepcion',
        monto: 3000,
        emisorNombre: 'Emisor Recepción',
      }),
    ]
    useMovimientos.mockReturnValue({ movimientos, loading: false, error: '' })

    // Act
    render(<MovementHistory uid="uid-1" />)

    // Assert
    const montoEnvio = screen.getByText('-$5.000')
    const montoRecepcion = screen.getByText('+$3.000')

    expect(montoEnvio).toHaveClass('history__monto--envio')
    expect(montoRecepcion).toHaveClass('history__monto--recepcion')
  })

  it('muestra un estado vacío cuando no hay movimientos', () => {
    // Arrange
    useMovimientos.mockReturnValue({ movimientos: [], loading: false, error: '' })

    // Act
    render(<MovementHistory uid="uid-1" />)

    // Assert
    expect(screen.getByText('No hay movimientos que coincidan.')).toBeInTheDocument()
  })
})