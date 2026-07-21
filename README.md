# Anti-Currículum

Plataforma de reclutamiento basada en retos de 15 minutos en vez de CVs. En
lugar de leer perfiles inflados, el candidato resuelve un reto real en su
celular y la plataforma lo califica automáticamente.

## Los tres retos

| Rol | Reto | Cómo se califica |
|---|---|---|
| 💻 Programador/a | Arreglar una función de JavaScript con bugs (`calcularTotalCarrito`) | El código se corre contra 5 pruebas ocultas en un sandbox de `node:vm`. Puntaje = % de pruebas que pasan. |
| 🎧 Atención al cliente | Responder a un cliente furioso simulado (2 turnos) | Se analiza el texto del candidato buscando frases de empatía, ofertas de solución concreta y lenguaje poco profesional. Puntaje = 35% empatía + 40% resolución + 25% profesionalismo. |
| 📊 Contabilidad | Encontrar la línea de un balance general que no coincide con la suma de sus componentes | El candidato elige la línea y escribe el valor correcto. Puntaje = 70% por identificar la línea + 30% por el valor correcto. |

Cada reto tiene un límite de 15 minutos, controlado tanto en el cliente
(temporizador visible) como en el servidor (un envío después del límite +30s
de gracia se marca como `timeout` y puntúa 0).

## Flujo

1. **Reclutador**: entra a `/crear`, elige el rol, pone el título del puesto
   y obtiene un enlace único (`/c/:campaignId`).
2. **Candidato**: abre el enlace en su celular, pone su nombre y arranca el
   reto — sin cuenta ni registro previo.
3. **Calificación**: automática e inmediata al enviar (o al agotarse el
   tiempo).
4. **Reclutador**: entra a `/resultados/:campaignId` y ve un ranking en vivo
   (se refresca cada 5s), ordenado por puntaje. Puede entrar a cada intento
   para ver el detalle — código enviado y resultados de pruebas, transcripción
   completa del chat, o la respuesta contable comparada con la correcta.

## Arquitectura

Monorepo con dos workspaces npm:

```
server/   API en Express (Node, ESM)
  index.js          rutas HTTP
  lib/challenges.js contenido de cada reto (lo público que ve el candidato +
                     la clave de calificación, que nunca se envía al cliente)
  lib/grading.js     lógica de calificación por rol
  lib/db.js          persistencia en un JSON plano (server/data/db.json)

client/   SPA en React + Vite + react-router
  src/pages/          páginas (crear reto, resultados, detalle, flujo candidato)
  src/components/      los 3 tipos de reto + el temporizador
```

No hay base de datos externa ni autenticación — es un MVP para validar el
concepto. Antes de producción hace falta, como mínimo:

- **Auth para reclutadores**: hoy cualquiera con el enlace `/resultados/:id`
  ve los resultados. Falta login y ownership de campañas.
- **Sandbox más fuerte para el reto de programación**: `node:vm` con timeout
  basta para un demo, pero para producción conviene `isolated-vm`, un
  worker con seccomp, o un servicio tipo Judge0.
- **Base de datos real** (Postgres/SQLite) en vez de un archivo JSON, para
  manejar concurrencia y volumen.
- **El simulador de "cliente furioso" es reglas, no un LLM real** — detecta
  palabras clave de empatía/resolución. Es intencional: no depende de una
  API key externa y es 100% determinista para el demo. `nextSupportCustomerMessage`
  en `server/lib/challenges.js` es el punto de extensión para conectarlo a
  un LLM real (p. ej. Claude) y tener conversaciones dinámicas.

## Cómo correrlo

Requiere Node 18+.

```bash
npm install
npm run dev
```

Esto levanta la API en `http://localhost:4000` y el cliente en
`http://localhost:5173` (con proxy de `/api` hacia el servidor). Abre
`http://localhost:5173` para crear tu primer reto.
