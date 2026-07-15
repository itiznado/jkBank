const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MONTO_MINIMO = 1

/**
 * Valida el formato de un correo de destinatario.
 * @param {string} email
 * @returns {string} mensaje de error, o '' si es válido
 */
export function validateEmail(email) {
  const trimmed = (email ?? '').trim()

  if (!trimmed) {
    return 'Ingresa el correo del destinatario.'
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'El correo no tiene un formato válido.'
  }

  return ''
}

/**
 * Valida un monto de transferencia/operación en pesos (sin decimales).
 * @param {string|number} monto
 * @param {number|null} saldoDisponible - si se entrega, valida que no exceda el saldo
 * @returns {string} mensaje de error, o '' si es válido
 */
export function validateMonto(monto, saldoDisponible = null) {
  if (monto === '' || monto === null || monto === undefined) {
    return 'Ingresa un monto válido.'
  }

  const montoNumerico = Number(monto)

  if (Number.isNaN(montoNumerico)) {
    return 'Ingresa un monto válido.'
  }

  if (!Number.isInteger(montoNumerico)) {
    return 'El monto no puede tener decimales.'
  }

  if (montoNumerico < MONTO_MINIMO) {
    return 'El monto debe ser mayor a 0.'
  }

  if (saldoDisponible !== null && montoNumerico > saldoDisponible) {
    return 'No tienes saldo suficiente para esta transferencia.'
  }

  return ''
}

/**
 * Valida el formulario completo de transferencia.
 * @param {object} datos
 * @param {string} datos.receptorEmail
 * @param {string|number} datos.monto
 * @param {string} datos.emisorEmail - correo del usuario que envía, para bloquear auto-transferencia
 * @param {number|null} datos.saldoDisponible
 * @returns {string} mensaje de error, o '' si el formulario es válido
 */
export function validateTransferForm({ receptorEmail, monto, emisorEmail, saldoDisponible = null }) {
  const emailError = validateEmail(receptorEmail)
  if (emailError) {
    return emailError
  }

  const trimmedReceptor = receptorEmail.trim().toLowerCase()
  const trimmedEmisor = (emisorEmail ?? '').trim().toLowerCase()

  if (trimmedEmisor && trimmedReceptor === trimmedEmisor) {
    return 'No puedes transferirte dinero a ti mismo.'
  }

  return validateMonto(monto, saldoDisponible)
}