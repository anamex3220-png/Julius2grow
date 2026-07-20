import type { BalanceResult } from "../types";

export function BalanceCard({ title, balance }: { title: string; balance: BalanceResult }) {
  const pct = balance.entitlement > 0 ? Math.max(0, Math.min(100, (balance.remaining / balance.entitlement) * 100)) : 0;
  const low = balance.remaining <= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <span className="text-xs text-slate-400">{balance.periodLabel}</span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className={`text-3xl font-bold ${low ? "text-rose-600" : "text-julius-700"}`}>
          {balance.remaining}
        </span>
        <span className="pb-1 text-sm text-slate-500">de {balance.entitlement} días disponibles</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${low ? "bg-rose-500" : "bg-julius-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {balance.used} usados{balance.adjusted !== 0 ? ` · ${balance.adjusted > 0 ? "+" : ""}${balance.adjusted} ajuste RH` : ""}
      </p>
    </div>
  );
}
