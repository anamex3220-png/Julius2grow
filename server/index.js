import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { db } from './lib/db.js';
import { ROLES, nextSupportCustomerMessage } from './lib/challenges.js';
import {
  gradeDeveloperChallenge,
  gradeAccountingChallenge,
  gradeSupportTranscript,
} from './lib/grading.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

function publicCampaign(campaign) {
  return {
    id: campaign.id,
    role: campaign.role,
    roleLabel: ROLES[campaign.role].label,
    title: campaign.title,
    company: campaign.company,
    createdAt: campaign.createdAt,
    timeLimitSeconds: campaign.timeLimitSeconds,
    challenge: campaign.challenge.public,
  };
}

function publicAttempt(attempt) {
  const { secretSnapshot, ...rest } = attempt;
  return rest;
}

// --- Campañas (reclutador) ---

app.post('/api/campaigns', (req, res) => {
  const { role, title, company } = req.body || {};
  if (!ROLES[role]) {
    return res.status(400).json({ error: 'Rol inválido. Usa developer, support o accounting.' });
  }
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'El título del puesto es obligatorio.' });
  }

  const roleDef = ROLES[role];
  const campaign = {
    id: nanoid(10),
    role,
    title: title.trim(),
    company: (company || '').trim(),
    createdAt: new Date().toISOString(),
    timeLimitSeconds: roleDef.timeLimitSeconds,
    challenge: roleDef.build(),
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

  const { candidateName, candidateEmail } = req.body || {};
  if (!candidateName || !candidateName.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio.' });
  }

  const attempt = {
    id: nanoid(10),
    campaignId: campaign.id,
    role: campaign.role,
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
    transcript: campaign.role === 'support' ? [{ speaker: 'customer', text: campaign.challenge.secret.openingMessage }] : undefined,
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

app.post('/api/attempts/:id/support/reply', (req, res) => {
  const attempt = db.getAttempt(req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Intento no encontrado.' });
  if (attempt.role !== 'support') return res.status(400).json({ error: 'Este intento no es de atención al cliente.' });
  if (attempt.status !== 'in_progress') return res.status(400).json({ error: 'Este intento ya fue enviado.' });

  const { message } = req.body || {};
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  const candidateTurns = attempt.transcript.filter((m) => m.speaker === 'candidate').length;
  const turnIndex = candidateTurns;
  attempt.transcript.push({ speaker: 'candidate', text: message.trim() });

  const customerReply = nextSupportCustomerMessage(turnIndex, message.trim());
  if (customerReply) {
    attempt.transcript.push({ speaker: 'customer', text: customerReply });
  }

  db.updateAttempt(attempt.id, { transcript: attempt.transcript });
  res.json({ customerReply, done: !customerReply, transcript: attempt.transcript });
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
  } else if (attempt.role === 'developer') {
    const code = answer?.code || '';
    gradeResult = gradeDeveloperChallenge(code, attempt.secretSnapshot);
  } else if (attempt.role === 'accounting') {
    gradeResult = gradeAccountingChallenge(answer || {}, attempt.secretSnapshot);
  } else if (attempt.role === 'support') {
    gradeResult = gradeSupportTranscript(attempt.transcript || []);
  } else {
    return res.status(400).json({ error: 'Rol desconocido.' });
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

app.listen(PORT, () => {
  console.log(`API de retos escuchando en http://localhost:${PORT}`);
});
