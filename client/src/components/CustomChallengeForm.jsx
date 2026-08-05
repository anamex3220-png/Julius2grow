import { useState } from 'react';
import TableEditor from './TableEditor.jsx';
import ImageUploadField from './ImageUploadField.jsx';
import QuestionBankPicker from './QuestionBankPicker.jsx';

const CRITERION_OPTIONS = [
  { id: 'integral', label: 'Técnica + lógica + soft skill (recomendado)' },
  { id: 'logica', label: 'Lógica aplicada al puesto' },
  { id: 'conocimiento', label: 'Conocimiento aplicado' },
  { id: 'soft_skill', label: 'Soft skill' },
];

const EMPTY_QUESTION = { text: '', criterion: 'integral', keywords: '' };

// Formulario del constructor de retos personalizados (tipo "open"). Lo usan
// tanto crear (CreateCampaign) como editar (EditCampaign) — recibe los
// valores iniciales y un onSubmit genérico, sin saber si es un POST o un PATCH.
export default function CustomChallengeForm({ initialValues, submitLabel, onSubmit, loading, error }) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [company, setCompany] = useState(initialValues?.company ?? '');
  const [contactEmail, setContactEmail] = useState(initialValues?.contactEmail ?? '');
  const [minutes, setMinutes] = useState(initialValues?.minutes ?? 20);
  const [prompt, setPrompt] = useState(initialValues?.prompt ?? '');
  const [image, setImage] = useState(initialValues?.image ?? null);
  const [useTable, setUseTable] = useState(Boolean(initialValues?.table));
  const [table, setTable] = useState(initialValues?.table ?? null);
  const [questions, setQuestions] = useState(
    initialValues?.questions?.length ? initialValues.questions : [{ ...EMPTY_QUESTION }]
  );

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

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      title,
      company,
      contactEmail,
      timeLimitMinutes: minutes,
      challenge: {
        prompt,
        image,
        table: useTable ? table : null,
        questions: questions.map((q) => ({ text: q.text, criterion: q.criterion, keywords: q.keywords })),
      },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="c-title">Título del puesto</label>
      <input id="c-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Media Buyer Senior" required />

      <label htmlFor="c-company">Empresa (opcional)</label>
      <input id="c-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ej. Julius" />

      <label htmlFor="c-contact-email">Correo de contacto para candidatos (opcional)</label>
      <input
        id="c-contact-email"
        type="email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        placeholder="Se muestra en el aviso de privacidad, para pedir borrado de datos"
      />

      <label htmlFor="c-minutes">Minutos para responder</label>
      <input id="c-minutes" type="number" min={5} max={60} value={minutes} onChange={(e) => setMinutes(e.target.value)} />

      <p className="muted" style={{ marginTop: -10, marginBottom: 16, fontSize: '0.82rem' }}>
        Al terminar vas a recibir dos enlaces para compartir — uno con bloqueo total y otro solo con
        señales. Eliges cuál mandar según el caso.
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
        {loading ? 'Guardando...' : submitLabel}
      </button>
    </form>
  );
}
