// Retos "open" armados por el reclutador desde el constructor (no vienen
// del catálogo de skills.js). Este módulo solo valida y normaliza lo que
// manda el cliente — la calificación vive en grading.js (gradeOpenChallenge),
// igual que cualquier otro tipo de reto.

export const CRITERIA = {
  logica: 'Lógica aplicada al puesto',
  conocimiento: 'Conocimiento aplicado',
  soft_skill: 'Soft skill',
};

const MAX_IMAGE_BASE64_LENGTH = 2_800_000; // ~2MB decoded
const MAX_QUESTIONS = 8;
const DEFAULT_TIME_LIMIT_MINUTES = 20;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

function normalizeKeywords(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  return list.map((w) => w.trim().toLowerCase()).filter(Boolean);
}

export function buildCustomChallenge(input) {
  const { title, company, timeLimitMinutes, integrityMode, challenge } = input || {};

  if (!title || !title.trim()) throw new ValidationError('El título del puesto es obligatorio.');
  if (!challenge || !Array.isArray(challenge.questions) || challenge.questions.length === 0) {
    throw new ValidationError('Agrega al menos una pregunta.');
  }
  if (challenge.questions.length > MAX_QUESTIONS) {
    throw new ValidationError(`Máximo ${MAX_QUESTIONS} preguntas por reto.`);
  }

  const questionsPublic = [];
  const questionsSecret = [];

  challenge.questions.forEach((q, i) => {
    const text = (q.text || '').trim();
    if (!text) throw new ValidationError(`La pregunta ${i + 1} no puede estar vacía.`);
    if (!CRITERIA[q.criterion]) throw new ValidationError(`La pregunta ${i + 1} necesita un criterio válido.`);

    const id = `q${i + 1}`;
    const keywords = normalizeKeywords(q.keywords);

    questionsPublic.push({
      id,
      text,
      criterion: q.criterion,
      criterionLabel: CRITERIA[q.criterion],
    });
    questionsSecret.push({
      id,
      rubric: keywords.length > 0 ? { words: keywords, hitValue: Math.round(100 / Math.max(1, keywords.length)) } : null,
    });
  });

  let image = null;
  if (challenge.image && challenge.image.dataUrl) {
    if (challenge.image.dataUrl.length > MAX_IMAGE_BASE64_LENGTH) {
      throw new ValidationError('La imagen es muy grande (máximo ~2MB). Usa una más ligera.');
    }
    image = { dataUrl: challenge.image.dataUrl, alt: challenge.image.alt || '' };
  }

  let table = null;
  if (challenge.table && Array.isArray(challenge.table.columns) && challenge.table.columns.length > 0) {
    const columns = challenge.table.columns.map((c) => String(c || '').trim());
    const rows = (challenge.table.rows || []).map((row) => columns.map((_, i) => String(row?.[i] ?? '').trim()));
    table = { caption: (challenge.table.caption || '').trim(), columns, rows };
  }

  const minutes = Number(timeLimitMinutes) || DEFAULT_TIME_LIMIT_MINUTES;
  const timeLimitSeconds = Math.min(60, Math.max(5, minutes)) * 60;

  return {
    timeLimitSeconds,
    integrityMode: integrityMode === 'strict' ? 'strict' : 'signals',
    challenge: {
      public: {
        prompt: (challenge.prompt || '').trim(),
        image,
        table,
        questions: questionsPublic,
      },
      secret: {
        questions: questionsSecret,
      },
    },
  };
}

export { ValidationError };
