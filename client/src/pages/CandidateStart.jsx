import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

export default function CandidateStart() {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const strict = searchParams.get('modo') === 'estricto';
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
      const attempt = await api.startAttempt(campaignId, {
        candidateName: name,
        candidateEmail: email,
        consent,
        integrityMode: strict ? 'strict' : 'signals',
      });
      navigate(`/c/${campaignId}/reto/${attempt.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (error && !campaign) return <p className="error-text">{error}</p>;
  if (!campaign) return <p className="muted">Loading...</p>;

  return (
    <div>
      <h1>{campaign.title}</h1>
      <p className="lede">
        {campaign.company ? `${campaign.company} · ` : ''}
        {campaign.skillLabelEn}
      </p>

      <div className="card">
        <h2>{campaign.challenge.title}</h2>
        <p className="muted">{campaign.challenge.prompt}</p>
        <p>
          ⏱ This challenge is designed to be solved quickly: you have{' '}
          <strong>{Math.round(campaign.timeLimitSeconds / 60)} minutes</strong> once you start.
          There's no second attempt, so get ready before clicking "Start".
        </p>
        {strict && (
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            🔒 This challenge will request fullscreen and will not allow pasting text into your answers.
          </p>
        )}
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

      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="name">Your name</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label htmlFor="email">Your email (optional)</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem' }}>Privacy notice</h2>
          <p className="muted" style={{ fontSize: '0.88rem' }}>
            Completing this challenge saves your name, email (if you provide one), your answers, your
            score, and a few technical signals from the session (for example, whether you pasted text or
            switched tabs). This information is for internal use by the recruiting team only — the tool
            does not show you your score or result.{' '}
            {campaign.contactEmail
              ? `If you'd like to request that your information be deleted, write to ${campaign.contactEmail}.`
              : "If you'd like to request that your information be deleted, contact whoever shared this link with you."}
          </p>
        </div>

        <label htmlFor="consent" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontWeight: 400 }}>
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span>I agree that my answers and data will be stored and shared with the recruiting team for evaluation purposes.</span>
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading || !consent}>
          {loading ? 'Getting ready...' : 'Start challenge'}
        </button>
      </form>
    </div>
  );
}
