import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export class CashError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

async function applyCashOperation({ uid, monto, categoria }) {
  const userRef = doc(db, 'users', uid)
  const movimientoRef = doc(collection(db, 'movimientos'))

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef)

    if (!userSnap.exists()) {
      throw new CashError('cash/user-not-found')
    }

    const saldoActual = userSnap.data().saldo

    if (categoria === 'retiro' && saldoActual < monto) {
      throw new CashError('cash/insufficient-funds')
    }

    const nuevoSaldo = categoria === 'retiro' ? saldoActual - monto : saldoActual + monto
    transaction.update(userRef, { saldo: nuevoSaldo })

    const movimientoBase = {
      categoria,
      monto,
      descripcion: categoria === 'deposito' ? 'Depósito simulado' : 'Retiro simulado',
      fecha: serverTimestamp(),
    }

    transaction.set(movimientoRef, {
      ...movimientoBase,
      emisorUid: categoria === 'retiro' ? uid : null,
      receptorUid: categoria === 'deposito' ? uid : null,
    })
  })
}

export function depositMoney({ uid, monto }) {
  return applyCashOperation({ uid, monto, categoria: 'deposito' })
}

export function withdrawMoney({ uid, monto }) {
  return applyCashOperation({ uid, monto, categoria: 'retiro' })
}

export function getCashErrorMessage(errorCode) {
  const messages = {
    'cash/user-not-found': 'No se encontró tu perfil bancario.',
    'cash/insufficient-funds': 'No tienes saldo suficiente para este retiro.',
  }
  return messages[errorCode] ?? 'No se pudo completar la operación. Intenta de nuevo.'
}