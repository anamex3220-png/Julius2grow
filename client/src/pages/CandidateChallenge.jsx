import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import Timer from '../components/Timer.jsx';
import CodeChallenge from '../components/CodeChallenge.jsx';
import ScenarioChallenge from '../components/ScenarioChallenge.jsx';
import DiagnosisChallenge from '../components/DiagnosisChallenge.jsx';
import OpenChallenge from '../components/OpenChallenge.jsx';

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
    async (answer, integrity) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const updated = await api.submitAttempt(attemptId, answer, integrity);
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
  if (!attempt || !campaign) return <p className="muted">Loading...</p>;

  if (result) {
    return (
      <div className="card">
        <h1>{result.status === 'timeout' ? 'Time\'s up' : 'Challenge submitted! 🎉'}</h1>
        <p className="lede" style={{ marginBottom: 0 }}>
          Thanks for your time, {result.candidateName}. Your answer has been recorded and the recruiting
          team will review it. They'll reach out to you with next steps.
        </p>
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
          integrityMode={attempt.integrityMode}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
      {campaign.challenge.type === 'open' && (
        <OpenChallenge
          challenge={campaign.challenge}
          integrityMode={attempt.integrityMode}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
