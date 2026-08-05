import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import CustomChallengeForm from '../components/CustomChallengeForm.jsx';

export default function EditCampaign() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCampaignForEdit(campaignId).then(setCampaign).catch((err) => setError(err.message));
  }, [campaignId]);

  async function handleSubmitCustom(payload) {
    setError('');
    setLoading(true);
    try {
      await api.updateCampaign(campaignId, payload);
      navigate(`/resultados/${campaignId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (error && !campaign) return <p className="error-text">{error}</p>;
  if (!campaign) return <p className="muted">Cargando...</p>;

  return (
    <div>
      <Link to="/mis-retos" className="muted">
        ← Volver a mis retos
      </Link>
      <h1 style={{ marginTop: 12 }}>Editar reto</h1>

      {campaign.challenge.type === 'open' ? (
        <CustomChallengeForm
          initialValues={{
            title: campaign.title,
            company: campaign.company,
            contactEmail: campaign.contactEmail,
            minutes: Math.round(campaign.timeLimitSeconds / 60),
            prompt: campaign.challenge.prompt,
            image: campaign.challenge.image,
            table: campaign.challenge.table,
            questions: campaign.challenge.questions.map((q) => ({
              text: q.text,
              criterion: q.criterion,
              keywords: q.keywords || '',
            })),
          }}
          submitLabel="Guardar cambios"
          onSubmit={handleSubmitCustom}
          loading={loading}
          error={error}
        />
      ) : (
        <MetadataOnlyForm campaign={campaign} onSaved={() => navigate(`/resultados/${campaignId}`)} />
      )}
    </div>
  );
}

function MetadataOnlyForm({ campaign, onSaved }) {
  const [title, setTitle] = useState(campaign.title);
  const [company, setCompany] = useState(campaign.company);
  const [contactEmail, setContactEmail] = useState(campaign.contactEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.updateCampaign(campaign.id, { title, company, contactEmail });
      onSaved();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        Este reto usa el skill <strong>{campaign.skillLabel}</strong> del catálogo — su contenido no se puede
        editar aquí, solo los datos del puesto.
      </p>

      <label htmlFor="e-title">Título del puesto</label>
      <input id="e-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label htmlFor="e-company">Empresa (opcional)</label>
      <input id="e-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />

      <label htmlFor="e-contact-email">Correo de contacto para candidatos (opcional)</label>
      <input id="e-contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />

      {error && <p className="error-text">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
