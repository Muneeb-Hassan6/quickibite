import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserShield, FaLock, FaUser, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useStaffAuth, getRoleDashboard } from "../../Context/AuthContext";
import "./loginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useStaffAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const fromPath = location.state?.from?.pathname;
      const destination =
        fromPath && fromPath !== "/login" && fromPath !== "/"
          ? fromPath
          : getRoleDashboard(user.role);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanUsername = (loginId || "").trim();
    if (!cleanUsername || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Credentials",
        text: "Please enter your username/phone and password!",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Backend API Call
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/login.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: cleanUsername, password }),
        }
      );

      const result = await response.json();

      if (result.success && result.user && result.token) {
        // Synchronize auth state across storage & context
        login(result.user, result.token);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Welcome back, ${result.user.name}!`,
          showConfirmButton: false,
          timer: 1500,
        });

        // Strict Role-Based Dashboard Routing
        const targetRoute = getRoleDashboard(result.user.role);
        if (targetRoute && targetRoute !== "/login") {
          navigate(targetRoute, { replace: true });
        } else {
          Swal.fire(
            "Role Unassigned",
            "Your role is not mapped to any staff portal. Please contact management.",
            "error"
          );
        }
      } else {
        Swal.fire("Login Failed", result.message || "Invalid username or password!", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire("Network Error", "Unable to reach the authentication server. Please check connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <button className="back-to-store-btn" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back to Store
        </button>

        <div className="login-header">
          <div className="login-logo">
            <FaUserShield />
          </div>
          <h2>Staff Portal</h2>
          <p>Login to access your dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FaUser />
              </span>
              <input
                type="text"
                className="login-input"
                placeholder="Enter username"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="login-input password-field"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span 
                className="password-toggle-icon"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                title="Hold to show password"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Login Securely"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
