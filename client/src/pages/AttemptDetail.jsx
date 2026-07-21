import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

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

  return (
    <div>
      <Link to={`/resultados/${campaignId}`} className="muted">
        ← Volver al ranking
      </Link>
      <h1 style={{ marginTop: 12 }}>{attempt.candidateName}</h1>
      <p className="lede">
        {attempt.candidateEmail} · {campaign.roleLabel} · {attempt.status}
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
          <div className="value">{attempt.passed === null ? '—' : attempt.passed ? 'Sí' : 'No'}</div>
          <div className="label">Aprobó</div>
        </div>
      </div>

      {attempt.role === 'developer' && <DeveloperDetail attempt={attempt} />}
      {attempt.role === 'accounting' && <AccountingDetail attempt={attempt} campaign={campaign} />}
      {attempt.role === 'support' && <SupportDetail attempt={attempt} />}
    </div>
  );
}

function DeveloperDetail({ attempt }) {
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

function AccountingDetail({ attempt, campaign }) {
  const detail = attempt.detail || {};
  const lineItems = campaign.challenge.lineItems || [];
  return (
    <div className="card">
      <h2>Balance evaluado</h2>
      <table className="balance-table">
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id} className={item.isTotal ? 'total' : ''}>
              <td>
                {item.label}
                {item.id === detail.correctLineId && <span className="badge fail" style={{ marginLeft: 8 }}>Línea con error</span>}
              </td>
              <td className="num">${item.value.toLocaleString()}</td>
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
        (correcto: {detail.correctValue?.toLocaleString()})
      </p>
    </div>
  );
}

function SupportDetail({ attempt }) {
  const detail = attempt.detail || {};
  return (
    <div className="card">
      <h2>Desglose de la conversación</h2>
      <div className="score-row">
        <div className="score-tile">
          <div className="value">{detail.empathy ?? '—'}</div>
          <div className="label">Empatía</div>
        </div>
        <div className="score-tile">
          <div className="value">{detail.resolution ?? '—'}</div>
          <div className="label">Resolución</div>
        </div>
        <div className="score-tile">
          <div className="value">{detail.professionalism ?? '—'}</div>
          <div className="label">Profesionalismo</div>
        </div>
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
