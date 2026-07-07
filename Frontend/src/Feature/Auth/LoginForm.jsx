import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaLock, FaUser, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import "./LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();

  // Form States (Role nikal diya hai)
  const [loginId, setLoginId] = useState(""); // Ab yeh Username YA Phone dono ke liye use hoga
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId || !password) {
      Swal.fire(
        "Warning",
        "Please enter your username/phone and password!",
        "warning",
      );
      return;
    }

    setIsLoading(true);

    try {
      // 🔥 Backend API Call
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/login.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loginId, password }), // Backend ko username key hi bhejen ge
        },
      );

      const result = await response.json();

      if (result.success) {
        // 1. Save user session AND JWT token
        sessionStorage.setItem("staff_session", JSON.stringify(result.user));
        sessionStorage.setItem("user", JSON.stringify(result.user));
        sessionStorage.setItem("auth_token", result.token); // 🔥 JWT Token save ho gaya

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Welcome ${result.user.name}!`,
          showConfirmButton: false,
          timer: 1500,
        });

        // 2. 🔥 Strict Routing Database ke Role par
        const dbRole = result.user.role.toLowerCase();

        if (dbRole === "admin" || dbRole === "manager") {
          navigate("/admin");
        } else if (dbRole === "cashier") {
          navigate("/cashier");
        } else if (dbRole === "chef" || dbRole === "kitchen") {
          navigate("/kitchen");
        } else if (dbRole === "dispatcher") {
          navigate("/dispatcher");
        } else if (dbRole === "rider") {
          navigate("/rider");
        } else {
          Swal.fire(
            "Error",
            "Your role is not assigned to any portal.",
            "error",
          );
        }
      } else {
        Swal.fire("Login Failed", result.message, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire("Error", "Network connection failed.", "error");
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
