import { LEAVE_STATUS_LABELS, type LeaveStatus } from "../types";

const STYLES: Record<LeaveStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  APROBADA: "bg-emerald-100 text-emerald-800",
  RECHAZADA: "bg-rose-100 text-rose-800",
  CANCELADA: "bg-slate-200 text-slate-600",
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {LEAVE_STATUS_LABELS[status]}
    </span>
  );
}
