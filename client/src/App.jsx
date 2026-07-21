import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import Results from './pages/Results.jsx';
import AttemptDetail from './pages/AttemptDetail.jsx';
import CandidateStart from './pages/CandidateStart.jsx';
import CandidateChallenge from './pages/CandidateChallenge.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Anti-Currículum
        </Link>
        <nav>
          <Link to="/crear">Crear reto</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crear" element={<CreateCampaign />} />
          <Route path="/resultados/:campaignId" element={<Results />} />
          <Route path="/resultados/:campaignId/intentos/:attemptId" element={<AttemptDetail />} />
          <Route path="/c/:campaignId" element={<CandidateStart />} />
          <Route path="/c/:campaignId/reto/:attemptId" element={<CandidateChallenge />} />
        </Routes>
      </main>
    </div>
  );
}
