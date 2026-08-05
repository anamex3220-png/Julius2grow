import { useEffect, useState } from 'react';
import { useIntegrity } from '../integrity.js';

const CRITERION_LABEL = {
  integral: 'Technical + logic + soft skill',
  logica: 'Applied logic',
  conocimiento: 'Applied knowledge',
  soft_skill: 'Soft skill',
};

export default function OpenChallenge({ challenge, integrityMode, onSubmit, submitting }) {
  const strict = integrityMode === 'strict';
  const integrity = useIntegrity(strict);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (strict) integrity.requestFullscreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strict]);

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit() {
    const totalChars = Object.values(answers).reduce((sum, v) => sum + (v?.length || 0), 0);
    onSubmit({ answers }, integrity.getSignals(totalChars));
  }

  const answeredCount = challenge.questions.filter((q) => (answers[q.id] || '').trim().length > 0).length;

  return (
    <div className="card">
      {challenge.prompt && <p className="muted">{challenge.prompt}</p>}
      {strict && (
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          🔒 Strict mode active: pasting text is disabled and fullscreen was requested.
        </p>
      )}

      {challenge.image && (
        <img
          src={challenge.image.dataUrl}
          alt={challenge.image.alt || 'Challenge context'}
          style={{ maxWidth: '100%', borderRadius: 8, margin: '12px 0', display: 'block' }}
        />
      )}

      {challenge.table && (
        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          {challenge.table.caption && <p className="muted" style={{ marginBottom: 6 }}>{challenge.table.caption}</p>}
          <table>
            <thead>
              <tr>
                {challenge.table.columns.map((col, i) => (
                  <th key={i}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {challenge.table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {challenge.questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 20 }}>
          <label htmlFor={q.id}>
            {i + 1}. {q.text}{' '}
            <span className="badge pending" style={{ marginLeft: 6 }}>
              {CRITERION_LABEL[q.criterion] || q.criterion}
            </span>
          </label>
          <textarea
            id={q.id}
            ref={integrity.attachTextarea}
            rows={5}
            value={answers[q.id] || ''}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            placeholder="Write your answer..."
          />
        </div>
      ))}

      <button onClick={handleSubmit} disabled={submitting || answeredCount === 0}>
        {submitting ? 'Submitting...' : 'Submit for grading'}
      </button>
    </div>
  );
}
