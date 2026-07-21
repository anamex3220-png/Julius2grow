import { useState } from 'react';

export default function CodeChallenge({ challenge, onSubmit, submitting }) {
  const [code, setCode] = useState(challenge.starterCode);

  return (
    <div className="card">
      <h2>{challenge.title}</h2>
      <p className="muted">{challenge.prompt}</p>
      <label htmlFor="code">Tu código</label>
      <textarea
        id="code"
        className="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <button onClick={() => onSubmit({ code })} disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar y calificar'}
      </button>
    </div>
  );
}
