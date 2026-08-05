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
      <h1>Crea Retos AI para talento 🚀</h1>
      <p className="lede">
        El objetivo es simple: evaluar al talento mediante la aplicación de retos en vivo,
        no de currículums. Eliges una posición del catálogo o armas la tuya, se la
        compartes a cada candidato, y la plataforma la califica automáticamente — desde
        marketing (paid media, SEO, content, CRM, automation) hasta tecnología y operaciones.
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
          <li>Creas un reto para una posición: del catálogo, o armando el tuyo desde cero.</li>
          <li>Compartes el enlace con tus candidatos — lo abren en el celular, sin registro previo.</li>
          <li>Cada reto está diseñado para resolverse rápido. La calificación es automática y objetiva.</li>
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
