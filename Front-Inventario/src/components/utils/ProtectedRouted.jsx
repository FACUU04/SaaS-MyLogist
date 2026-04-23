import { Navigate } from "react-router-dom";
import { getUserFromToken, hasRole } from "../utils/auth";

export default function ProtectedRoute({ role, children }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && !hasRole(user, role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
