import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const SALDO_INICIAL = 100000

export async function createUserProfile(uid, { nombre, email }) {
  await setDoc(doc(db, 'users', uid), {
    nombre,
    email,
    saldo: SALDO_INICIAL,
  })
}

export function subscribeToUserProfile(uid, { onData, onError }) {
  const userRef = doc(db, 'users', uid)

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ id: snapshot.id, ...snapshot.data() })
        return
      }

      onData(null)
    },
    onError,
  )
}
