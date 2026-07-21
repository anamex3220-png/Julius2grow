import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDiagnosisValue } from '../format.js';

const CRITERION_LABEL = {
  integral: 'Técnica + lógica + soft skill',
  logica: 'Lógica aplicada',
  conocimiento: 'Conocimiento aplicado',
  soft_skill: 'Soft skill',
};

export default function AttemptDetail() {
  const { campaignId, attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getAttempt(attemptId), api.getCampaign(campaignId)])
      .then(([a, c]) => {
        setAttempt(a);
        setCampaign(c);
      })
      .catch((err) => setError(err.message));
  }, [attemptId, campaignId]);

  if (error) return <p className="error-text">{error}</p>;
  if (!attempt || !campaign) return <p className="muted">Cargando...</p>;

  const pending = attempt.challengeType === 'open' && attempt.detail?.pendingReview;

  return (
    <div>
      <Link to={`/resultados/${campaignId}`} className="muted">
        ← Volver al ranking
      </Link>
      <h1 style={{ marginTop: 12 }}>{attempt.candidateName}</h1>
      <p className="lede">
        {attempt.candidateEmail} · {campaign.skillLabel} · {attempt.status}
      </p>

      <div className="score-row">
        <div className="score-tile">
          <div className="value">{attempt.score ?? '—'}</div>
          <div className="label">Puntaje</div>
        </div>
        <div className="score-tile">
          <div className="value">{attempt.durationSeconds != null ? Math.round(attempt.durationSeconds / 60) : '—'}m</div>
          <div className="label">Tiempo</div>
        </div>
        <div className="score-tile">
          <div className="value">{pending ? 'Pendiente' : attempt.passed === null ? '—' : attempt.passed ? 'Sí' : 'No'}</div>
          <div className="label">Aprobó</div>
        </div>
      </div>

      <IntegrityCard integrity={attempt.integrity} />

      {attempt.challengeType === 'code' && <CodeDetail attempt={attempt} />}
      {attempt.challengeType === 'diagnosis' && <DiagnosisDetail attempt={attempt} campaign={campaign} />}
      {attempt.challengeType === 'scenario' && <ScenarioDetail attempt={attempt} />}
      {attempt.challengeType === 'open' && <OpenDetail attempt={attempt} campaign={campaign} onGraded={setAttempt} />}
    </div>
  );
}

function IntegrityCard({ integrity }) {
  if (!integrity) return null;
  const flags = [];
  if (integrity.pasteCount > 0) flags.push(`Pegó texto ${integrity.pasteCount} ${integrity.pasteCount === 1 ? 'vez' : 'veces'}`);
  if (integrity.tabSwitchCount > 0)
    flags.push(`Cambió de pestaña ${integrity.tabSwitchCount} ${integrity.tabSwitchCount === 1 ? 'vez' : 'veces'} (${integrity.awaySeconds}s fuera)`);
  if (integrity.fullscreenExits > 0) flags.push(`Salió de pantalla completa ${integrity.fullscreenExits} veces`);
  if (integrity.suspiciousInputRatio) flags.push('Apareció más texto del que escribió con el teclado (posible inserción no tipeada)');

  if (flags.length === 0) {
    return (
      <div className="card">
        <p className="muted" style={{ margin: 0 }}>✅ Sin señales de alerta durante el reto.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ borderColor: 'var(--warn)' }}>
      <p style={{ margin: '0 0 8px', fontWeight: 700 }}>⚠️ Señales de integridad</p>
      <ul className="muted" style={{ margin: 0, paddingLeft: 20 }}>
        {flags.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      <p className="muted" style={{ fontSize: '0.78rem', marginTop: 8, marginBottom: 0 }}>
        Esto no es prueba de nada — son señales para que tú decidas cuánto pesan.
      </p>
    </div>
  );
}

function CodeDetail({ attempt }) {
  const detail = attempt.detail || {};
  return (
    <div className="card">
      <h2>Código enviado</h2>
      <pre className="link-box" style={{ whiteSpace: 'pre-wrap' }}>
        {attempt.submittedAnswer?.code || '(sin enviar)'}
      </pre>
      <h2>Resultados de pruebas ({detail.passedCount}/{detail.total})</h2>
      <table>
        <thead>
          <tr>
            <th>Entrada</th>
            <th>Esperado</th>
            <th>Obtenido</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {(detail.results || []).map((r, i) => (
            <tr key={i}>
              <td>{JSON.stringify(r.args)}</td>
              <td>{JSON.stringify(r.expected)}</td>
              <td>{r.error ? `Error: ${r.error}` : JSON.stringify(r.actual)}</td>
              <td>
                <span className={`badge ${r.pass ? 'pass' : 'fail'}`}>{r.pass ? 'Pasó' : 'Falló'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiagnosisDetail({ attempt, campaign }) {
  const detail = attempt.detail || {};
  const lineItems = campaign.challenge.lineItems || [];
  const correctItem = lineItems.find((item) => item.id === detail.correctLineId);

  return (
    <div className="card">
      <h2>Datos evaluados</h2>
      <table className="balance-table">
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id} className={item.isTotal ? 'total' : ''}>
              <td>
                {item.label}
                {item.id === detail.correctLineId && <span className="badge fail" style={{ marginLeft: 8 }}>Línea con error</span>}
              </td>
              <td className="num">{formatDiagnosisValue(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ marginTop: 20 }}>Respuesta del candidato</h2>
      <p>
        Línea señalada: <strong>{detail.submittedLineId || '—'}</strong>{' '}
        <span className={`badge ${detail.lineCorrect ? 'pass' : 'fail'}`}>
          {detail.lineCorrect ? 'Correcto' : 'Incorrecto'}
        </span>
      </p>
      <p>
        Valor corregido propuesto: <strong>{detail.submittedValue ?? '—'}</strong>{' '}
        (correcto: {correctItem ? formatDiagnosisValue({ ...correctItem, value: detail.correctValue }) : detail.correctValue})
      </p>
    </div>
  );
}

function ScenarioDetail({ attempt }) {
  const detail = attempt.detail || {};
  const dimensions = detail.dimensions || [];
  return (
    <div className="card">
      <h2>Desglose de la conversación</h2>
      <div className="score-row">
        {dimensions.map((dim) => (
          <div className="score-tile" key={dim.key}>
            <div className="value">{dim.score}</div>
            <div className="label">{dim.label}</div>
          </div>
        ))}
      </div>
      <h2 style={{ marginTop: 20 }}>Transcripción</h2>
      <div className="chat">
        {(attempt.transcript || []).map((m, i) => (
          <div key={i} className={`bubble ${m.speaker}`}>
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenDetail({ attempt, campaign, onGraded }) {
  const perQuestion = attempt.detail?.perQuestion || [];
  const questions = campaign.challenge.questions || [];

  return (
    <div className="card">
      <h2>Respuestas</h2>
      {questions.map((q, i) => {
        const grading = perQuestion.find((p) => p.id === q.id);
        const answerText = attempt.submittedAnswer?.answers?.[q.id] || '(sin responder)';
        return (
          <OpenQuestionAnswer
            key={q.id}
            index={i}
            question={q}
            answerText={answerText}
            grading={grading}
            attemptId={attempt.id}
            onGraded={onGraded}
          />
        );
      })}
    </div>
  );
}

function OpenQuestionAnswer({ index, question, answerText, grading, attemptId, onGraded }) {
  const [score, setScore] = useState(grading?.manualScore ?? '');
  const [notes, setNotes] = useState(grading?.manualNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finalScore = grading?.manualScore ?? grading?.autoScore;

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      const updated = await api.gradeQuestion(attemptId, question.id, score, notes);
      onGraded(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
      <p style={{ marginBottom: 6 }}>
        <strong>
          {index + 1}. {question.text}
        </strong>{' '}
        <span className="badge pending">{CRITERION_LABEL[question.criterion] || question.criterion}</span>
      </p>
      <div className="link-box" style={{ whiteSpace: 'pre-wrap', marginBottom: 10 }}>
        {answerText}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {grading?.autoScore != null ? `Puntaje automático: ${grading.autoScore}` : 'Sin rúbrica automática'}
        </span>
        {finalScore != null && <span className="badge pass">Final: {finalScore}</span>}
      </div>

      <label htmlFor={`score-${question.id}`}>Calificación manual (0-100)</label>
      <input
        id={`score-${question.id}`}
        type="number"
        min={0}
        max={100}
        value={score}
        onChange={(e) => setScore(e.target.value)}
        style={{ maxWidth: 140 }}
      />
      <label htmlFor={`notes-${question.id}`}>Notas (opcional)</label>
      <textarea
        id={`notes-${question.id}`}
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Por qué le diste esta calificación..."
      />
      {error && <p className="error-text">{error}</p>}
      <button className="secondary" onClick={handleSave} disabled={saving || score === ''}>
        {saving ? 'Guardando...' : 'Guardar calificación'}
      </button>
    </div>
  );
}
