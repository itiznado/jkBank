export function formatFecha(timestamp) {
  if (!timestamp?.toDate) {
    return 'Procesando...'
  }

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(timestamp.toDate())
}