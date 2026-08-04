# Retos - Julius

Plataforma de reclutamiento basada en retos diseñados para resolverse rápido,
en vez de CVs. En lugar de leer perfiles inflados, el candidato resuelve en
su celular un reto pensado para evaluarlo de forma técnica y más eficaz, y la
plataforma lo califica automáticamente.

## Catálogo de skills

El picker de "qué skill evaluar" no está hardcodeado en el cliente: sale de
`GET /api/skills`, que lee el catálogo en `server/lib/skills.js`. Hoy trae 8
posiciones (marketing + tecnología), pero agregar una nueva es agregar una
entrada al catálogo — el cliente y el motor de calificación no conocen
"paid_media" ni "developer" por nombre, solo el `type` del reto.

| Categoría | Skill | Tipo | Reto |
|---|---|---|---|
| Marketing | 📈 Paid Media | `diagnosis` | El ROAS de una campaña no coincide con ingresos ÷ gasto. Encontrarla y corregirla. |
| Marketing | 🔍 SEO | `diagnosis` | Una fila de tracking de keywords tiene el cambio de posición mal calculado. |
| Marketing | ✍️ Content | `scenario` | Reescribir un anuncio sin gancho ni llamado a la acción, en un solo turno. |
| Marketing | 📇 CRM | `code` | Arreglar una regla de segmentación de clientes VIP con un bug de lógica (`\|\|` en vez de `&&`). |
| Marketing | ⚙️ Automation | `code` | Arreglar el trigger de un correo de carrito abandonado que dispara en casos que no debería. |
| Tecnología | 💻 Programador/a | `code` | Arreglar una función de JS con bugs (`calcularTotalCarrito`). |
| Tecnología | 🎧 Atención al cliente | `scenario` | Responder a un cliente furioso simulado (2 turnos). |
| Tecnología | 📊 Contabilidad | `diagnosis` | Encontrar la línea de un balance general que no coincide con sus componentes. |

Tres motores de calificación genéricos cubren cualquier posición nueva:

- **`code`** — el candidato edita una función con bugs. Se corre contra N
  pruebas ocultas en un sandbox de `node:vm`. Puntaje = % de pruebas que pasan.
- **`diagnosis`** — una tabla de datos (`lineItems`, con `group`/`label`/
  `value`/`format`) tiene una fila cuyo valor no coincide con su fórmula. El
  candidato la señala y da el valor correcto. Puntaje = 70% por la línea +
  30% por el valor. `format` (`currency` | `ratio` | `signed` | `number`)
  controla cómo se muestra (`$1,000`, `1.2x`, `+7`, `14`) sin tocar el motor.
- **`scenario`** — el candidato responde 1 o más turnos a una persona
  simulada (cliente, brief de marca, etc.). Se califica con una rúbrica
  configurable: `dimensions` (grupos de palabras clave que suman puntos, con
  su propio peso), `negativeWords` (restan), `minWordsPerMessage` /
  `maxCharsPerMessage` (penalizan mensajes muy cortos o muy largos). Las
  respuestas de la otra persona (`branches`) también son datos: qué
  dimensiones necesita haber tocado el candidato para desbloquear cada
  réplica.
- **`open`** — una o más preguntas abiertas armadas por el reclutador (ver
  "Retos personalizados" abajo), con contexto opcional (texto, imagen,
  tabla). Si una pregunta trae palabras clave, se autocalifica igual que
  `scenario`; si no, queda pendiente hasta que el reclutador la califique a
  mano desde el detalle del intento.

### Agregar una posición nueva

1. En `server/lib/skills.js`, escribe una función `buildXChallenge()` que
   regrese `{ public, secret }` con la forma que pide el `type` elegido.
2. Agrega una entrada al objeto `SKILLS` con `id`, `label`, `icon`,
   `description`, `category` y `type`.
3. Listo — no hay que tocar el cliente ni el motor de calificación
   (`server/lib/grading.js`); el picker, el detalle de resultados y la
   pantalla del candidato ya renderizan por `type`, no por skill.

Cada reto tiene un límite de tiempo (15 min en el catálogo, configurable en
los retos personalizados), controlado tanto en el cliente (temporizador
visible) como en el servidor (un envío después del límite +30s de gracia se
marca como `timeout` y puntúa 0).

## Retos personalizados (constructor + banco de preguntas)

En `/crear`, además del catálogo, hay un modo "Crear el mío" para reclutadores
que quieren armar su propio reto — sin código:

- **Contexto**: texto libre, una imagen (arrastrar/subir un archivo, se
  guarda como data URI en el JSON — sin cuenta de almacenamiento externo;
  cap de ~2MB) y/o una tabla de datos editable (agregar columnas y filas
  desde la UI).
- **Preguntas abiertas y elaboradas** (no opción múltiple), etiquetadas con
  el criterio que miden. El default recomendado es **integral** — técnica de
  la especialización + lógica + soft skill evaluadas en una sola pregunta
  situacional — pero también existen las 3 etiquetas de v2 (lógica,
  conocimiento, soft skill) por si prefieres una pregunta enfocada en un solo
  criterio. Cada pregunta puede traer palabras clave esperadas (autocalifica)
  o quedar en blanco (el reclutador la lee y la califica manualmente desde el
  detalle del intento, con nota opcional — ver `POST /api/attempts/:id/grade`).
- **Banco de preguntas** (`server/lib/questionBank.js`, expuesto en
  `GET /api/question-bank`): máximo 5 preguntas por área (25 en total —
  Paid Media, SEO, Content, CRM, Automation), todas de criterio integral y
  sin rúbrica de palabras clave a propósito — son preguntas de juicio
  situacional pensadas para responderse a conciencia, y calificarlas por
  coincidencia de palabras las trivializaría. El enunciado de cada una
  presenta hechos y una tensión (presupuesto, tiempo, un stakeholder pidiendo
  algo) sin adelantar el diagnóstico o la decisión correcta — eso es lo que
  se evalúa. Se insertan con un clic desde el constructor y se pueden editar
  libremente.

## Aviso anti-IA en cada reto

Todo candidato ve, antes de empezar, un aviso fijo (en inglés, tal como lo
pidió el equipo) advirtiendo que el sistema detecta el uso de IA u otros
recursos externos y que eso invalida la aplicación — independiente del
`integrityMode` que tenga esa campaña. Vive hardcodeado en
`CandidateStart.jsx`; es un elemento disuasorio, no una prueba técnica en sí
(la prueba técnica son las señales descritas abajo).

## Login

Hay una sola contraseña compartida para todo el equipo de reclutamiento —
no son cuentas individuales, y por lo tanto no hay "quién creó qué campaña"
(cualquiera logueado ve y administra todas). Protege `/crear`, `/mis-retos`,
`/mis-retos/:id/editar`, `/resultados/:id` y `/resultados/:id/intentos/:id`
tanto en el cliente (`RequireAuth.jsx` redirige a `/login` si no hay sesión)
como en el servidor (`requireAuth` en `server/lib/auth.js` rechaza con 401
las rutas de creación/edición/borrado/resultados sin un token válido).

El candidato **nunca ve el login** — su flujo entero (`/c/:campaignId` y
todo lo que cuelga de ahí) sigue siendo público a propósito, porque solo
tiene el link que le compartes.

- La contraseña vive en la variable de entorno `ADMIN_PASSWORD` — nunca en
  el código ni en git. Si no está configurada, el servidor arranca con una
  contraseña de desarrollo insegura y lo avisa en los logs; hay que ponerla
  de verdad antes de usar esto con candidatos reales.
- Las sesiones son tokens random guardados en memoria del servidor
  (`server/lib/auth.js`), no en el disco persistente — un redeploy o
  reinicio del servicio cierra la sesión de todo el equipo y hay que volver
  a entrar. Es una limitación aceptada a cambio de simplicidad; si se vuelve
  molesto, el siguiente paso natural es guardar las sesiones en el mismo
  almacenamiento persistente que ya existe para campañas e intentos.

### Configurar la contraseña en Render

1. Entra a tu servicio en Render → **Environment**.
2. Agrega la variable `ADMIN_PASSWORD` con la contraseña que quieras usar.
3. Guarda — Render reinicia el servicio con la contraseña nueva activa.

## Panel de administración ("Mis retos")

En `/mis-retos` hay una lista de todas las campañas creadas, con cuántos
candidatos ha respondido cada una. Desde ahí:

- **Ver resultados** — va al ranking de esa campaña (ya existía).
- **Editar** — para retos del catálogo, solo se edita metadata (título,
  empresa, correo de contacto, modo anti-IA); el contenido del reto viene
  del skill y no se toca ahí. Para retos personalizados (`open`), se edita
  todo con el mismo formulario del constructor (`CustomChallengeForm.jsx`,
  compartido entre crear y editar), precargado incluyendo las palabras
  clave de cada pregunta — esas viven en `secret` y nunca se le mandan al
  candidato, pero sí al reclutador vía `GET /api/campaigns/:id/edit`.
- **Eliminar** — borra la campaña completa y, en cascada, todos sus
  intentos (`DELETE /api/campaigns/:id`). Distinto del borrado de un
  intento individual que ya existía en el detalle de cada candidato.

Todas las rutas de este panel están detrás del login — ver la sección
"Login" arriba.

## Anti-IA

No existe una forma de garantizar al 100% que un candidato no consultó una
IA en otro dispositivo — cualquier producto que lo prometa está exagerando.
Lo que sí se puede hacer es poner fricción y dejar señales para que el
reclutador decida. Cada reto personalizado elige un modo (`integrityMode`):

- **`signals`** (default) — no bloquea nada, pero detecta y muestra en el
  detalle del intento: cuántas veces se intentó pegar texto, cuántas veces
  se cambió de pestaña/ventana (y cuánto tiempo estuvo fuera), y si apareció
  más texto del que se tecleó (proxy de "algo insertó texto sin que lo
  escribieran" — autocompletado, extensión, u otra vía).
- **`strict`** — todo lo anterior, más: pegar texto queda deshabilitado de
  verdad en las respuestas (`preventDefault` en el evento `paste`) y se
  solicita pantalla completa al candidato (los navegadores no permiten
  bloquear la tecla Esc, así que se detectan y cuentan las salidas en vez de
  impedirlas).

Estas señales viven en `client/src/integrity.js` (se activan por textarea vía
`ref`) y se guardan en `attempt.integrity`, visibles como ⚠️ en el ranking y
desglosadas en el detalle del intento. Aplican a los tipos `scenario` y
`open` — los tipos `code`/`diagnosis` no bloquean pegar porque ahí sí es
legítimo que el candidato pegue su propio código o un valor.

## Datos de candidatos: privacidad, borrado y persistencia

La plataforma sí guarda lo que responde cada candidato — nombre, correo (si
lo da), sus respuestas completas, puntaje, y las señales de integridad. Eso
es necesario para que el ranking y la calificación funcionen. Lo que existe
para manejar eso con cuidado:

- **Aviso + consentimiento**: antes de empezar, el candidato ve qué se
  guarda y para qué, con una casilla obligatoria para aceptar
  (`CandidateStart.jsx`). El servidor rechaza crear el intento si no llega
  `consent: true`, y guarda `consentAcceptedAt` en el intento como registro.
- **Correo de contacto por campaña**: al crear un reto (catálogo o
  personalizado) puedes poner un correo de contacto opcional; si lo pones,
  el aviso de privacidad le dice al candidato a dónde escribir para pedir
  que se borre su información.
- **Borrado manual**: en el detalle de cualquier intento hay un botón
  "🗑 Eliminar este intento" que lo borra por completo
  (`DELETE /api/attempts/:id`). No hay borrado automático por tiempo — es
  una acción explícita cuando alguien lo pide.

### Que los datos sobrevivan a un redeploy (disco persistente en Render)

Por default, todo se guarda en `server/data/db.json`, un archivo plano. El
código ya lee la ubicación de ese archivo de la variable de entorno
`DATA_DIR` (`server/lib/db.js`) para poder apuntarlo a un disco que no se
borre nunca — pero hay que crear ese disco una vez desde el dashboard de
Render (no basta con hacer push del `render.yaml` actualizado, porque
cambiar el plan y agregar un disco a un servicio que ya existe implica un
cambio de costo que Render no aplica solo):

1. Entra a tu servicio en Render → **Settings**.
2. En **Instance Type**, cambia del plan Free a un plan pagado (el
   dashboard te muestra el costo actual antes de confirmar — el disco
   persistente no está disponible en Free).
3. Busca la sección **Disks** → **Add Disk**. Ponle un nombre (ej.
   `julius2grow-data`), como **Mount Path** usa `/var/data`, y déjalo en 1GB
   (de sobra para esto).
4. En **Environment**, agrega la variable `DATA_DIR` con el valor
   `/var/data` (mismo valor que el Mount Path).
5. Guarda — Render va a reiniciar el servicio con el disco ya montado. De
   ahí en adelante, los datos sobreviven a redeploys y reinicios.

El archivo `render.yaml` ya quedó actualizado con esta configuración
(`plan: starter`, disco, y la env var), así que un servicio nuevo creado
desde ese Blueprint la trae de una vez — los pasos de arriba son solo para
migrar el servicio que ya tienes corriendo.

## Flujo

1. **Reclutador**: entra a `/crear`, elige el skill del catálogo, pone el
   título del puesto y obtiene un enlace único (`/c/:campaignId`).
2. **Candidato**: abre el enlace en su celular, pone su nombre y arranca el
   reto — sin cuenta ni registro previo.
3. **Calificación**: automática e inmediata al enviar (o al agotarse el
   tiempo).
4. **Reclutador**: entra a `/resultados/:campaignId` y ve un ranking en vivo
   (se refresca cada 5s), ordenado por puntaje. Puede entrar a cada intento
   para ver el detalle — código enviado y resultados de pruebas, transcripción
   completa del chat con el desglose por dimensión, o los datos evaluados
   comparados contra la respuesta correcta.

## Arquitectura

Monorepo con dos workspaces npm:

```
server/   API en Express (Node, ESM)
  index.js               rutas HTTP
  lib/auth.js             login de una sola contraseña compartida +
                         sesiones en memoria (`requireAuth` middleware)
  lib/skills.js          catálogo de skills — contenido de cada reto (lo
                         público que ve el candidato + la clave de
                         calificación, que nunca se envía al cliente)
  lib/customChallenge.js valida/normaliza los retos "open" armados por el
                         reclutador (constructor)
  lib/questionBank.js    banco de preguntas situacionales para el constructor
  lib/grading.js         motor de calificación genérico por `type`
                         (code/diagnosis/scenario/open), sin lógica
                         específica de ningún skill
  lib/db.js              persistencia en un JSON plano (server/data/db.json)

client/   SPA en React + Vite + react-router
  public/logo-julius.png      logo de marca (topbar + favicon)
  src/auth.jsx                 AuthProvider/useAuth (token en localStorage)
  src/RequireAuth.jsx          guarda de ruta — redirige a /login sin sesión
  src/format.js               formateo de valores para retos tipo "diagnosis"
  src/integrity.js            hook de señales anti-IA (paste/tab-switch/
                               keystroke/fullscreen)
  src/pages/                  páginas: login, crear reto (constructor),
                               Mis retos (lista), editar reto, resultados,
                               detalle, flujo candidato
  src/components/             CodeChallenge / DiagnosisChallenge /
                               ScenarioChallenge / OpenChallenge (uno por
                               `type`, genéricos — no por skill) + Timer +
                               CustomChallengeForm (constructor, compartido
                               entre crear y editar) + TableEditor /
                               ImageUploadField / QuestionBankPicker
```

No hay base de datos externa ni cuentas individuales — es un MVP para
validar el concepto. Antes de producción hace falta, como mínimo:

- **Ownership por reclutador**: el login es una sola contraseña compartida,
  así que cualquiera del equipo ve y administra las campañas de todos —
  no hay noción de "mis campañas" vs. "las de alguien más". Si el equipo
  crece o se necesita separar accesos, el siguiente paso es login
  individual con ownership por campaña.
- **Sandbox más fuerte para los retos tipo `code`**: `node:vm` con timeout
  basta para un demo, pero para producción conviene `isolated-vm`, un
  worker con seccomp, o un servicio tipo Judge0.
- **Base de datos real** (Postgres/SQLite) en vez de un archivo JSON — con
  disco persistente los datos ya sobreviven a un redeploy, pero un archivo
  plano sigue sin manejar bien escrituras concurrentes ni volumen alto.
- **Los escenarios (`support`, `content`) son reglas, no un LLM real** —
  detectan palabras clave por dimensión. Es intencional: no depende de una
  API key externa y es 100% determinista para el demo. `nextScenarioMessage`
  en `server/lib/skills.js` es el punto de extensión para conectar un LLM
  real (p. ej. Claude) y tener conversaciones dinámicas en vez de branching
  por palabras clave.

## Cómo correrlo

Requiere Node 18+.

```bash
npm install
ADMIN_PASSWORD=lo-que-quieras npm run dev
```

Esto levanta la API en `http://localhost:4000` y el cliente en
`http://localhost:5173` (con proxy de `/api` hacia el servidor). Abre
`http://localhost:5173` — el catálogo y el flujo de candidato son públicos;
para crear o administrar retos, entra a `/login` con la contraseña que
pusiste en `ADMIN_PASSWORD` (si no la pones, usa una de desarrollo insegura
y lo avisa en la consola).
