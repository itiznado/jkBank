# jkBank

Banca digital simulada construida con React + Firebase (Authentication + Firestore) para la tercera evaluación de Programación Front End.

Con un stack de React 19 (Vite), Firebase Authentication y Cloud Firestore.

## Instalación y ejecución local

```bash
npm install
cp .env.example .env
```

Completa `.env` con las credenciales entregadas.

```bash
npm run dev
```
La app debería de estar disponible en el localhost 5173.

## Usuarios de prueba

| Nombre | Email | Contraseña |
|---|---|---|
| MsCebolla | `cebollita@vegetal.cl` | `cebollete1212` |
| MrTomate | `tomatito@fruta.cl` | `tomatete1122` |

## Modelo de datos

```
users/{uid}
  nombre, email, saldo

movimientos/{id}
  categoria: 'transferencia' | 'deposito' | 'retiro'
  emisorUid, receptorUid       (null cuando no aplica, ej. depósito/retiro)
  emisorNombre, emisorEmail
  receptorNombre, receptorEmail
  monto, descripcion, fecha (serverTimestamp)
```

Se usa una sola colección `movimientos` para transferencias, depósitos y retiros (distinguidos por `categoria`) en vez de colecciones separadas, para no duplicar la lógica de historial y evitar mantener dos suscripciones `onSnapshot` adicionales. El historial se arma con dos queries (`emisorUid` / `receptorUid`) mezcladas y ordenadas en el cliente, para no depender de un índice compuesto en Firestore.

## Uso de IA

Usé Claude para implementar RF3–RF5, los bonus (depósito/retiro, filtros, modo oscuro, `useReducer`+`useContext`) y el rediseño visual. Le pedí explícitamente evitar índices compuestos en Firestore y mantener la lógica de Firebase fuera de los componentes. Tuve que corregir el manejo de limpieza de las dos suscripciones del historial (`emisorUid`/`receptorUid`) para que no emitieran datos hasta que ambas hubieran cargado, y ajustar el CSS generado para no perder contraste en los montos de dinero.
