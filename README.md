# Vacaciones Julius

Sistema interno para que el talento de Julius suba solicitudes de vacaciones y
otras ausencias, sus managers las autoricen, y RH tenga control total de los
balances.

## Reglas de negocio implementadas

- **Vacaciones** según la Ley Federal del Trabajo (México, reforma 2023): 12
  días el primer año, +2 cada año hasta el quinto (20), luego +2 cada 5 años.
  No acumulables entre periodos (año de servicio, basado en el aniversario de
  contratación).
- **Excepción por residencia fuera de México**: si la persona reside fuera de
  México, tiene automáticamente **15 días hábiles** de vacaciones al año, sin
  importar antigüedad.
- **Días personales**: 6 al año en dos bolsas de 3 días no acumulables entre
  sí (enero–junio y julio–diciembre).
- **Incapacidad**: se registra pero no descuenta de ningún balance.
- Todos los conteos de días son en **días hábiles** (excluyen fines de semana
  y el calendario de feriados administrado por RH).

La lógica vive en `server/src/domain/vacationRules.ts` y tiene tests
unitarios en `server/src/domain/vacationRules.test.ts`.

## Estructura del proyecto

```
server/   API en Node.js + TypeScript + Express + Prisma + PostgreSQL
client/   Frontend en React + TypeScript + Vite + Tailwind CSS
```

En producción, `server` sirve el build de `client` como archivos estáticos:
un solo servicio para desplegar.

## Roles

- **Empleado**: sube solicitudes, ve su balance e historial.
- **Manager**: aprueba/rechaza solicitudes de su equipo directo.
- **RH / Admin**: ve y decide sobre todas las solicitudes, administra
  personas (alta, antigüedad, residencia, manager, rol), el calendario de
  feriados, y puede hacer ajustes manuales de balance.

Si una persona (incluyendo un manager) no tiene manager asignado, sus
solicitudes escalan directamente a RH/Admin.

## Desarrollo local

### Requisitos

- Node.js 20+
- Docker (para levantar PostgreSQL localmente) — o un PostgreSQL propio.

### 1. Base de datos

```bash
docker compose up -d
```

Esto levanta Postgres en `localhost:5432` con las credenciales del
`docker-compose.yml` (usuario/clave `julius`, base `julius_vacaciones`).

### 2. Backend

```bash
cd server
cp .env.example .env   # ajusta si es necesario
npm install
npm run prisma:migrate   # crea las tablas
npm run prisma:seed      # crea datos de ejemplo
npm run dev               # API en http://localhost:4000
```

Datos de ejemplo (todas las cuentas usan la contraseña `Julius2026!`):

| Persona | Email | Rol |
|---|---|---|
| María Torres | admin@julius2grow.com | RH / Admin |
| Carlos Vega | carlos.vega@julius2grow.com | Manager |
| Lucía Fernández | lucia.fernandez@julius2grow.com | Manager |
| Pedro Ramírez | pedro.ramirez@julius2grow.com | Empleado (reporta a Carlos) |
| Sofía Jiménez | sofia.jimenez@julius2grow.com | Empleado (reporta a Carlos) |
| Daniela López | daniela.lopez@julius2grow.com | Empleado (reporta a Lucía) |
| Jorge Salinas | jorge.salinas@julius2grow.com | Empleado, reside fuera de México (reporta a Lucía) |

### 3. Frontend

```bash
cd client
npm install
npm run dev   # http://localhost:5173 (proxy a la API en :4000)
```

Abre `http://localhost:5173` e inicia sesión con cualquiera de las cuentas de
arriba.

### Tests

```bash
cd server
npm test
```

## Despliegue (recomendado: Render.com)

1. Crea una base de datos **PostgreSQL** administrada en Render.
2. Crea un **Web Service** apuntando a este repo, con:
   - Build command: `npm install && npm run build --prefix server && npm install --prefix client && npm run build --prefix client`
   - Start command: `npm start --prefix server`
   - Variables de entorno: `DATABASE_URL` (la de Render), `JWT_SECRET`
     (genera uno largo y aleatorio), `NODE_ENV=production`.
3. Corre las migraciones contra la base de producción antes del primer
   arranque: `npx prisma migrate deploy` (desde `server`, con el
   `DATABASE_URL` de producción).
4. Corre `npm run prisma:seed` una sola vez si quieres partir con las cuentas
   de ejemplo (recomendado solo reemplazar por datos reales de Julius antes
   de usarlo en producción).

Con esto, un solo servicio de Render sirve tanto la API como la interfaz web.

## Pendiente para producción

- **Login con Google Workspace (SSO)**: hoy el login es con email/contraseña.
  El modelo de usuario ya usa el email como identificador único, así que
  agregar "Sign in with Google" más adelante es un cambio aislado en
  `server/src/routes/auth.ts` y en la pantalla de login — no requiere
  rediseñar el resto del sistema.
- Notificaciones por email (hoy todo es in-app).
