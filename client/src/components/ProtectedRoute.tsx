import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export function ProtectedRoute({ allow }: { allow?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Cargando…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
