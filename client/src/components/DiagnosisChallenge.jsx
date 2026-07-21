import { Fragment, useState } from 'react';
import { formatDiagnosisValue } from '../format.js';

export default function DiagnosisChallenge({ challenge, onSubmit, submitting }) {
  const [lineId, setLineId] = useState('');
  const [correctedValue, setCorrectedValue] = useState('');

  const grouped = groupBy(challenge.lineItems, 'group');

  return (
    <div className="card">
      <h2>{challenge.title}</h2>
      <p className="muted">{challenge.prompt}</p>

      <table className="balance-table" style={{ marginBottom: 20 }}>
        <tbody>
          {Object.entries(grouped).map(([group, items]) => (
            <Fragment key={group}>
              <tr>
                <td colSpan={2} className="muted" style={{ paddingTop: 14 }}>
                  {group}
                </td>
              </tr>
              {items.map((item) => (
                <tr key={item.id} className={item.isTotal ? 'total' : ''}>
                  <td>{item.label}</td>
                  <td className="num">{formatDiagnosisValue(item)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      <label htmlFor="lineId">¿Qué línea tiene el error?</label>
      <select id="lineId" value={lineId} onChange={(e) => setLineId(e.target.value)}>
        <option value="">Selecciona una línea</option>
        {challenge.lineItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.group} · {item.label}
          </option>
        ))}
      </select>

      <label htmlFor="correctedValue">¿Cuál debería ser el valor correcto?</label>
      <input
        id="correctedValue"
        type="number"
        step="any"
        value={correctedValue}
        onChange={(e) => setCorrectedValue(e.target.value)}
        placeholder={challenge.correctionHint || 'Ej. 120000'}
      />

      <button
        onClick={() => onSubmit({ lineId, correctedValue })}
        disabled={submitting || !lineId || correctedValue === ''}
      >
        {submitting ? 'Enviando...' : 'Enviar y calificar'}
      </button>
    </div>
  );
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}
