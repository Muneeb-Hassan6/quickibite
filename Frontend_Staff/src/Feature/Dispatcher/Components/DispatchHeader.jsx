import React from "react";
import { FaMotorcycle, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // 🔥 Premium Alerts Import
import { useTheme } from "../../../Context/ThemeContext";

const DispatchHeader = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // 🔥 100% SECURE LOGOUT LOGIC
  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to end your session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#333",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        // 1. Unified Session keys ko clear karein
        sessionStorage.removeItem("staff_session");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("isAuth"); // Purani key bhi hata di safety ke liye

        // 2. Login page par bhej dein aur history clear kar dein
        navigate("/login", { replace: true });
      }
    });
  };

  return (
    <header className="dispatch-header">
      <div className="header-brand">
        <FaMotorcycle className="brand-icon" />
        <h2>QuickBite Dispatch</h2>
      </div>
      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span className="live-status">
          <span className="pulse-dot"></span> Live
        </span>
        
        {/* THEME TOGGLE */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt style={{ marginRight: "5px" }} /> Logout
        </button>
      </div>
    </header>
  );
};

export default DispatchHeader;
