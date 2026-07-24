import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { BalanceCard } from "../components/BalanceCard";
import { StatusBadge } from "../components/StatusBadge";
import { LEAVE_TYPE_LABELS, type BalanceResult, type LeaveRequest } from "../types";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<{ vacaciones: BalanceResult; diasPersonales: BalanceResult } | null>(
    null
  );
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    const [balanceData, requestData] = await Promise.all([
      api.get<{ vacaciones: BalanceResult; diasPersonales: BalanceResult }>(`/users/${user.id}/balances`),
      api.get<{ requests: LeaveRequest[] }>("/requests/mine"),
    ]);
    setBalances(balanceData);
    setRequests(requestData.requests);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function cancelRequest(id: string) {
    setCancelingId(id);
    try {
      await api.patch(`/requests/${id}/cancel`);
      await load();
    } finally {
      setCancelingId(null);
    }
  }

  if (loading || !balances) {
    return <p className="text-slate-500">Cargando tu información…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Hola, {user?.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">Este es tu resumen de vacaciones y ausencias.</p>
        </div>
        <Link
          to="/nueva-solicitud"
          className="rounded-full bg-julius-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-julius-700"
        >
          + Solicitar ausencia
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BalanceCard title="Vacaciones" balance={balances.vacaciones} />
        <BalanceCard title="Días personales" balance={balances.diasPersonales} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Mis solicitudes</h2>
        {requests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Todavía no has hecho ninguna solicitud.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Fechas</th>
                  <th className="px-4 py-3">Días hábiles</th>
                  <th className="px-4 py-3">Estatus</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-slate-700">{LEAVE_TYPE_LABELS[r.type]}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.startDate.slice(0, 10)} → {r.endDate.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.businessDays}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "PENDIENTE" && (
                        <button
                          onClick={() => cancelRequest(r.id)}
                          disabled={cancelingId === r.id}
                          className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
