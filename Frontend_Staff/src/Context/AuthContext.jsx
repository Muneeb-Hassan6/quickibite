import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const AUTH_STORAGE_KEYS = [
  "staff_session",
  "user",
  "staff_user",
  "auth_token",
  "token",
  "staff_token",
  "adminActiveTab",
  "isAuth",
];

// Helper to determine home dashboard based on role
export const getRoleDashboard = (role) => {
  if (!role) return "/login";
  const r = String(role).toLowerCase().trim();
  if (r === "admin" || r === "manager") return "/admin";
  if (r === "cashier") return "/cashier";
  if (r === "chef" || r === "kitchen") return "/kitchen";
  if (r === "dispatcher") return "/dispatcher";
  if (r === "rider") return "/rider";
  return "/login";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw =
        sessionStorage.getItem("staff_user") ||
        sessionStorage.getItem("staff_session") ||
        sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return (
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") ||
      sessionStorage.getItem("staff_token") ||
      null
    );
  });

  const [isLoading, setIsLoading] = useState(false);

  // Tab-isolated login: strictly persists to this tab's sessionStorage
  const login = useCallback((userData, authToken) => {
    if (!userData || !authToken) return;
    const jsonStr = JSON.stringify(userData);

    sessionStorage.setItem("staff_user", jsonStr);
    sessionStorage.setItem("user", jsonStr);
    sessionStorage.setItem("staff_session", jsonStr);
    sessionStorage.setItem("token", authToken);
    sessionStorage.setItem("auth_token", authToken);
    sessionStorage.setItem("staff_token", authToken);
    sessionStorage.setItem("isAuth", "true");

    setUser(userData);
    setToken(authToken);
  }, []);

  // Tab-isolated logout: purges strictly this tab's sessionStorage without affecting other tabs
  const logout = useCallback(() => {
    AUTH_STORAGE_KEYS.forEach((key) => {
      try {
        sessionStorage.removeItem(key);
      } catch (err) {
        console.error("Storage purge error:", err);
      }
    });

    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    role: user?.role ? String(user.role).toLowerCase() : null,
    isAuthenticated: Boolean(user && token),
    isLoading,
    setIsLoading,
    login,
    logout,
    getRoleDashboard,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useStaffAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useStaffAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
