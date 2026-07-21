import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const ROLE_OPTIONS = [
  { id: 'developer', label: '💻 Programador/a', desc: 'Arreglar un código roto contra pruebas ocultas.' },
  { id: 'support', label: '🎧 Atención al cliente', desc: 'Calmar y resolver el caso de un cliente furioso simulado.' },
  { id: 'accounting', label: '📊 Contabilidad', desc: 'Detectar el error en un balance general.' },
];

export default function CreateCampaign() {
  const [role, setRole] = useState('developer');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const campaign = await api.createCampaign({ role, title, company });
      setCreated(campaign);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    const candidateLink = `${window.location.origin}/c/${created.id}`;
    const resultsLink = `/resultados/${created.id}`;
    return (
      <div>
        <h1>Reto listo 🎉</h1>
        <p className="lede">
          Comparte este enlace con tus candidatos para <strong>{created.title}</strong>.
          Cada uno tiene {Math.round(created.timeLimitSeconds / 60)} minutos.
        </p>
        <div className="card">
          <label>Enlace para candidatos</label>
          <div className="link-box">{candidateLink}</div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button onClick={() => navigator.clipboard.writeText(candidateLink)}>Copiar enlace</button>
            <button className="secondary" onClick={() => navigate(resultsLink)}>
              Ver resultados
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Crea un reto de 15 minutos</h1>
      <p className="lede">Elige qué habilidad quieres evaluar. Nosotros generamos el reto y el enlace.</p>

      <form onSubmit={handleSubmit}>
        <label>Rol a evaluar</label>
        <div className="grid-3" style={{ marginBottom: 16 }}>
          {ROLE_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className={`card role-card ${role === opt.id ? 'selected' : ''}`}
              onClick={() => setRole(opt.id)}
            >
              <strong>{opt.label}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>
                {opt.desc}
              </p>
            </div>
          ))}
        </div>

        <label htmlFor="title">Título del puesto</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Backend Developer Jr."
          required
        />

        <label htmlFor="company">Empresa (opcional)</label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Ej. Julius"
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Generar reto y enlace'}
        </button>
      </form>
    </div>
  );
}
