import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-julius-600 text-white" : "text-slate-600 hover:bg-julius-50 hover:text-julius-700"
  }`;
}

export function Layout() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-julius-600 text-sm font-bold text-white">
              JV
            </div>
            <span className="text-lg font-semibold text-julius-900">Vacaciones Julius</span>
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavLink to="/" end className={navClass}>
              Mi panel
            </NavLink>
            {(user.role === "MANAGER" || user.role === "ADMIN") && (
              <NavLink to="/aprobaciones" className={navClass}>
                Aprobaciones
              </NavLink>
            )}
            {user.role === "ADMIN" && (
              <NavLink to="/admin" className={navClass}>
                Administración
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-medium text-slate-800">{user.name}</div>
              <div className="text-xs text-slate-500">
                {user.role === "ADMIN" ? "RH / Admin" : user.role === "MANAGER" ? "Manager" : "Empleado"}
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
