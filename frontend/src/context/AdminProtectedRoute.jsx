import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) return null; // Or a spinner

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
