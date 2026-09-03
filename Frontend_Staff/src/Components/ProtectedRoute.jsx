import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // 1. Session Check - get user + token with cross-tab fallback
  const sessionData =
    sessionStorage.getItem("staff_session") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("staff_session") ||
    localStorage.getItem("user");
  const token =
    sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

  let user = null;
  try {
    user = sessionData ? JSON.parse(sessionData) : null;
  } catch {
    user = null;
  }

  // 2. If not logged in OR no token, redirect to login
  if (!user || !token) {
    // Clear any stale data
    sessionStorage.removeItem("staff_session");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("auth_token");
    localStorage.removeItem("staff_session");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    return <Navigate to="/login" replace />;
  }

  // 3. Case-Insensitive Role Matching
  const userRole = String(user.role).toLowerCase();
  const safeAllowedRoles = allowedRoles.map((role) =>
    String(role).toLowerCase(),
  );

  // 4. If role not allowed, redirect to login (no spoofing possible since backend validates token)
  if (allowedRoles && !safeAllowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  // 5. All clear - render the protected page
  return children;
};

export default ProtectedRoute;
