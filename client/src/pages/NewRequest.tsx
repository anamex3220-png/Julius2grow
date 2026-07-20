import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { LEAVE_TYPE_LABELS, type Holiday, type LeaveType } from "../types";

function countBusinessDaysPreview(start: string, end: string, holidays: Holiday[]): number {
  if (!start || !end) return 0;
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  if (e < s) return 0;
  const holidaySet = new Set(holidays.map((h) => h.date.slice(0, 10)));
  let count = 0;
  for (let cursor = s; cursor <= e; cursor = new Date(cursor.getTime() + 86400000)) {
    const dow = cursor.getUTCDay();
    const iso = cursor.toISOString().slice(0, 10);
    if (dow !== 0 && dow !== 6 && !holidaySet.has(iso)) count++;
  }
  return count;
}

export function NewRequest() {
  const navigate = useNavigate();
  const [type, setType] = useState<LeaveType>("VACACIONES");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get<{ holidays: Holiday[] }>("/holidays").then((d) => setHolidays(d.holidays));
  }, []);

  const previewDays = useMemo(() => countBusinessDaysPreview(startDate, endDate, holidays), [startDate, endDate, holidays]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setSubmitting(true);
    try {
      const res = await api.post<{ warning?: string }>("/requests", { type, startDate, endDate, note });
      if (res.warning) {
        setWarning(res.warning);
      }
      setSuccess(true);
      setTimeout(() => navigate("/"), res.warning ? 2200 : 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la solicitud");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-semibold text-slate-800">Solicitar ausencia</h1>
      <p className="mb-6 text-sm text-slate-500">Tu manager recibirá la solicitud para autorizarla.</p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de ausencia</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as LeaveType)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-julius-500 focus:outline-none focus:ring-2 focus:ring-julius-200"
          >
            {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Desde</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-julius-500 focus:outline-none focus:ring-2 focus:ring-julius-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Hasta</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-julius-500 focus:outline-none focus:ring-2 focus:ring-julius-200"
            />
          </div>
        </div>

        {startDate && endDate && (
          <p className="rounded-lg bg-julius-50 px-3 py-2 text-sm text-julius-800">
            Esto equivale a <strong>{previewDays}</strong> día(s) hábil(es).
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nota (opcional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-julius-500 focus:outline-none focus:ring-2 focus:ring-julius-200"
            placeholder="Contexto adicional para tu manager (opcional)"
          />
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        {warning && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{warning}</p>}
        {success && !warning && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Solicitud enviada.</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-julius-600 px-5 py-2 text-sm font-semibold text-white hover:bg-julius-700 disabled:opacity-60"
          >
            {submitting ? "Enviando…" : "Enviar solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}
