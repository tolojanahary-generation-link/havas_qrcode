import { Routes, Route, Navigate } from "react-router-dom";
import AuthRoutes from "./authRoutes";
import AdminRoutes from "./adminRoutes";
import ClientRoutes from "./clientRoutes";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<AuthRoutes />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={["SUPER_ADMIN"]} />}>
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Route>

        <Route element={<RoleGuard allowedRoles={["COLLABORATOR"]} />}>
          <Route path="/client/*" element={<ClientRoutes />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
