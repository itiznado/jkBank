import { useMovimientos } from '../hooks/useMovimientos'
import { formatSaldo } from '../utils/formatSaldo'
import { formatFecha } from '../utils/formatFecha'

function MovementHistory({ uid }) {
  const { movimientos, loading, error } = useMovimientos(uid)

  function renderContraparte(movimiento) {
    return movimiento.tipo === 'envio'
      ? movimiento.receptorNombre || movimiento.receptorEmail
      : movimiento.emisorNombre || movimiento.emisorEmail
  }

  function renderContenido() {
    if (loading) {
      return <p className="history__status">Cargando historial...</p>
    }

    if (error) {
      return <p className="history__error">{error}</p>
    }

    if (movimientos.length === 0) {
      return <p className="history__status">Todavía no tienes movimientos.</p>
    }

    return (
      <ul className="history__list">
        {movimientos.map((movimiento) => (
          <li key={movimiento.id} className="history__item">
            <div className="history__info">
              <p className="history__contraparte">{renderContraparte(movimiento)}</p>
              <p className="history__fecha">{formatFecha(movimiento.fecha)}</p>
              {movimiento.descripcion && (
                <p className="history__descripcion">{movimiento.descripcion}</p>
              )}
            </div>
            <p
              className={
                movimiento.tipo === 'envio'
                  ? 'history__monto history__monto--envio'
                  : 'history__monto history__monto--recepcion'
              }
            >
              {movimiento.tipo === 'envio' ? '-' : '+'}
              {formatSaldo(movimiento.monto)}
            </p>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="history">
      <h2>Historial de movimientos</h2>
      {renderContenido()}
    </section>
  )
}

export default MovementHistory