import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../firebase'
import { createUserProfile } from './userService'

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function registerUser({ nombre, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await createUserProfile(credential.user.uid, { nombre, email })
  return credential.user
}

export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function logoutUser() {
  await signOut(auth)
}

export function getAuthErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/invalid-email': 'El correo no es válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'Correo o contraseña incorrectos.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
  }

  return messages[errorCode] ?? 'Ocurrió un error. Intenta de nuevo.'
}
