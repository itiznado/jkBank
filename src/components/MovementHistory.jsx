import { useMemo, useState } from 'react'
import { useMovimientos } from '../hooks/useMovimientos'
import { formatSaldo } from '../utils/formatSaldo'
import { formatFecha } from '../utils/formatFecha'

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'envio', label: 'Enviados' },
  { value: 'recepcion', label: 'Recibidos' },
  { value: 'deposito', label: 'Depósitos' },
  { value: 'retiro', label: 'Retiros' },
]

function getContraparte(movimiento) {
  if (movimiento.categoria === 'deposito') return 'Depósito'
  if (movimiento.categoria === 'retiro') return 'Retiro'
  return movimiento.tipo === 'envio'
    ? movimiento.receptorNombre || movimiento.receptorEmail
    : movimiento.emisorNombre || movimiento.emisorEmail
}

function matchesFiltro(movimiento, filtroTipo) {
  if (filtroTipo === 'todos') return true
  if (filtroTipo === 'deposito' || filtroTipo === 'retiro') {
    return movimiento.categoria === filtroTipo
  }
  return (
    movimiento.tipo === filtroTipo &&
    movimiento.categoria !== 'deposito' &&
    movimiento.categoria !== 'retiro'
  )
}

function MovementHistory({ uid }) {
  const { movimientos, loading, error } = useMovimientos(uid)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  function handleFiltroChange(event) {
    setFiltroTipo(event.target.value)
  }

  function handleBusquedaChange(event) {
    setBusqueda(event.target.value)
  }

  const movimientosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase()

    return movimientos.filter((movimiento) => {
      if (!matchesFiltro(movimiento, filtroTipo)) return false
      if (!busquedaNormalizada) return true

      return getContraparte(movimiento).toLowerCase().includes(busquedaNormalizada)
    })
  }, [movimientos, filtroTipo, busqueda])

  function renderContenido() {
    if (loading) return <p className="history__status">Cargando historial...</p>
    if (error) return <p className="history__error">{error}</p>
    if (movimientosFiltrados.length === 0) {
      return <p className="history__status">No hay movimientos que coincidan.</p>
    }

    return (
      <ul className="history__list">
        {movimientosFiltrados.map((movimiento) => (
          <li key={movimiento.id} className="history__item">
            <div className="history__info">
              <p className="history__contraparte">{getContraparte(movimiento)}</p>
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

      <div className="history__filters">
        <label className="history__filterField">
          Tipo
          <select value={filtroTipo} onChange={handleFiltroChange}>
            {FILTROS.map((filtro) => (
              <option key={filtro.value} value={filtro.value}>
                {filtro.label}
              </option>
            ))}
          </select>
        </label>

        <label className="history__filterField">
          Buscar
          <input
            type="text"
            placeholder="Nombre, correo, depósito o retiro"
            value={busqueda}
            onChange={handleBusquedaChange}
          />
        </label>
      </div>

      {renderContenido()}
    </section>
  )
}

export default MovementHistory