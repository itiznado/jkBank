import { useState } from 'react'
import { depositMoney, withdrawMoney, getCashErrorMessage } from '../services/cashService'

function CashForm({ user, saldoDisponible }) {
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleMontoChange(event) {
    setMonto(event.target.value)
    setError('')
    setSuccessMessage('')
  }

  function validateMonto(montoNumerico, categoria) {
    if (!monto || Number.isNaN(montoNumerico)) {
      return 'Ingresa un monto válido.'
    }
    if (montoNumerico < 1) {
      return 'El monto debe ser mayor a 0.'
    }
    if (categoria === 'retiro' && saldoDisponible !== null && montoNumerico > saldoDisponible) {
      return 'No tienes saldo suficiente para este retiro.'
    }
    return ''
  }

  async function handleOperation(categoria) {
    const montoNumerico = Number(monto)
    const validationError = validateMonto(montoNumerico, categoria)

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      if (categoria === 'deposito') {
        await depositMoney({ uid: user.uid, monto: montoNumerico })
        setSuccessMessage('Depósito realizado con éxito.')
      } else {
        await withdrawMoney({ uid: user.uid, monto: montoNumerico })
        setSuccessMessage('Retiro realizado con éxito.')
      }
      setMonto('')
    } catch (cashError) {
      setError(getCashErrorMessage(cashError.code))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDepositClick() {
    handleOperation('deposito')
  }

  function handleWithdrawClick() {
    handleOperation('retiro')
  }

  return (
    <section className="cash">
      <h2>Depósito y retiro</h2>
      <div className="cash__form">
        <label className="cash__field">
          Monto
          <input
            type="number"
            name="montoCash"
            min="1"
            value={monto}
            onChange={handleMontoChange}
            disabled={isSubmitting}
          />
        </label>

        {error && <p className="cash__error">{error}</p>}
        {successMessage && <p className="cash__success">{successMessage}</p>}

        <div className="cash__actions">
          <button type="button" className="cash__deposit" onClick={handleDepositClick} disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Depositar'}
          </button>
          <button type="button" className="cash__withdraw" onClick={handleWithdrawClick} disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Retirar'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default CashForm