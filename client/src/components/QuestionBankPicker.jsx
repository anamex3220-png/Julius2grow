import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function QuestionBankPicker({ onPick }) {
  const [open, setOpen] = useState(false);
  const [bank, setBank] = useState(null);
  const [areaFilter, setAreaFilter] = useState('');
  const [criterionFilter, setCriterionFilter] = useState('');

  useEffect(() => {
    if (open && !bank) {
      api
        .getQuestionBank()
        .then(setBank)
        .catch(() => setBank({ questions: [], areaLabels: {}, criteria: {} }));
    }
  }, [open, bank]);

  if (!open) {
    return (
      <button type="button" className="secondary" onClick={() => setOpen(true)}>
        📚 Elegir del banco de preguntas
      </button>
    );
  }

  const filtered = (bank?.questions || []).filter(
    (q) => (!areaFilter || q.area === areaFilter) && (!criterionFilter || q.criterion === criterionFilter)
  );

  return (
    <div className="card" style={{ background: 'var(--surface-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <strong>Banco de preguntas</strong>
        <button type="button" className="secondary" onClick={() => setOpen(false)}>
          Cerrar
        </button>
      </div>

      {!bank ? (
        <p className="muted">Cargando...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} style={{ marginBottom: 0 }}>
              <option value="">Todas las áreas</option>
              {Object.entries(bank.areaLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <select value={criterionFilter} onChange={(e) => setCriterionFilter(e.target.value)} style={{ marginBottom: 0 }}>
              <option value="">Todos los criterios</option>
              {Object.entries(bank.criteria).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
            {filtered.map((q) => (
              <div key={q.id} className="card" style={{ margin: 0, padding: 12 }}>
                <p className="muted" style={{ fontSize: '0.78rem', margin: '0 0 6px' }}>
                  {bank.areaLabels[q.area]} · {bank.criteria[q.criterion]}
                </p>
                <p style={{ margin: '0 0 8px' }}>{q.text}</p>
                <button type="button" onClick={() => onPick(q)}>
                  Agregar
                </button>
              </div>
            ))}
            {filtered.length === 0 && <p className="muted">No hay preguntas con ese filtro.</p>}
          </div>
        </>
      )}
    </div>
  );
}
