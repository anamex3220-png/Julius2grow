import { randomBytes } from 'node:crypto';

// Login único y compartido para el equipo de reclutamiento — no hay cuentas
// individuales ni ownership por campaña, solo una contraseña que separa "lo
// que ve un candidato con el link" de "lo que ve quien administra retos".
// Las sesiones viven en memoria (un Set de tokens), así que un redeploy o
// reinicio del servidor cierra la sesión de todos — aceptable para una
// herramienta interna, no pensado para alta disponibilidad.

const DEV_FALLBACK_PASSWORD = 'julius-dev-only';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.warn(
    '⚠️  ADMIN_PASSWORD no está configurada — usando una contraseña de desarrollo insegura ' +
      `("${DEV_FALLBACK_PASSWORD}"). Configúrala como variable de entorno antes de usar esto en producción.`
  );
}

const EFFECTIVE_PASSWORD = ADMIN_PASSWORD || DEV_FALLBACK_PASSWORD;
const activeSessions = new Set();

export function checkPassword(password) {
  return password === EFFECTIVE_PASSWORD;
}

export function createSession() {
  const token = randomBytes(24).toString('hex');
  activeSessions.add(token);
  return token;
}

export function destroySession(token) {
  activeSessions.delete(token);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: 'Sesión inválida o expirada. Inicia sesión de nuevo.' });
  }
  next();
}
