import { useState } from 'react';
import { api } from '../api.js';

export default function ScenarioChallenge({ attemptId, challenge, onSubmit, submitting }) {
  const [transcript, setTranscript] = useState([{ speaker: 'customer', text: challenge.opening }]);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await api.sendScenarioReply(attemptId, message.trim());
      setTranscript(res.transcript);
      setMessage('');
      if (res.done) setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card">
      <h2>{challenge.title}</h2>
      <p className="muted">{challenge.prompt}</p>

      <div className="chat">
        {transcript.map((m, i) => (
          <div key={i} className={`bubble ${m.speaker}`}>
            {m.text}
          </div>
        ))}
      </div>

      {!done ? (
        <>
          <label htmlFor="reply">Tu respuesta</label>
          <textarea
            id="reply"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu respuesta al cliente..."
          />
          {error && <p className="error-text">{error}</p>}
          <button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? 'Enviando...' : 'Responder'}
          </button>
        </>
      ) : (
        <>
          <p className="muted">La conversación terminó. Envía tu reto para calificarlo.</p>
          <button onClick={() => onSubmit({})} disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar y calificar'}
          </button>
        </>
      )}
    </div>
  );
}
