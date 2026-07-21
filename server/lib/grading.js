import vm from 'node:vm';

const RUN_TIMEOUT_MS = 1000;

// Ejecuta el código del candidato en un sandbox de node:vm (sin acceso a
// require/process/fs) y corre cada caso de prueba con timeout. No es un
// aislamiento a prueba de balas para producción (usar isolated-vm o un
// worker con seccomp para eso), pero basta para evaluar snippets cortos.
export function gradeCodeChallenge(candidateCode, secret) {
  const { functionName, tests } = secret;
  const results = tests.map((test) => {
    try {
      const sandbox = {};
      vm.createContext(sandbox);
      const script = new vm.Script(
        `${candidateCode}\n;__result__ = ${functionName}(...__args__);`
      );
      sandbox.__args__ = test.args;
      script.runInContext(sandbox, { timeout: RUN_TIMEOUT_MS });
      const actual = sandbox.__result__;
      const pass = actual === test.expected;
      return { args: test.args, expected: test.expected, actual, pass };
    } catch (err) {
      return {
        args: test.args,
        expected: test.expected,
        actual: null,
        pass: false,
        error: err.message,
      };
    }
  });

  const passedCount = results.filter((r) => r.pass).length;
  const score = Math.round((passedCount / tests.length) * 100);
  return {
    score,
    passed: score === 100,
    detail: { results, passedCount, total: tests.length },
  };
}

export function gradeDiagnosisChallenge(answer, secret) {
  const lineCorrect = answer.lineId === secret.correctLineId;
  const valueCorrect = Number(answer.correctedValue) === secret.correctValue;
  let score = 0;
  if (lineCorrect) score += 70;
  if (lineCorrect && valueCorrect) score += 30;
  return {
    score,
    passed: lineCorrect && valueCorrect,
    detail: {
      submittedLineId: answer.lineId,
      submittedValue: answer.correctedValue,
      correctLineId: secret.correctLineId,
      correctValue: secret.correctValue,
      lineCorrect,
      valueCorrect,
    },
  };
}

// Rúbrica genérica: cada "dimensión" suma puntos cuando el texto del
// candidato contiene alguna de sus palabras clave; `negativeWords` y los
// mensajes demasiado cortos/largos restan puntos. Así una misma función
// califica cualquier escenario (soporte, copy, etc.) con solo cambiar la
// configuración en server/lib/skills.js — no hay lógica por skill aquí.
export function gradeScenarioChallenge(transcript, secret) {
  const rubric = secret.rubric;
  const candidateMessages = transcript
    .filter((m) => m.speaker === 'candidate')
    .map((m) => m.text);

  if (candidateMessages.length === 0) {
    return {
      score: 0,
      passed: false,
      detail: { dimensions: rubric.dimensions.map((d) => ({ key: d.key, label: d.label, score: 0 })) },
    };
  }

  const fullText = candidateMessages.join(' ').toLowerCase();

  const dimensionScores = rubric.dimensions.map((dim) => {
    const hits = dim.words.filter((w) => fullText.includes(w)).length;
    const score = Math.min(100, hits * (dim.hitValue || 50));
    return { key: dim.key, label: dim.label, score, weight: dim.weight };
  });
  const weightedScore = dimensionScores.reduce((sum, d) => sum + d.score * d.weight, 0);

  const negativeHits = (rubric.negativeWords || []).filter((w) => fullText.includes(w)).length;
  const tooShort = candidateMessages.some(
    (m) => m.trim().split(/\s+/).length < (rubric.minWordsPerMessage || 1)
  );
  const tooLong = rubric.maxCharsPerMessage
    ? candidateMessages.some((m) => m.length > rubric.maxCharsPerMessage)
    : false;

  let penalty = negativeHits * (rubric.negativePenalty || 0);
  if (tooShort) penalty += rubric.shortMessagePenalty || 0;
  if (tooLong) penalty += rubric.lengthPenalty || 0;

  const score = Math.max(0, Math.min(100, Math.round(weightedScore - penalty)));

  return {
    score,
    passed: score >= (rubric.passThreshold ?? 60),
    detail: { dimensions: dimensionScores, negativeHits, tooShort, tooLong },
  };
}

// Retos "open" (armados por el reclutador): una o más preguntas abiertas.
// Si una pregunta trae `rubric` (palabras clave), se autocalifica por
// coincidencia de palabras — igual que el resto del motor, sin fingir
// entender la respuesta. Si no trae rubric, queda marcada para que el
// reclutador la califique a mano leyendo la respuesta (ver
// recomputeOpenScore, usada también después de calificar manualmente).
export function gradeOpenChallenge(answers, questions) {
  const perQuestion = questions.map((q) => {
    const text = (answers?.[q.id] || '').trim();
    let autoScore = null;
    if (q.rubric && text) {
      const hits = q.rubric.words.filter((w) => text.toLowerCase().includes(w)).length;
      autoScore = Math.min(100, hits * (q.rubric.hitValue || 34));
    }
    return {
      id: q.id,
      criterion: q.criterion,
      answered: text.length > 0,
      autoScore,
      manualScore: null,
      manualNotes: '',
      needsManualReview: !q.rubric,
    };
  });

  return finalizeOpenScore(perQuestion);
}

export function finalizeOpenScore(perQuestion) {
  const finalScores = perQuestion
    .map((q) => (q.manualScore ?? q.autoScore))
    .filter((s) => s != null);
  const score = finalScores.length > 0 ? Math.round(finalScores.reduce((s, v) => s + v, 0) / finalScores.length) : null;
  const pendingReview = perQuestion.some((q) => q.needsManualReview && q.manualScore == null);

  return {
    score,
    passed: pendingReview ? null : score != null ? score >= 60 : null,
    detail: { perQuestion, pendingReview },
  };
}
