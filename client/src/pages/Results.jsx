import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import CandidateLinks from '../components/CandidateLinks.jsx';

const MODE_LABEL = {
  strict: { text: '🔒 Bloqueo', cls: 'pending' },
  signals: { text: '👀 Señales', cls: 'pending' },
};

const STATUS_LABEL = {
  in_progress: { text: 'En curso', cls: 'pending' },
  submitted: { text: 'Enviado', cls: 'pass' },
  timeout: { text: 'Tiempo agotado', cls: 'fail' },
};

function hasIntegrityFlags(integrity) {
  if (!integrity) return false;
  return integrity.pasteCount > 0 || integrity.tabSwitchCount > 0 || integrity.fullscreenExits > 0 || integrity.suspiciousInputRatio;
}

export default function Results() {
  const { campaignId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.getResults(campaignId);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [campaignId]);

  if (error) return <p className="error-text">{error}</p>;
  if (!data) return <p className="muted">Cargando resultados...</p>;

  const { campaign, attempts } = data;

  return (
    <div>
      <h1>{campaign.title}</h1>
      <p className="lede">
        {campaign.categoryLabel} · {campaign.skillLabel} {campaign.company ? `· ${campaign.company}` : ''}
      </p>

      <CandidateLinks campaignId={campaign.id} />

      <div className="card">
        <h2>Ranking ({attempts.length} candidatos)</h2>
        {attempts.length === 0 ? (
          <p className="muted">Nadie ha tomado el reto todavía. Comparte alguno de los enlaces de arriba.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Candidato</th>
                <th>Puntaje</th>
                <th>Estado</th>
                <th>Modo</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, idx) => {
                const pending = a.status === 'submitted' && a.challengeType === 'open' && a.detail?.pendingReview;
                const status = pending ? { text: 'Pendiente de revisión', cls: 'pending' } : STATUS_LABEL[a.status] || STATUS_LABEL.in_progress;
                const mode = MODE_LABEL[a.integrityMode] || MODE_LABEL.signals;
                return (
                  <tr
                    key={a.id}
                    className="clickable"
                    onClick={() => navigate(`/resultados/${campaignId}/intentos/${a.id}`)}
                  >
                    <td>{idx + 1}</td>
                    <td>
                      {a.candidateName} {hasIntegrityFlags(a.integrity) && <span title="Tiene señales de integridad">⚠️</span>}
                      <div className="muted" style={{ fontSize: '0.8rem' }}>{a.candidateEmail}</div>
                    </td>
                    <td>{a.score ?? '—'}</td>
                    <td>
                      <span className={`badge ${status.cls}`}>{status.text}</span>
                    </td>
                    <td>
                      <span className={`badge ${mode.cls}`}>{mode.text}</span>
                    </td>
                    <td>{a.durationSeconds != null ? formatDuration(a.durationSeconds) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Link to="/crear" className="muted">
        + Crear otro reto
      </Link>
    </div>
  );
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
