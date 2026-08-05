import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import CustomChallengeForm from '../components/CustomChallengeForm.jsx';
import CandidateLinks from '../components/CandidateLinks.jsx';

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
    const resultsLink = `/resultados/${created.id}`;
    return (
      <div>
        <h1>Reto listo 🎉</h1>
        <p className="lede">
          Comparte uno de estos enlaces con tus candidatos para <strong>{created.title}</strong>. Ambos
          llevan al mismo reto y al mismo concentrado de candidatos — cada uno tiene{' '}
          {Math.round(created.timeLimitSeconds / 60)} minutos.
        </p>
        <CandidateLinks campaignId={created.id} />
        <button className="secondary" onClick={() => navigate(resultsLink)}>
          Ver resultados
        </button>
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
          <label htmlFor="skill-select">Skill a evaluar, por categoría</label>
          {!skills ? (
            <p className="muted">Cargando catálogo de skills...</p>
          ) : (
            <select id="skill-select" value={skillId} onChange={(e) => setSkillId(e.target.value)}>
              {Object.entries(grouped).map(([categoryLabel, options]) => (
                <optgroup key={categoryLabel} label={categoryLabel}>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
          {skillId && skills && (
            <p className="muted" style={{ marginTop: -10, marginBottom: 16, fontSize: '0.88rem' }}>
              {skills.find((s) => s.id === skillId)?.description}
            </p>
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
