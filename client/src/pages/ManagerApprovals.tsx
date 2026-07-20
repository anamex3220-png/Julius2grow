import { useEffect, useState } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { LEAVE_TYPE_LABELS, type LeaveRequest } from "../types";

export function ManagerApprovals() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const data = await api.get<{ requests: LeaveRequest[] }>("/requests/pending-approvals");
    setRequests(data.requests);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, decision: "APROBADA" | "RECHAZADA") {
    setBusyId(id);
    try {
      await api.patch(`/requests/${id}/decision`, { decision, decisionNote: noteDrafts[id] });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-slate-500">Cargando aprobaciones…</p>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-800">Aprobaciones pendientes</h1>
      <p className="mb-6 text-sm text-slate-500">Solicitudes de tu equipo esperando tu decisión.</p>

      {requests.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No hay solicitudes pendientes por ahora. 🎉
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{r.user?.name}</p>
                  <p className="text-xs text-slate-500">{r.user?.email}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-slate-400">Tipo</p>
                  <p className="font-medium text-slate-700">{LEAVE_TYPE_LABELS[r.type]}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Fechas</p>
                  <p className="font-medium text-slate-700">
                    {r.startDate.slice(0, 10)} → {r.endDate.slice(0, 10)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Días hábiles</p>
                  <p className="font-medium text-slate-700">{r.businessDays}</p>
                </div>
              </div>

              {r.note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">"{r.note}"</p>}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Comentario (opcional)"
                  value={noteDrafts[r.id] ?? ""}
                  onChange={(e) => setNoteDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-julius-500 focus:outline-none focus:ring-2 focus:ring-julius-200"
                />
                <button
                  onClick={() => decide(r.id, "RECHAZADA")}
                  disabled={busyId === r.id}
                  className="rounded-lg border border-rose-300 px-4 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => decide(r.id, "APROBADA")}
                  disabled={busyId === r.id}
                  className="rounded-lg bg-julius-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-julius-700 disabled:opacity-50"
                >
                  Aprobar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
