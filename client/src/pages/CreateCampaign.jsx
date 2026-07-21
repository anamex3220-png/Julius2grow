import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import TableEditor from '../components/TableEditor.jsx';
import ImageUploadField from '../components/ImageUploadField.jsx';
import QuestionBankPicker from '../components/QuestionBankPicker.jsx';

const CRITERION_OPTIONS = [
  { id: 'integral', label: 'Técnica + lógica + soft skill (recomendado)' },
  { id: 'logica', label: 'Lógica aplicada al puesto' },
  { id: 'conocimiento', label: 'Conocimiento aplicado' },
  { id: 'soft_skill', label: 'Soft skill' },
];

const EMPTY_QUESTION = { text: '', criterion: 'integral', keywords: '' };

export default function CreateCampaign() {
  const [mode, setMode] = useState('catalog'); // 'catalog' | 'custom'

  // Catálogo
  const [skills, setSkills] = useState(null);
  const [skillId, setSkillId] = useState('');

  // Compartidos
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');

  // Constructor personalizado
  const [minutes, setMinutes] = useState(20);
  const [integrityMode, setIntegrityMode] = useState('signals');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [useTable, setUseTable] = useState(false);
  const [table, setTable] = useState(null);
  const [questions, setQuestions] = useState([{ ...EMPTY_QUESTION }]);

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

  function updateQuestion(i, patch) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function addQuestion() {
    setQuestions((qs) => [...qs, { ...EMPTY_QUESTION }]);
  }
  function removeQuestion(i) {
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  }
  function addFromBank(bankQuestion) {
    setQuestions((qs) => [
      ...qs,
      {
        text: bankQuestion.text,
        criterion: bankQuestion.criterion,
        keywords: (bankQuestion.suggestedKeywords || []).join(', '),
      },
    ]);
  }

  async function handleSubmitCatalog(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const campaign = await api.createCampaign({ skillId, title, company });
      setCreated(campaign);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitCustom(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const campaign = await api.createCustomCampaign({
        title,
        company,
        timeLimitMinutes: minutes,
        integrityMode,
        challenge: {
          prompt,
          image,
          table: useTable ? table : null,
          questions: questions.map((q) => ({ text: q.text, criterion: q.criterion, keywords: q.keywords })),
        },
      });
      setCreated(campaign);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    const candidateLink = `${window.location.origin}/c/${created.id}`;
    const resultsLink = `/resultados/${created.id}`;
    return (
      <div>
        <h1>Reto listo 🎉</h1>
        <p className="lede">
          Comparte este enlace con tus candidatos para <strong>{created.title}</strong>.
          Cada uno tiene {Math.round(created.timeLimitSeconds / 60)} minutos.
        </p>
        <div className="card">
          <label>Enlace para candidatos</label>
          <div className="link-box">{candidateLink}</div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button onClick={() => navigator.clipboard.writeText(candidateLink)}>Copiar enlace</button>
            <button className="secondary" onClick={() => navigate(resultsLink)}>
              Ver resultados
            </button>
          </div>
        </div>
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
          <label>Skill a evaluar</label>
          {!skills ? (
            <p className="muted">Cargando catálogo de skills...</p>
          ) : (
            Object.entries(grouped).map(([categoryLabel, options]) => (
              <div key={categoryLabel} style={{ marginBottom: 16 }}>
                <p className="muted" style={{ margin: '0 0 8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {categoryLabel}
                </p>
                <div className="grid-3">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`card role-card ${skillId === opt.id ? 'selected' : ''}`}
                      onClick={() => setSkillId(opt.id)}
                    >
                      <strong>
                        {opt.icon} {opt.label}
                      </strong>
                      <p className="muted" style={{ marginBottom: 0 }}>
                        {opt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <label htmlFor="title">Título del puesto</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Backend Developer Jr." required />

          <label htmlFor="company">Empresa (opcional)</label>
          <input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ej. Julius" />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading || !skillId}>
            {loading ? 'Creando...' : 'Generar reto y enlace'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmitCustom}>
          <label htmlFor="c-title">Título del puesto</label>
          <input id="c-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Media Buyer Senior" required />

          <label htmlFor="c-company">Empresa (opcional)</label>
          <input id="c-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ej. Julius" />

          <label htmlFor="c-minutes">Minutos para responder</label>
          <input
            id="c-minutes"
            type="number"
            min={5}
            max={60}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />

          <label htmlFor="c-integrity">Anti-IA</label>
          <select id="c-integrity" value={integrityMode} onChange={(e) => setIntegrityMode(e.target.value)}>
            <option value="signals">Solo señales — avisa, no bloquea (recomendado)</option>
            <option value="strict">Estricto — bloquea pegar texto y pide pantalla completa</option>
          </select>
          <p className="muted" style={{ marginTop: -10, marginBottom: 16, fontSize: '0.82rem' }}>
            {integrityMode === 'strict'
              ? 'El candidato no podrá pegar texto en sus respuestas y se le pedirá pantalla completa. Sigue sin ser infalible (puede usar otro dispositivo), pero pone más fricción.'
              : 'Se detectan pegar texto, cambios de pestaña y patrones de escritura poco humanos, y se muestran como avisos junto al puntaje — sin bloquear nada.'}
          </p>

          <label htmlFor="c-prompt">Contexto general (opcional)</label>
          <textarea
            id="c-prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej. Manejas la cuenta de una marca de skincare con $15,000/mes en Meta Ads..."
          />

          <label>Imagen de referencia (opcional)</label>
          <div style={{ marginBottom: 16 }}>
            <ImageUploadField value={image} onChange={setImage} />
          </div>

          <label>
            <input type="checkbox" checked={useTable} onChange={(e) => setUseTable(e.target.checked)} style={{ marginRight: 8 }} />
            Agregar una tabla de datos
          </label>
          {useTable && (
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <TableEditor value={table} onChange={setTable} />
            </div>
          )}

          <label style={{ marginTop: 8 }}>Preguntas</label>
          {questions.map((q, i) => (
            <div className="card" key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <label htmlFor={`q-text-${i}`} style={{ margin: 0 }}>
                  Pregunta {i + 1}
                </label>
                {questions.length > 1 && (
                  <button type="button" className="secondary" style={{ padding: '2px 10px', fontSize: '0.75rem' }} onClick={() => removeQuestion(i)}>
                    Quitar
                  </button>
                )}
              </div>
              <textarea
                id={`q-text-${i}`}
                rows={3}
                value={q.text}
                onChange={(e) => updateQuestion(i, { text: e.target.value })}
                placeholder="Escribe una pregunta elaborada, situacional — no de opción múltiple."
              />
              <label htmlFor={`q-criterion-${i}`}>Mide</label>
              <select id={`q-criterion-${i}`} value={q.criterion} onChange={(e) => updateQuestion(i, { criterion: e.target.value })}>
                {CRITERION_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <label htmlFor={`q-keywords-${i}`}>Palabras clave esperadas (opcional, separadas por coma)</label>
              <input
                id={`q-keywords-${i}`}
                type="text"
                value={q.keywords}
                onChange={(e) => updateQuestion(i, { keywords: e.target.value })}
                placeholder="Si las dejas vacías, tú calificas la respuesta a mano."
              />
            </div>
          ))}

          <div style={{ marginBottom: 12 }}>
            <button type="button" className="secondary" onClick={addQuestion}>
              + Agregar pregunta
            </button>
          </div>
          <div style={{ marginBottom: 20 }}>
            <QuestionBankPicker onPick={addFromBank} />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Generar reto y enlace'}
          </button>
        </form>
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
