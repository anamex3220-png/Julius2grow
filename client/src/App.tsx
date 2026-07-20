import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { EmployeeDashboard } from "./pages/EmployeeDashboard";
import { NewRequest } from "./pages/NewRequest";
import { ManagerApprovals } from "./pages/ManagerApprovals";
import { AdminPanel } from "./pages/AdminPanel";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<EmployeeDashboard />} />
          <Route path="/nueva-solicitud" element={<NewRequest />} />

          <Route element={<ProtectedRoute allow={["MANAGER", "ADMIN"]} />}>
            <Route path="/aprobaciones" element={<ManagerApprovals />} />
          </Route>

          <Route element={<ProtectedRoute allow={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
