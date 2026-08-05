import { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import MyChallenges from './pages/MyChallenges.jsx';
import EditCampaign from './pages/EditCampaign.jsx';
import Results from './pages/Results.jsx';
import AttemptDetail from './pages/AttemptDetail.jsx';
import CandidateStart from './pages/CandidateStart.jsx';
import CandidateChallenge from './pages/CandidateChallenge.jsx';
import Login from './pages/Login.jsx';
import RequireAuth from './RequireAuth.jsx';
import { useAuth } from './auth.jsx';

// El link del candidato (/c/:campaignId y todo lo que cuelga de ahí) está
// 100% en inglés; el resto de la herramienta (administración) está en
// español. Refleja eso en el atributo lang del documento para lectores de
// pantalla, ya que es un solo index.html para toda la SPA.
function useDocumentLang() {
  const location = useLocation();
  useEffect(() => {
    document.documentElement.lang = location.pathname.startsWith('/c/') ? 'en' : 'es';
  }, [location.pathname]);
}

export default function App() {
  const { token, logout } = useAuth();
  useDocumentLang();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <img src="/logo-julius.png" alt="Julius" className="brand-logo" />
          Retos - Julius
        </Link>
        <nav>
          {token ? (
            <>
              <Link to="/mis-retos">Mis retos</Link>
              <Link to="/crear">Crear reto</Link>
              <button type="button" className="secondary" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/login">Recruiter access</Link>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/crear"
            element={
              <RequireAuth>
                <CreateCampaign />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-retos"
            element={
              <RequireAuth>
                <MyChallenges />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-retos/:campaignId/editar"
            element={
              <RequireAuth>
                <EditCampaign />
              </RequireAuth>
            }
          />
          <Route
            path="/resultados/:campaignId"
            element={
              <RequireAuth>
                <Results />
              </RequireAuth>
            }
          />
          <Route
            path="/resultados/:campaignId/intentos/:attemptId"
            element={
              <RequireAuth>
                <AttemptDetail />
              </RequireAuth>
            }
          />
          <Route path="/c/:campaignId" element={<CandidateStart />} />
          <Route path="/c/:campaignId/reto/:attemptId" element={<CandidateChallenge />} />
        </Routes>
      </main>
    </div>
  );
}
