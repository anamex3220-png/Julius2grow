import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';
import { db } from './lib/db.js';
import { SKILLS, CATEGORY_LABELS, nextScenarioMessage } from './lib/skills.js';
import {
  gradeCodeChallenge,
  gradeDiagnosisChallenge,
  gradeScenarioChallenge,
} from './lib/grading.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

function publicCampaign(campaign) {
  const skill = SKILLS[campaign.skillId];
  return {
    id: campaign.id,
    skillId: campaign.skillId,
    skillLabel: skill.label,
    category: skill.category,
    categoryLabel: CATEGORY_LABELS[skill.category],
    title: campaign.title,
    company: campaign.company,
    createdAt: campaign.createdAt,
    timeLimitSeconds: campaign.timeLimitSeconds,
    challenge: { type: skill.type, ...campaign.challenge.public },
  };
}

function publicAttempt(attempt) {
  const { secretSnapshot, ...rest } = attempt;
  return rest;
}

// --- Catálogo de skills ---

app.get('/api/skills', (req, res) => {
  const skills = Object.values(SKILLS).map((s) => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    description: s.description,
    category: s.category,
    categoryLabel: CATEGORY_LABELS[s.category],
  }));
  res.json({ skills, categories: CATEGORY_LABELS });
});

// --- Campañas (reclutador) ---

app.post('/api/campaigns', (req, res) => {
  const { skillId, title, company } = req.body || {};
  const skill = SKILLS[skillId];
  if (!skill) {
    return res.status(400).json({ error: 'Skill inválido.' });
  }
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'El título del puesto es obligatorio.' });
  }

  const campaign = {
    id: nanoid(10),
    skillId,
    title: title.trim(),
    company: (company || '').trim(),
    createdAt: new Date().toISOString(),
    timeLimitSeconds: skill.timeLimitSeconds,
    challenge: skill.build(),
  };
  db.addCampaign(campaign);
  res.status(201).json(publicCampaign(campaign));
});

app.get('/api/campaigns/:id', (req, res) => {
  const campaign = db.getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaña no encontrada.' });
  res.json(publicCampaign(campaign));
});

app.get('/api/campaigns/:id/results', (req, res) => {
  const campaign = db.getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaña no encontrada.' });
  const attempts = db
    .getAttemptsForCampaign(campaign.id)
    .map(publicAttempt)
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  res.json({ campaign: publicCampaign(campaign), attempts });
});

// --- Intentos (candidato) ---

app.post('/api/campaigns/:id/attempts', (req, res) => {
  const campaign = db.getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaña no encontrada.' });
  const skill = SKILLS[campaign.skillId];

  const { candidateName, candidateEmail } = req.body || {};
  if (!candidateName || !candidateName.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio.' });
  }

  const attempt = {
    id: nanoid(10),
    campaignId: campaign.id,
    skillId: campaign.skillId,
    challengeType: skill.type,
    candidateName: candidateName.trim(),
    candidateEmail: (candidateEmail || '').trim(),
    startedAt: new Date().toISOString(),
    timeLimitSeconds: campaign.timeLimitSeconds,
    status: 'in_progress',
    submittedAt: null,
    durationSeconds: null,
    score: null,
    passed: null,
    detail: null,
    transcript:
      skill.type === 'scenario' ? [{ speaker: 'customer', text: campaign.challenge.secret.openingMessage }] : undefined,
    secretSnapshot: campaign.challenge.secret,
  };
  db.addAttempt(attempt);
  res.status(201).json(publicAttempt(attempt));
});

app.get('/api/attempts/:id', (req, res) => {
  const attempt = db.getAttempt(req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Intento no encontrado.' });
  res.json(publicAttempt(attempt));
});

app.post('/api/attempts/:id/scenario/reply', (req, res) => {
  const attempt = db.getAttempt(req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Intento no encontrado.' });
  if (attempt.challengeType !== 'scenario') return res.status(400).json({ error: 'Este intento no es de tipo escenario.' });
  if (attempt.status !== 'in_progress') return res.status(400).json({ error: 'Este intento ya fue enviado.' });

  const { message } = req.body || {};
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  const candidateTurns = attempt.transcript.filter((m) => m.speaker === 'candidate').length;
  const turnIndex = candidateTurns;
  attempt.transcript.push({ speaker: 'candidate', text: message.trim() });

  const reply = nextScenarioMessage(attempt.secretSnapshot, turnIndex, message.trim());
  if (reply) {
    attempt.transcript.push({ speaker: 'customer', text: reply });
  }

  db.updateAttempt(attempt.id, { transcript: attempt.transcript });
  res.json({ customerReply: reply, done: !reply, transcript: attempt.transcript });
});

app.post('/api/attempts/:id/submit', (req, res) => {
  const attempt = db.getAttempt(req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Intento no encontrado.' });
  if (attempt.status !== 'in_progress') {
    return res.status(400).json({ error: 'Este intento ya fue enviado.' });
  }

  const startedAt = new Date(attempt.startedAt).getTime();
  const now = Date.now();
  const durationSeconds = Math.round((now - startedAt) / 1000);
  const timedOut = durationSeconds > attempt.timeLimitSeconds + 30; // 30s de gracia por red

  let gradeResult;
  const { answer } = req.body || {};

  if (timedOut) {
    gradeResult = { score: 0, passed: false, detail: { reason: 'tiempo agotado' } };
  } else if (attempt.challengeType === 'code') {
    const code = answer?.code || '';
    gradeResult = gradeCodeChallenge(code, attempt.secretSnapshot);
  } else if (attempt.challengeType === 'diagnosis') {
    gradeResult = gradeDiagnosisChallenge(answer || {}, attempt.secretSnapshot);
  } else if (attempt.challengeType === 'scenario') {
    gradeResult = gradeScenarioChallenge(attempt.transcript || [], attempt.secretSnapshot);
  } else {
    return res.status(400).json({ error: 'Tipo de reto desconocido.' });
  }

  const updated = db.updateAttempt(attempt.id, {
    status: timedOut ? 'timeout' : 'submitted',
    submittedAt: new Date(now).toISOString(),
    durationSeconds,
    score: gradeResult.score,
    passed: gradeResult.passed,
    detail: gradeResult.detail,
    submittedAnswer: answer,
  });

  res.json(publicAttempt(updated));
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Sirve el cliente ya compilado (client/dist) cuando existe, para que un
// solo proceso/servicio cubra API + frontend en producción. En desarrollo
// (npm run dev) client/dist no existe y Vite sirve el frontend aparte.
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`API de retos escuchando en http://localhost:${PORT}`);
});
