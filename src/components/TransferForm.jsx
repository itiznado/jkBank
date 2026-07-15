import { useState } from 'react'
import { transferMoney, getTransferErrorMessage } from '../services/transferService'
import { validateTransferForm } from '../utils/validaciones'

function TransferForm({ user, saldoDisponible }) {
  const [receptorEmail, setReceptorEmail] = useState('')
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleReceptorEmailChange(event) {
    setReceptorEmail(event.target.value)
    setError('')
    setSuccessMessage('')
  }

  function handleMontoChange(event) {
    setMonto(event.target.value)
    setError('')
    setSuccessMessage('')
  }

  function handleDescripcionChange(event) {
    setDescripcion(event.target.value)
  }

  function validateForm() {
  return validateTransferForm({
    receptorEmail,
    monto,
    emisorEmail: user.email,
    saldoDisponible,
  })
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
    setSuccessMessage('')

    try {
      await transferMoney({
        emisorUid: user.uid,
        receptorEmail: receptorEmail.trim(),
        monto: Number(monto),
        descripcion: descripcion.trim(),
      })

      setSuccessMessage('Transferencia realizada con éxito.')
      setReceptorEmail('')
      setMonto('')
      setDescripcion('')
    } catch (transferError) {
      setError(getTransferErrorMessage(transferError.code))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="transfer">
      <h2>Transferir dinero</h2>
      <form className="transfer__form" onSubmit={handleSubmit} noValidate>
        <label className="transfer__field">
          Correo del destinatario
          <input
            type="email"
            name="receptorEmail"
            value={receptorEmail}
            onChange={handleReceptorEmailChange}
            disabled={isSubmitting}
          />
        </label>

        <label className="transfer__field">
          Monto
          <input
            type="number"
            name="monto"
            min="1"
            value={monto}
            onChange={handleMontoChange}
            disabled={isSubmitting}
          />
        </label>

        <label className="transfer__field">
          Descripción (opcional)
          <input
            type="text"
            name="descripcion"
            value={descripcion}
            onChange={handleDescripcionChange}
            disabled={isSubmitting}
          />
        </label>

        {error && <p className="transfer__error">{error}</p>}
        {successMessage && <p className="transfer__success">{successMessage}</p>}

        <button type="submit" className="transfer__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Transfiriendo...' : 'Transferir'}
        </button>
      </form>
    </section>
  )
}

export default TransferForm