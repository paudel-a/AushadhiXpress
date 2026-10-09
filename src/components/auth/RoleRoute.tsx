import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type Role = "CUSTOMER" | "PHARMACIST" | "ADMIN";

interface RoleRouteProps {
  allowedRoles: Role[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const home =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.role === "PHARMACIST"
          ? "/pharmacist/prescriptions"
          : "/";

    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
