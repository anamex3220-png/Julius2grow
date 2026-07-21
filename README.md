# Anti-Currículum

Plataforma de reclutamiento basada en retos de 15 minutos en vez de CVs. En
lugar de leer perfiles inflados, el candidato resuelve un reto real en su
celular y la plataforma lo califica automáticamente.

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

### Agregar una posición nueva

1. En `server/lib/skills.js`, escribe una función `buildXChallenge()` que
   regrese `{ public, secret }` con la forma que pide el `type` elegido.
2. Agrega una entrada al objeto `SKILLS` con `id`, `label`, `icon`,
   `description`, `category` y `type`.
3. Listo — no hay que tocar el cliente ni el motor de calificación
   (`server/lib/grading.js`); el picker, el detalle de resultados y la
   pantalla del candidato ya renderizan por `type`, no por skill.

Cada reto tiene un límite de 15 minutos, controlado tanto en el cliente
(temporizador visible) como en el servidor (un envío después del límite +30s
de gracia se marca como `timeout` y puntúa 0).

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
  index.js       rutas HTTP
  lib/skills.js  catálogo de skills — contenido de cada reto (lo público
                 que ve el candidato + la clave de calificación, que nunca
                 se envía al cliente)
  lib/grading.js motor de calificación genérico por `type` (code/diagnosis/
                 scenario), sin lógica específica de ningún skill
  lib/db.js      persistencia en un JSON plano (server/data/db.json)

client/   SPA en React + Vite + react-router
  src/format.js         formateo de valores para retos tipo "diagnosis"
  src/pages/            páginas (crear reto, resultados, detalle, flujo candidato)
  src/components/       CodeChallenge / DiagnosisChallenge / ScenarioChallenge
                         (uno por `type`, genéricos — no por skill) + Timer
```

No hay base de datos externa ni autenticación — es un MVP para validar el
concepto. Antes de producción hace falta, como mínimo:

- **Auth para reclutadores**: hoy cualquiera con el enlace `/resultados/:id`
  ve los resultados. Falta login y ownership de campañas.
- **Sandbox más fuerte para los retos tipo `code`**: `node:vm` con timeout
  basta para un demo, pero para producción conviene `isolated-vm`, un
  worker con seccomp, o un servicio tipo Judge0.
- **Base de datos real** (Postgres/SQLite) en vez de un archivo JSON, para
  manejar concurrencia y volumen.
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
npm run dev
```

Esto levanta la API en `http://localhost:4000` y el cliente en
`http://localhost:5173` (con proxy de `/api` hacia el servidor). Abre
`http://localhost:5173` para crear tu primer reto.
