import { Fragment, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { LEAVE_TYPE_LABELS, ROLE_LABELS, type Holiday, type LeaveRequest, type LeaveType, type Role, type User } from "../types";

type Tab = "empleados" | "solicitudes" | "feriados";

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("empleados");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-800">Administración</h1>
      <p className="mb-6 text-sm text-slate-500">Directorio de personas, solicitudes de la empresa y calendario de feriados.</p>

      <div className="mb-6 flex gap-2">
        {(
          [
            ["empleados", "Empleados"],
            ["solicitudes", "Solicitudes"],
            ["feriados", "Feriados"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === value ? "bg-julius-600 text-white" : "bg-white text-slate-600 hover:bg-julius-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "empleados" && <EmployeesTab />}
      {tab === "solicitudes" && <RequestsTab />}
      {tab === "feriados" && <HolidaysTab />}
    </div>
  );
}

function EmployeesTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await api.get<{ users: User[] }>("/users");
    setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-slate-500">Cargando…</p>;

  const managers = users.filter((u) => u.role === "MANAGER" || u.role === "ADMIN");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-full bg-julius-600 px-4 py-2 text-sm font-semibold text-white hover:bg-julius-700"
        >
          {showCreate ? "Cerrar" : "+ Nueva persona"}
        </button>
      </div>

      {showCreate && (
        <CreateEmployeeForm
          managers={managers}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Manager</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Reside fuera de MX</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <Fragment key={u.id}>
                <tr>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[u.role]}</td>
                  <td className="px-4 py-3 text-slate-600">{u.manager?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.hireDate.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-slate-600">{u.residesOutsideMexico ? "Sí" : "No"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.isActive ? "Sí" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                      className="text-xs font-medium text-julius-700 hover:underline"
                    >
                      {expandedId === u.id ? "Cerrar" : "Gestionar"}
                    </button>
                  </td>
                </tr>
                {expandedId === u.id && (
                  <tr>
                    <td colSpan={7} className="bg-slate-50 px-4 py-4">
                      <ManageEmployeePanel user={u} managers={managers} onChanged={load} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateEmployeeForm({ managers, onCreated }: { managers: User[]; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as Role,
    hireDate: "",
    residesOutsideMexico: false,
    managerId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/users", { ...form, managerId: form.managerId || null });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la persona");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <Field label="Nombre completo">
        <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
      </Field>
      <Field label="Email">
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="input"
        />
      </Field>
      <Field label="Contraseña temporal">
        <input
          required
          minLength={8}
          type="text"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="input"
        />
      </Field>
      <Field label="Fecha de ingreso">
        <input
          required
          type="date"
          value={form.hireDate}
          onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
          className="input"
        />
      </Field>
      <Field label="Rol">
        <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))} className="input">
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Manager (opcional)">
        <select value={form.managerId} onChange={(e) => setForm((f) => ({ ...f, managerId: e.target.value }))} className="input">
          <option value="">Sin manager (escala a RH)</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
        <input
          type="checkbox"
          checked={form.residesOutsideMexico}
          onChange={(e) => setForm((f) => ({ ...f, residesOutsideMexico: e.target.checked }))}
        />
        Reside fuera de México (15 días hábiles fijos de vacaciones)
      </label>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{error}</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-julius-600 px-5 py-2 text-sm font-semibold text-white hover:bg-julius-700 disabled:opacity-60"
        >
          {submitting ? "Creando…" : "Crear persona"}
        </button>
      </div>
    </form>
  );
}

function ManageEmployeePanel({ user, managers, onChanged }: { user: User; managers: User[]; onChanged: () => void }) {
  const [role, setRole] = useState<Role>(user.role);
  const [managerId, setManagerId] = useState(user.managerId ?? "");
  const [hireDate, setHireDate] = useState(user.hireDate.slice(0, 10));
  const [residesOutsideMexico, setResidesOutsideMexico] = useState(user.residesOutsideMexico);
  const [isActive, setIsActive] = useState(user.isActive);
  const [savingProfile, setSavingProfile] = useState(false);

  const [adjType, setAdjType] = useState<LeaveType>("VACACIONES");
  const [adjDays, setAdjDays] = useState(0);
  const [adjReason, setAdjReason] = useState("");
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveProfile() {
    setSavingProfile(true);
    setMessage(null);
    try {
      await api.patch(`/users/${user.id}`, {
        role,
        managerId: managerId || null,
        hireDate,
        residesOutsideMexico,
        isActive,
      });
      setMessage("Datos actualizados.");
      onChanged();
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveAdjustment(e: FormEvent) {
    e.preventDefault();
    if (!adjReason.trim() || adjDays === 0) return;
    setSavingAdjustment(true);
    setMessage(null);
    try {
      await api.post(`/users/${user.id}/adjustments`, { type: adjType, days: adjDays, reason: adjReason });
      setAdjDays(0);
      setAdjReason("");
      setMessage("Ajuste aplicado.");
    } finally {
      setSavingAdjustment(false);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Datos de la persona</h4>
        <Field label="Rol">
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input">
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Manager">
          <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="input">
            <option value="">Sin manager (escala a RH)</option>
            {managers.filter((m) => m.id !== user.id).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha de ingreso">
          <input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className="input" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={residesOutsideMexico} onChange={(e) => setResidesOutsideMexico(e.target.checked)} />
          Reside fuera de México
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Activo
        </label>
        <button
          onClick={saveProfile}
          disabled={savingProfile}
          className="rounded-lg bg-julius-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-julius-700 disabled:opacity-60"
        >
          {savingProfile ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Ajuste manual de balance</h4>
        <form onSubmit={saveAdjustment} className="space-y-3">
          <Field label="Tipo">
            <select value={adjType} onChange={(e) => setAdjType(e.target.value as LeaveType)} className="input">
              <option value="VACACIONES">Vacaciones</option>
              <option value="DIAS_PERSONALES">Días personales</option>
            </select>
          </Field>
          <Field label="Días (+ para sumar, - para restar)">
            <input
              type="number"
              value={adjDays}
              onChange={(e) => setAdjDays(Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Motivo">
            <input required value={adjReason} onChange={(e) => setAdjReason(e.target.value)} className="input" />
          </Field>
          <button
            type="submit"
            disabled={savingAdjustment}
            className="rounded-lg border border-julius-300 px-4 py-1.5 text-sm font-semibold text-julius-700 hover:bg-julius-50 disabled:opacity-60"
          >
            {savingAdjustment ? "Aplicando…" : "Aplicar ajuste"}
          </button>
        </form>
      </div>

      {message && <p className="sm:col-span-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
    </div>
  );
}

function RequestsTab() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const query = status ? `?status=${status}` : "";
    const data = await api.get<{ requests: LeaveRequest[] }>(`/requests${query}`);
    setRequests(data.requests);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-4">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-56">
        <option value="">Todas las solicitudes</option>
        <option value="PENDIENTE">Pendientes</option>
        <option value="APROBADA">Aprobadas</option>
        <option value="RECHAZADA">Rechazadas</option>
        <option value="CANCELADA">Canceladas</option>
      </select>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Persona</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fechas</th>
                <th className="px-4 py-3">Días</th>
                <th className="px-4 py-3">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-slate-700">{r.user?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{LEAVE_TYPE_LABELS[r.type]}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.startDate.slice(0, 10)} → {r.endDate.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.businessDays}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HolidaysTab() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await api.get<{ holidays: Holiday[] }>("/holidays");
    setHolidays(data.holidays);
  }

  useEffect(() => {
    load();
  }, []);

  async function addHoliday(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/holidays", { date, name });
      setDate("");
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar el feriado");
    }
  }

  async function removeHoliday(id: string) {
    await api.delete(`/holidays/${id}`);
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addHoliday} className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Field label="Fecha">
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </Field>
        <Field label="Nombre">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>
        <button type="submit" className="rounded-lg bg-julius-600 px-4 py-2 text-sm font-semibold text-white hover:bg-julius-700">
          Agregar
        </button>
      </form>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holidays.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-3 text-slate-600">{h.date.slice(0, 10)}</td>
                <td className="px-4 py-3 text-slate-700">{h.name}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeHoliday(h.id)} className="text-xs font-medium text-rose-600 hover:underline">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
