import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

export class TransferError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

async function findUserByEmail(email) {
  const usersRef = collection(db, 'users')
  const emailQuery = query(usersRef, where('email', '==', email), limit(1))
  const snapshot = await getDocs(emailQuery)

  if (snapshot.empty) {
    return null
  }

  const userDoc = snapshot.docs[0]
  return { id: userDoc.id, ...userDoc.data() }
}

export async function transferMoney({ emisorUid, receptorEmail, monto, descripcion }) {
  const receptor = await findUserByEmail(receptorEmail)

  if (!receptor) {
    throw new TransferError('transfer/recipient-not-found')
  }

  if (receptor.id === emisorUid) {
    throw new TransferError('transfer/self-transfer')
  }

  const emisorRef = doc(db, 'users', emisorUid)
  const receptorRef = doc(db, 'users', receptor.id)
  const movimientoRef = doc(collection(db, 'movimientos'))

  await runTransaction(db, async (transaction) => {
    const emisorSnap = await transaction.get(emisorRef)
    const receptorSnap = await transaction.get(receptorRef)

    if (!emisorSnap.exists() || !receptorSnap.exists()) {
      throw new TransferError('transfer/recipient-not-found')
    }

    const saldoEmisor = emisorSnap.data().saldo
    const saldoReceptor = receptorSnap.data().saldo

    if (saldoEmisor < monto) {
      throw new TransferError('transfer/insufficient-funds')
    }

    transaction.update(emisorRef, { saldo: saldoEmisor - monto })
    transaction.update(receptorRef, { saldo: saldoReceptor + monto })
    transaction.set(movimientoRef, {
      emisorUid,
      receptorUid: receptor.id,
      emisorNombre: emisorSnap.data().nombre,
      emisorEmail: emisorSnap.data().email,
      receptorNombre: receptorSnap.data().nombre,
      receptorEmail: receptorSnap.data().email,
      monto,
      descripcion: descripcion || '',
      fecha: serverTimestamp(),
    })
  })
}

export function getTransferErrorMessage(errorCode) {
  const messages = {
    'transfer/recipient-not-found': 'No encontramos un usuario con ese correo.',
    'transfer/self-transfer': 'No puedes transferirte dinero a ti mismo.',
    'transfer/insufficient-funds': 'No tienes saldo suficiente para esta transferencia.',
  }

  return messages[errorCode] ?? 'No se pudo completar la transferencia. Intenta de nuevo.'
}