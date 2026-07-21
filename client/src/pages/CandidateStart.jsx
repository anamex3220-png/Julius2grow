import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function CandidateStart() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
      const attempt = await api.startAttempt(campaignId, { candidateName: name, candidateEmail: email });
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

      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="name">Tu nombre</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label htmlFor="email">Tu correo (opcional)</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Preparando...' : 'Empezar reto'}
        </button>
      </form>
    </div>
  );
}
