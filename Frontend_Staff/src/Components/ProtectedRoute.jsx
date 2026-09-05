import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStaffAuth, getRoleDashboard } from "../Context/AuthContext";
import Swal from "sweetalert2";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, isAuthenticated, logout } = useStaffAuth();
  const location = useLocation();

  // 1. Session Check - If not logged in OR no token, purge stale data and redirect to login
  if (!isAuthenticated || !user || !token) {
    logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Case-Insensitive Role Matching
  const userRole = String(user.role || "").toLowerCase().trim();
  const safeAllowedRoles = allowedRoles.map((role) =>
    String(role).toLowerCase().trim()
  );

  // 3. RBAC Block: If role is not authorized for this specific portal
  if (allowedRoles.length > 0 && !safeAllowedRoles.includes(userRole)) {
    console.warn(
      `[RBAC Guard Block] Role "${user.role}" is not authorized for "${location.pathname}". Redirecting to authorized portal.`
    );

    const authorizedDashboard = getRoleDashboard(userRole);

    // Toast alert notifying unauthorized attempt
    setTimeout(() => {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: `Access Denied: ${user.role} cannot access ${location.pathname}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }, 100);

    return <Navigate to={authorizedDashboard} replace />;
  }

  // 4. Authorized - render the protected dashboard
  return children;
};

export default ProtectedRoute;
