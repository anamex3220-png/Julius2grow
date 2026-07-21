import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Contrata por lo que la gente sabe hacer, no por lo que escribe en un PDF.</h1>
      <p className="lede">
        El CV se puede inflar con IA en cinco minutos. En vez de leer perfiles, envía
        a cada candidato un reto real de 15 minutos en su celular. La plataforma
        califica automáticamente y tú ves un ranking, no una pila de currículums.
      </p>

      <div className="grid-3">
        <div className="card">
          <h2>💻 Programador/a</h2>
          <p className="muted">Arregla un código roto. Se corre contra pruebas ocultas y se califica solo.</p>
        </div>
        <div className="card">
          <h2>🎧 Atención al cliente</h2>
          <p className="muted">Responde a un cliente furioso simulado. Se mide empatía, resolución y tono.</p>
        </div>
        <div className="card">
          <h2>📊 Contabilidad</h2>
          <p className="muted">Encuentra el error en un balance general y corrige la cifra.</p>
        </div>
      </div>

      <div className="card">
        <h2>¿Cómo funciona?</h2>
        <ol className="muted">
          <li>Creas un reto para un puesto (elige rol: developer, soporte o contabilidad).</li>
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
