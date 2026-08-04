import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function MyChallenges() {
  const [campaigns, setCampaigns] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  function load() {
    api
      .getCampaigns()
      .then((res) => setCampaigns(res.campaigns))
      .catch((err) => setError(err.message));
  }

  async function handleDelete(campaign) {
    const confirmed = window.confirm(
      `Esto borra permanentemente el reto "${campaign.title}" y las respuestas de sus ${campaign.attemptCount} candidato(s). ¿Confirmas que quieres eliminarlo?`
    );
    if (!confirmed) return;
    try {
      await api.deleteCampaign(campaign.id);
      setCampaigns((cs) => cs.filter((c) => c.id !== campaign.id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !campaigns) return <p className="error-text">{error}</p>;
  if (!campaigns) return <p className="muted">Cargando...</p>;

  return (
    <div>
      <h1>Mis retos</h1>
      <p className="lede">Todos los retos que has creado, con cuántos candidatos han respondido cada uno.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        {campaigns.length === 0 ? (
          <p className="muted">Todavía no has creado ningún reto.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Skill / Tipo</th>
                <th>Empresa</th>
                <th>Candidatos</th>
                <th>Creado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td style={{ cursor: 'pointer' }} onClick={() => navigate(`/resultados/${c.id}`)}>
                    {c.title}
                  </td>
                  <td>{c.skillLabel}</td>
                  <td>{c.company || '—'}</td>
                  <td>{c.attemptCount}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/resultados/${c.id}`} className="muted">
                        Ver
                      </Link>
                      <Link to={`/mis-retos/${c.id}/editar`} className="muted">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="error-text"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                        onClick={() => handleDelete(c)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Link to="/crear" className="muted">
        + Crear otro reto
      </Link>
    </div>
  );
}
