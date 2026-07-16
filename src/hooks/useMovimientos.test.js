import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMovimientos } from './useMovimientos'
import { subscribeToMovimientos } from '../services/movimientoService'

vi.mock('../services/movimientoService', () => ({
  subscribeToMovimientos: vi.fn(),
}))

describe('useMovimientos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invoca el unsubscribe devuelto por Firebase al desmontar el componente', () => {
    // Arrange
    const unsubscribeMock = vi.fn()
    subscribeToMovimientos.mockReturnValue(unsubscribeMock)

    // Act
    const { unmount } = renderHook(() => useMovimientos('uid-1'))

    // Assert: se suscribió correctamente y el unsubscribe todavía no se llamó
    expect(subscribeToMovimientos).toHaveBeenCalledWith(
      'uid-1',
      expect.objectContaining({
        onData: expect.any(Function),
        onError: expect.any(Function),
      }),
    )
    expect(unsubscribeMock).not.toHaveBeenCalled()

    // Act: desmontar
    unmount()

    // Assert: React ejecutó la función de limpieza del useEffect
    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })

  it('no se suscribe a Firestore si no hay un uid', () => {
    // Arrange / Act
    renderHook(() => useMovimientos(undefined))

    // Assert
    expect(subscribeToMovimientos).not.toHaveBeenCalled()
  })
})