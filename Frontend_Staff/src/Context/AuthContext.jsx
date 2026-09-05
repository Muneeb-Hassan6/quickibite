import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const AUTH_STORAGE_KEYS = [
  "staff_session",
  "user",
  "auth_token",
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
        sessionStorage.getItem("staff_session") ||
        sessionStorage.getItem("user") ||
        localStorage.getItem("staff_session") ||
        localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return (
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token") ||
      null
    );
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync state if localStorage changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "staff_session" || e.key === "auth_token") {
        try {
          const raw = localStorage.getItem("staff_session");
          setUser(raw ? JSON.parse(raw) : null);
          setToken(localStorage.getItem("auth_token"));
        } catch {
          setUser(null);
          setToken(null);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Secure login handler
  const login = useCallback((userData, authToken) => {
    if (!userData || !authToken) return;
    const jsonStr = JSON.stringify(userData);

    sessionStorage.setItem("staff_session", jsonStr);
    sessionStorage.setItem("user", jsonStr);
    sessionStorage.setItem("auth_token", authToken);

    localStorage.setItem("staff_session", jsonStr);
    localStorage.setItem("user", jsonStr);
    localStorage.setItem("auth_token", authToken);

    setUser(userData);
    setToken(authToken);
  }, []);

  // Complete, deep logout purge across all storage layers
  const logout = useCallback(() => {
    AUTH_STORAGE_KEYS.forEach((key) => {
      try {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
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
