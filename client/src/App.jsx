import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import MyChallenges from './pages/MyChallenges.jsx';
import EditCampaign from './pages/EditCampaign.jsx';
import Results from './pages/Results.jsx';
import AttemptDetail from './pages/AttemptDetail.jsx';
import CandidateStart from './pages/CandidateStart.jsx';
import CandidateChallenge from './pages/CandidateChallenge.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <img src="/logo-julius.png" alt="Julius" className="brand-logo" />
          Retos - Julius
        </Link>
        <nav>
          <Link to="/mis-retos">Mis retos</Link>
          <Link to="/crear">Crear reto</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crear" element={<CreateCampaign />} />
          <Route path="/mis-retos" element={<MyChallenges />} />
          <Route path="/mis-retos/:campaignId/editar" element={<EditCampaign />} />
          <Route path="/resultados/:campaignId" element={<Results />} />
          <Route path="/resultados/:campaignId/intentos/:attemptId" element={<AttemptDetail />} />
          <Route path="/c/:campaignId" element={<CandidateStart />} />
          <Route path="/c/:campaignId/reto/:attemptId" element={<CandidateChallenge />} />
        </Routes>
      </main>
    </div>
  );
}
