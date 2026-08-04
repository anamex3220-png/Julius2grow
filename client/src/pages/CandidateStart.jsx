import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function CandidateStart() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCampaign(campaignId).catch((err) => setError(err.message)).then((c) => c && setCampaign(c));
  }, [campaignId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const attempt = await api.startAttempt(campaignId, { candidateName: name, candidateEmail: email, consent });
      navigate(`/c/${campaignId}/reto/${attempt.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (error && !campaign) return <p className="error-text">{error}</p>;
  if (!campaign) return <p className="muted">Cargando...</p>;

  return (
    <div>
      <h1>{campaign.title}</h1>
      <p className="lede">
        {campaign.company ? `${campaign.company} · ` : ''}
        {campaign.skillLabel}
      </p>

      <div className="card">
        <h2>{campaign.challenge.title}</h2>
        <p className="muted">{campaign.challenge.prompt}</p>
        <p>
          ⏱ Este reto está diseñado para resolverse rápido: tienes{' '}
          <strong>{Math.round(campaign.timeLimitSeconds / 60)} minutos</strong> desde que empieces.
          No hay segunda oportunidad, así que prepárate antes de dar clic en "Empezar".
        </p>
      </div>

      <div className="card" style={{ borderColor: 'var(--warn)' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700 }}>⚠️ Important Notice: Honest &amp; Independent Assessment</p>
        <p className="muted" style={{ fontSize: '0.88rem', margin: '0 0 8px' }}>
          To ensure a fair process and accurately evaluate your real skills, please complete this exercise
          independently. Our system includes detection mechanisms to identify the use of artificial
          intelligence or other external resources.
        </p>
        <p className="muted" style={{ fontSize: '0.88rem', margin: 0 }}>
          Using these tools compromises the integrity of the test and will automatically invalidate your
          application. Show us your real talent!
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem' }}>Aviso de privacidad</h2>
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          Al resolver este reto se guardan tu nombre, correo (si lo dejas), tus respuestas, tu puntaje, y
          algunas señales técnicas de la sesión (por ejemplo si pegaste texto o cambiaste de pestaña).
          Esta información la usa el equipo de reclutamiento únicamente para evaluar tu desempeño en este
          proceso.{' '}
          {campaign.contactEmail
            ? `Si quieres pedir que se elimine tu información, escribe a ${campaign.contactEmail}.`
            : 'Si quieres pedir que se elimine tu información, contacta a quien te compartió este enlace.'}
        </p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="name">Tu nombre</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label htmlFor="email">Tu correo (opcional)</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="consent" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontWeight: 400 }}>
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span>Acepto que mis respuestas y datos se guarden y se compartan con el equipo de reclutamiento para fines de evaluación.</span>
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading || !consent}>
          {loading ? 'Preparando...' : 'Empezar reto'}
        </button>
      </form>
    </div>
  );
}
