import { Navigate, Outlet } from "react-router-dom";
import { useAuthSession } from "./AuthProvider.jsx";

function AuthLoading() {
  return null;
}

export function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuthSession();

  if (loading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const { loading, isAuthenticated } = useAuthSession();

  if (loading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export function RootRedirect() {
  const { loading, isAuthenticated } = useAuthSession();

  if (loading) return <AuthLoading />;

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
