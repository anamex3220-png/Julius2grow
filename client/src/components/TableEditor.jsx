const EMPTY_TABLE = { caption: '', columns: ['Columna 1', 'Columna 2'], rows: [['', '']] };

export default function TableEditor({ value, onChange }) {
  const table = value || EMPTY_TABLE;

  function update(patch) {
    onChange({ ...table, ...patch });
  }
  function updateColumn(i, text) {
    const columns = [...table.columns];
    columns[i] = text;
    update({ columns });
  }
  function addColumn() {
    update({
      columns: [...table.columns, `Columna ${table.columns.length + 1}`],
      rows: table.rows.map((r) => [...r, '']),
    });
  }
  function removeColumn(i) {
    if (table.columns.length <= 1) return;
    update({
      columns: table.columns.filter((_, idx) => idx !== i),
      rows: table.rows.map((r) => r.filter((_, idx) => idx !== i)),
    });
  }
  function updateCell(rowIdx, colIdx, text) {
    const rows = table.rows.map((r) => [...r]);
    rows[rowIdx][colIdx] = text;
    update({ rows });
  }
  function addRow() {
    update({ rows: [...table.rows, table.columns.map(() => '')] });
  }
  function removeRow(i) {
    update({ rows: table.rows.filter((_, idx) => idx !== i) });
  }

  return (
    <div>
      <label htmlFor="table-caption">Título de la tabla (opcional)</label>
      <input
        id="table-caption"
        type="text"
        value={table.caption}
        onChange={(e) => update({ caption: e.target.value })}
        placeholder="Ej. Rendimiento del último mes"
      />

      <div style={{ overflowX: 'auto', marginBottom: 10 }}>
        <table>
          <thead>
            <tr>
              {table.columns.map((col, i) => (
                <th key={i}>
                  <input type="text" value={col} onChange={(e) => updateColumn(i, e.target.value)} style={{ marginBottom: 4 }} />
                  {table.columns.length > 1 && (
                    <button
                      type="button"
                      className="secondary"
                      style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                      onClick={() => removeColumn(i)}
                    >
                      Quitar columna
                    </button>
                  )}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>
                    <input type="text" value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)} style={{ marginBottom: 0 }} />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    className="secondary"
                    style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                    onClick={() => removeRow(ri)}
                  >
                    Quitar fila
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="secondary" onClick={addColumn}>
          + Columna
        </button>
        <button type="button" className="secondary" onClick={addRow}>
          + Fila
        </button>
      </div>
    </div>
  );
}
