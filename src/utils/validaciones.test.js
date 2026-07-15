import { describe, expect, it } from 'vitest'
import { validateEmail, validateMonto, validateTransferForm } from './validaciones'

describe('validateMonto', () => {
  it.each([
    ['monto negativo', -500, null, 'El monto debe ser mayor a 0.'],
    ['monto igual a cero', 0, null, 'El monto debe ser mayor a 0.'],
    ['monto no numérico', 'abc', null, 'Ingresa un monto válido.'],
    ['monto con decimales inválidos', 1500.5, null, 'El monto no puede tener decimales.'],
    ['monto vacío', '', null, 'Ingresa un monto válido.'],
    ['monto mayor al saldo disponible', 50000, 10000, 'No tienes saldo suficiente para esta transferencia.'],
  ])('rechaza: %s', (_descripcion, monto, saldoDisponible, mensajeEsperado) => {
    // Arrange: los parámetros llegan directamente del it.each

    // Act
    const resultado = validateMonto(monto, saldoDisponible)

    // Assert
    expect(resultado).toBe(mensajeEsperado)
  })

  it('acepta un monto entero positivo dentro del saldo disponible', () => {
    // Arrange
    const monto = 15000
    const saldoDisponible = 20000

    // Act
    const resultado = validateMonto(monto, saldoDisponible)

    // Assert
    expect(resultado).toBe('')
  })

  it('acepta un monto entero positivo cuando no se entrega saldoDisponible', () => {
    // Arrange
    const monto = 5000

    // Act
    const resultado = validateMonto(monto)

    // Assert
    expect(resultado).toBe('')
  })
})

describe('validateEmail', () => {
  it.each([
    ['correo vacío', '', 'Ingresa el correo del destinatario.'],
    ['correo solo con espacios', '   ', 'Ingresa el correo del destinatario.'],
    ['correo sin arroba', 'usuarioarroba.cl', 'El correo no tiene un formato válido.'],
    ['correo sin dominio', 'usuario@', 'El correo no tiene un formato válido.'],
    ['correo con espacios internos', 'usuario @correo.cl', 'El correo no tiene un formato válido.'],
  ])('rechaza: %s', (_descripcion, email, mensajeEsperado) => {
    // Arrange / Act
    const resultado = validateEmail(email)

    // Assert
    expect(resultado).toBe(mensajeEsperado)
  })

  it('acepta un correo con formato válido', () => {
    // Arrange
    const email = 'usuario@correo.cl'

    // Act
    const resultado = validateEmail(email)

    // Assert
    expect(resultado).toBe('')
  })
})

describe('validateTransferForm', () => {
  it('rechaza la transferencia a la propia cuenta de origen', () => {
    // Arrange
    const datos = {
      receptorEmail: 'yo@correo.cl',
      monto: 1000,
      emisorEmail: 'YO@correo.cl',
      saldoDisponible: 5000,
    }

    // Act
    const resultado = validateTransferForm(datos)

    // Assert
    expect(resultado).toBe('No puedes transferirte dinero a ti mismo.')
  })

  it('rechaza cuando el destinatario tiene formato de email inválido', () => {
    // Arrange
    const datos = {
      receptorEmail: 'correo-invalido',
      monto: 1000,
      emisorEmail: 'yo@correo.cl',
      saldoDisponible: 5000,
    }

    // Act
    const resultado = validateTransferForm(datos)

    // Assert
    expect(resultado).toBe('El correo no tiene un formato válido.')
  })

  it('caso feliz: acepta un monto válido con saldo suficiente y destinatario correcto', () => {
    // Arrange
    const datos = {
      receptorEmail: 'destinatario@correo.cl',
      monto: 2500,
      emisorEmail: 'yo@correo.cl',
      saldoDisponible: 10000,
    }

    // Act
    const resultado = validateTransferForm(datos)

    // Assert
    expect(resultado).toBe('')
  })
})