import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaFire,
  FaCashRegister,
  FaHistory,
  FaChartPie,
  FaSignOutAlt,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { useTheme } from "../../../Context/ThemeContext";

const CashierSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // 🔥 Logo State
  const [storeLogo, setStoreLogo] = useState("");

  // 🔥 Database se Logo Fetch karna
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_settings.php`,
        );
        const result = await response.json();

        if (result.success && result.data.store_logo) {
          setStoreLogo(result.data.store_logo);
        }
      } catch (error) {
        console.error("Cashier Sidebar: Failed to load logo", error);
      }
    };
    fetchLogo();
  }, []);

  const handleSecureLogout = () => {
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
        sessionStorage.removeItem("staff_session");
        sessionStorage.removeItem("user");
        navigate("/login", { replace: true });
      }
    });
  };

  return (
    <div className="pos-sidebar">
      {/* 🔥 Header / Dynamic Logo */}
      <div className="sidebar-logo">
        {storeLogo ? (
          <img src={storeLogo} alt="Logo" className="cashier-store-logo" />
        ) : (
          <FaFire /> /* Agar logo na ho toh fallback Fire icon */
        )}
      </div>

      <div className="sidebar-menu">
        <button
          className={`nav-item ${activeTab === "terminal" ? "active" : ""}`}
          onClick={() => setActiveTab("terminal")}
        >
          <FaCashRegister /> <span>POS</span>
        </button>
        <button
          className={`nav-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> <span>History</span>
        </button>
      </div>

      <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <button
          className="btn-logout"
          onClick={handleSecureLogout}
          title="Logout"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
};

export default CashierSidebar;
