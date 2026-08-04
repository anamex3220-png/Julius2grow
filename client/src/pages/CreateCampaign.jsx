import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import CustomChallengeForm from '../components/CustomChallengeForm.jsx';

export default function CreateCampaign() {
  const [mode, setMode] = useState('catalog'); // 'catalog' | 'custom'

  // Catálogo
  const [skills, setSkills] = useState(null);
  const [skillId, setSkillId] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getSkills()
      .then((res) => {
        setSkills(res.skills);
        if (res.skills.length > 0) setSkillId(res.skills[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleSubmitCatalog(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const campaign = await api.createCampaign({ skillId, title, company, contactEmail });
      setCreated(campaign);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitCustom(payload) {
    setError('');
    setLoading(true);
    try {
      const campaign = await api.createCustomCampaign(payload);
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

  const grouped = groupByCategory(skills);

  return (
    <div>
      <h1>Crea un reto</h1>
      <p className="lede">Elige una posición del catálogo, o arma tu propio reto desde cero.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button className={mode === 'catalog' ? '' : 'secondary'} onClick={() => setMode('catalog')} type="button">
          Elegir del catálogo
        </button>
        <button className={mode === 'custom' ? '' : 'secondary'} onClick={() => setMode('custom')} type="button">
          Crear el mío
        </button>
      </div>

      {mode === 'catalog' ? (
        <form onSubmit={handleSubmitCatalog}>
          <label>Skill a evaluar</label>
          {!skills ? (
            <p className="muted">Cargando catálogo de skills...</p>
          ) : (
            Object.entries(grouped).map(([categoryLabel, options]) => (
              <div key={categoryLabel} style={{ marginBottom: 16 }}>
                <p className="muted" style={{ margin: '0 0 8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {categoryLabel}
                </p>
                <div className="grid-3">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`card role-card ${skillId === opt.id ? 'selected' : ''}`}
                      onClick={() => setSkillId(opt.id)}
                    >
                      <strong>
                        {opt.icon} {opt.label}
                      </strong>
                      <p className="muted" style={{ marginBottom: 0 }}>
                        {opt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <label htmlFor="title">Título del puesto</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Backend Developer Jr." required />

          <label htmlFor="company">Empresa (opcional)</label>
          <input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ej. Julius" />

          <label htmlFor="contact-email">Correo de contacto para candidatos (opcional)</label>
          <input
            id="contact-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Se muestra en el aviso de privacidad, para pedir borrado de datos"
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading || !skillId}>
            {loading ? 'Creando...' : 'Generar reto y enlace'}
          </button>
        </form>
      ) : (
        <CustomChallengeForm submitLabel="Generar reto y enlace" onSubmit={handleSubmitCustom} loading={loading} error={error} />
      )}
    </div>
  );
}

function groupByCategory(skills) {
  if (!skills) return {};
  return skills.reduce((acc, skill) => {
    (acc[skill.categoryLabel] = acc[skill.categoryLabel] || []).push(skill);
    return acc;
  }, {});
}
