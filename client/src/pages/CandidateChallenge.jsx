import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import Timer from '../components/Timer.jsx';
import CodeChallenge from '../components/CodeChallenge.jsx';
import ScenarioChallenge from '../components/ScenarioChallenge.jsx';
import DiagnosisChallenge from '../components/DiagnosisChallenge.jsx';

export default function CandidateChallenge() {
  const { campaignId, attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    Promise.all([api.getAttempt(attemptId), api.getCampaign(campaignId)])
      .then(([a, c]) => {
        setAttempt(a);
        setCampaign(c);
        if (a.status !== 'in_progress') {
          submittedRef.current = true;
          setResult(a);
        }
      })
      .catch((err) => setError(err.message));
  }, [attemptId, campaignId]);

  const handleSubmit = useCallback(
    async (answer) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const updated = await api.submitAttempt(attemptId, answer);
        setResult(updated);
      } catch (err) {
        setError(err.message);
        submittedRef.current = false;
      } finally {
        setSubmitting(false);
      }
    },
    [attemptId]
  );

  const handleExpire = useCallback(() => {
    handleSubmit({});
  }, [handleSubmit]);

  if (error) return <p className="error-text">{error}</p>;
  if (!attempt || !campaign) return <p className="muted">Cargando...</p>;

  if (result) {
    return (
      <div>
        <h1>{result.status === 'timeout' ? 'Se acabó el tiempo' : '¡Reto enviado!'}</h1>
        <div className="score-row">
          <div className="score-tile">
            <div className="value">{result.score ?? 0}</div>
            <div className="label">Puntaje</div>
          </div>
          <div className="score-tile">
            <div className="value">{result.passed ? 'Sí' : 'No'}</div>
            <div className="label">Aprobó</div>
          </div>
        </div>
        <p className="muted">Gracias por tu tiempo. El equipo de reclutamiento revisará tu resultado.</p>
      </div>
    );
  }

  return (
    <div>
      <Timer startedAt={attempt.startedAt} timeLimitSeconds={attempt.timeLimitSeconds} onExpire={handleExpire} />
      {campaign.challenge.type === 'code' && (
        <CodeChallenge challenge={campaign.challenge} onSubmit={handleSubmit} submitting={submitting} />
      )}
      {campaign.challenge.type === 'diagnosis' && (
        <DiagnosisChallenge challenge={campaign.challenge} onSubmit={handleSubmit} submitting={submitting} />
      )}
      {campaign.challenge.type === 'scenario' && (
        <ScenarioChallenge
          attemptId={attemptId}
          challenge={campaign.challenge}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
