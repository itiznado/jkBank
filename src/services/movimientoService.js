import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'

function mergeAndSort(enviados, recibidos) {
  return [...enviados, ...recibidos].sort((a, b) => {
    const fechaA = a.fecha?.toMillis?.() ?? 0
    const fechaB = b.fecha?.toMillis?.() ?? 0
    return fechaB - fechaA
  })
}

export function subscribeToMovimientos(uid, { onData, onError }) {
  const movimientosRef = collection(db, 'movimientos')
  const enviadosQuery = query(movimientosRef, where('emisorUid', '==', uid))
  const recibidosQuery = query(movimientosRef, where('receptorUid', '==', uid))

  let enviados = []
  let recibidos = []
  let enviadosReady = false
  let recibidosReady = false

  function emitIfReady() {
    if (!enviadosReady || !recibidosReady) return
    onData(mergeAndSort(enviados, recibidos))
  }

  const unsubscribeEnviados = onSnapshot(
    enviadosQuery,
    (snapshot) => {
      enviados = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        tipo: 'envio',
      }))
      enviadosReady = true
      emitIfReady()
    },
    onError,
  )

  const unsubscribeRecibidos = onSnapshot(
    recibidosQuery,
    (snapshot) => {
      recibidos = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        tipo: 'recepcion',
      }))
      recibidosReady = true
      emitIfReady()
    },
    onError,
  )

  return function unsubscribe() {
    unsubscribeEnviados()
    unsubscribeRecibidos()
  }
}