// Cada reto tiene dos enlaces de candidato que llevan al mismo reto y al
// mismo concentrado de resultados — solo cambia el modo Anti-IA que activan
// (?modo=estricto | ?modo=senales), decidido por el reclutador según si el
// candidato responde supervisado o desde su casa.
export default function CandidateLinks({ campaignId }) {
  const base = `${window.location.origin}/c/${campaignId}`;
  const strictLink = `${base}?modo=estricto`;
  const signalsLink = `${base}?modo=senales`;

  return (
    <div className="card">
      <label style={{ marginBottom: 4 }}>🔒 Enlace con bloqueo total</label>
      <p className="muted" style={{ marginTop: -8, fontSize: '0.82rem' }}>
        Bloquea pegar texto y pide pantalla completa. Recomendado si el candidato responde solo, sin
        supervisión (por ejemplo desde su casa).
      </p>
      <div className="link-box">{strictLink}</div>
      <button style={{ marginTop: 10, marginBottom: 20 }} onClick={() => navigator.clipboard.writeText(strictLink)}>
        Copiar enlace con bloqueo
      </button>

      <label style={{ marginBottom: 4 }}>👀 Enlace solo con señales</label>
      <p className="muted" style={{ marginTop: -8, fontSize: '0.82rem' }}>
        No bloquea nada, solo registra señales (pegar texto, cambios de pestaña). Recomendado si ya
        supervisas al candidato o prefieres no restringir su navegador.
      </p>
      <div className="link-box">{signalsLink}</div>
      <button className="secondary" onClick={() => navigator.clipboard.writeText(signalsLink)}>
        Copiar enlace con señales
      </button>
    </div>
  );
}
