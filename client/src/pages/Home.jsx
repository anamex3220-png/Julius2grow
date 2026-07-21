import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Home() {
  const [skills, setSkills] = useState(null);

  useEffect(() => {
    api.getSkills().then((res) => setSkills(res.skills)).catch(() => setSkills([]));
  }, []);

  const grouped = groupByCategory(skills);

  return (
    <div>
      <h1>Contrata por lo que la gente sabe hacer, no por lo que escribe en un PDF.</h1>
      <p className="lede">
        El CV se puede inflar con IA en cinco minutos. En vez de leer perfiles, envía
        a cada candidato un reto real de 15 minutos en su celular — desde marketing
        (paid media, SEO, content, CRM, automation) hasta tecnología. La plataforma
        califica automáticamente y tú ves un ranking, no una pila de currículums.
      </p>

      {Object.entries(grouped).map(([categoryLabel, options]) => (
        <div key={categoryLabel} style={{ marginBottom: 16 }}>
          <p className="muted" style={{ margin: '0 0 8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {categoryLabel}
          </p>
          <div className="grid-3">
            {options.map((skill) => (
              <div className="card" key={skill.id}>
                <h2 style={{ fontSize: '1.05rem' }}>
                  {skill.icon} {skill.label}
                </h2>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {skill.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card">
        <h2>¿Cómo funciona?</h2>
        <ol className="muted">
          <li>Creas un reto para una posición y eliges el skill a evaluar del catálogo.</li>
          <li>Compartes el enlace con tus candidatos — lo abren en el celular, sin registro previo.</li>
          <li>Cada quien tiene 15 minutos. La calificación es automática y objetiva.</li>
          <li>Tú ves el ranking en tiempo real y entrevistas solo a quien ya demostró que sabe.</li>
        </ol>
        <Link to="/crear">
          <button>Crear mi primer reto</button>
        </Link>
      </div>
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
