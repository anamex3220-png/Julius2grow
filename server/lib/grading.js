import vm from 'node:vm';
import {
  EMPATHY_WORDS,
  RESOLUTION_WORDS,
  NEGATIVE_WORDS,
} from './challenges.js';

const RUN_TIMEOUT_MS = 1000;

// Ejecuta el código del candidato en un sandbox de node:vm (sin acceso a
// require/process/fs) y corre cada caso de prueba con timeout. No es un
// aislamiento a prueba de balas para producción (usar isolated-vm o un
// worker con seccomp para eso), pero basta para evaluar snippets cortos.
export function gradeDeveloperChallenge(candidateCode, secret) {
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

export function gradeAccountingChallenge(answer, secret) {
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

function countMatches(text, words) {
  const lower = text.toLowerCase();
  return words.filter((w) => lower.includes(w)).length;
}

export function gradeSupportTranscript(transcript) {
  const candidateMessages = transcript
    .filter((m) => m.speaker === 'candidate')
    .map((m) => m.text);

  if (candidateMessages.length === 0) {
    return { score: 0, passed: false, detail: { empathy: 0, resolution: 0, professionalism: 0 } };
  }

  const fullText = candidateMessages.join(' ');
  const empathyHits = countMatches(fullText, EMPATHY_WORDS);
  const resolutionHits = countMatches(fullText, RESOLUTION_WORDS);
  const negativeHits = countMatches(fullText, NEGATIVE_WORDS);
  const tooShort = candidateMessages.some((m) => m.trim().split(/\s+/).length < 4);

  const empathyScore = Math.min(100, empathyHits * 50);
  const resolutionScore = Math.min(100, resolutionHits * 50);
  let professionalismScore = 100 - negativeHits * 40 - (tooShort ? 20 : 0);
  professionalismScore = Math.max(0, professionalismScore);

  const score = Math.round(
    empathyScore * 0.35 + resolutionScore * 0.4 + professionalismScore * 0.25
  );

  return {
    score,
    passed: score >= 60,
    detail: {
      empathy: empathyScore,
      resolution: resolutionScore,
      professionalism: professionalismScore,
      negativeHits,
    },
  };
}
