import { Routes, Route, Navigate } from "react-router-dom";
import ClientLayout from "@/components/layout/ClientLayout";
import ClientDashboard from "@/pages/client/Dashboard";
import Tracking from "@/pages/client/Tracking";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="tracking" element={<Tracking />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
