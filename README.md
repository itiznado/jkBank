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

## Evaluación 3 — Testing Unitario

### Instrucciones de ejecución

\`\`\`bash
npm install
npm test          # modo watch, corre la suite completa
npm run coverage  # corre la suite una vez y genera el reporte de cobertura
\`\`\`

El reporte HTML detallado queda en `coverage/index.html` tras correr `npm run coverage`.

### Reporte de cobertura

Cobertura de líneas, acotada a `src/utils/` y a los tres componentes cubiertos por la rúbrica (`TransferForm`, `AuthForm`, `MovementHistory`):

\`\`\`
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   85.1  |   69.44  |  85.71  |  88.05
 components        |  81.65  |    60    |  82.6   |  85.29
  AuthForm.jsx      |  79.54  |  59.37   |  71.42  |  79.54
  MovementHistory   |  67.64  |  51.42   |   80    |  77.77
  TransferForm.jsx  |   100   |   100    |   100   |   100
 utils              |  96.87  |   90.9   |   100   |  96.87
  formatFecha.js    |  66.66  |    50    |   100   |  66.66
  formatSaldo.js     |   100   |   100    |   100   |   100
  validaciones.js   |   100   |  93.54   |   100   |   100
\`\`\`

Todas las carpetas exigidas por la rúbrica superan el mínimo de 70% de cobertura de líneas: `src/utils/` agregado llega a 96.87%, y los tres componentes testeados promedian 85.29%. `formatFecha.js` individualmente queda en 66.66% porque su rama de fallback ("Procesando...", usada solo mientras el `serverTimestamp()` de Firestore aún no resuelve) no se ejercita en los tests actuales; no afecta el cumplimiento porque la rúbrica evalúa la carpeta `src/utils/` en conjunto.

**Nota sobre `Login.test.jsx` / `Historial.test.jsx`:** las instrucciones nombran estos archivos, pero el proyecto real usa `AuthForm.jsx` y `MovementHistory.jsx` (así se llaman desde la Evaluación 2). Se mantuvieron los nombres reales del proyecto en lugar de renombrar componentes solo para calzar con la nomenclatura del enunciado — evita romper imports en el resto de la app sin ganar cobertura real.

### Refactorizaciones realizadas

- **`src/utils/validaciones.js` (nuevo):** se extrajo toda la lógica de validación de `TransferForm.jsx` (antes una función `validateForm` inline) a tres funciones puras: `validateEmail`, `validateMonto` y `validateTransferForm`. El componente ahora solo importa y llama `validateTransferForm`; no contiene reglas de negocio.
- **`TransferForm.jsx` — `noValidate` en el `<form>`:** el input de monto usa `min="1"` como atributo HTML nativo. Al testear el caso de "monto negativo", el navegador (jsdom lo simula fielmente) bloqueaba el evento `submit` **antes** de que el JS de validación se ejecutara, por constraint validation nativa — el mensaje de error personalizado nunca se disparaba. Se agregó `noValidate` al formulario para que la validación de `validaciones.js` sea la única fuente de verdad. Bug real preexistente, encontrado por el test, no un ajuste cosmético para hacerlo pasar.
- **`validaciones.js` — rechazo de decimales:** se agregó una regla que no existía en el código original (`Number.isInteger`), porque jkBank opera en CLP y `formatSaldo` ya fuerza `maximumFractionDigits: 0`. Permitir transferir montos como `$1500.50` era una inconsistencia latente; las instrucciones de RT2 piden testear ese caso explícitamente, lo que forzó a corregirlo.

### Bitácora de uso de IA

Usé Claude para levantar el entorno de Vitest + Testing Library, extraer la validación pura y escribir los cuatro archivos de test (`validaciones.test.js`, `TransferForm.test.jsx`, `AuthForm.test.jsx`, `MovementHistory.test.jsx`). Cada archivo se verificó corriendo `vitest run` real antes de entregarlo — no se aceptó ningún test sin correrlo primero.

**Ejemplo concreto de mock erróneo que tuve que corregir:** el primer intento de `TransferForm.test.jsx` mockeaba `transferService` así:

\`\`\`js
vi.mock('../services/transferService', async () => {
  const actual = await vi.importActual('../services/transferService')
  return { ...actual, transferMoney: vi.fn() }
})
\`\`\`

La intención era reusar `getTransferErrorMessage` real y sobrescribir solo `transferMoney`. El problema: `vi.importActual` ejecuta el archivo real completo, que importa `src/firebase.js`, que llama `initializeApp()`/`getAuth()` con las variables de entorno reales — inexistentes en el entorno de test. Esto lanzaba `FirebaseError: auth/invalid-api-key` y tumbaba toda la suite, violando directamente el punto de RT5 ("ningún test debe conectarse a Firebase real"). La corrección fue mockear el módulo completo a mano, duplicando el pequeño diccionario de mensajes de error dentro del propio mock en vez de reimportarlo. Es la razón por la que descarté ese enfoque para todos los demás archivos de test del proyecto.
