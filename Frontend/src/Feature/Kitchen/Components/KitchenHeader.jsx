import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaFire,
  FaClock,
  FaUtensils,
  FaShoppingBag,
  FaList,
  FaSignOutAlt,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { useTheme } from "../../../Context/ThemeContext";

const KitchenHeader = ({ activeFilter, setActiveFilter }) => {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // 🔥 Logo State
  const [storeLogo, setStoreLogo] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        console.error("Kitchen Header: Failed to load logo", error);
      }
    };
    fetchLogo();
  }, []);

  const filters = [
    { name: "All", icon: <FaList /> },
    { name: "Dine-In", icon: <FaUtensils /> },
    { name: "Takeaway", icon: <FaShoppingBag /> },
  ];

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
    <div className="k-header-container">
      <div className="k-brand-container">
        <div className="k-brand-logo" onClick={() => navigate("/")}>
          {/* 🔥 Dynamic Logo Logic */}
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="Kitchen Brand Logo"
              className="k-header-store-logo"
            />
          ) : (
            <>
              <div className="k-brand-icon">
                <FaFire />
              </div>
              <h1 className="k-brand-text">
                Big<span className="text-brand-red">Bite</span>
              </h1>
            </>
          )}
        </div>
        <div className="k-panel-tag">KITCHEN PANEL</div>
      </div>

      <div className="k-header-controls">
        <div className="k-clock-display">
          <FaClock className="text-brand-red" />
          {time.toLocaleTimeString()}
        </div>

        <div className="k-filter-group">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`k-filter-btn ${activeFilter === filter.name ? "active" : ""}`}
            >
              {filter.icon} {filter.name}
            </button>
          ))}
        </div>

        {/* THEME TOGGLE */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          style={{ marginRight: "10px" }}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <button onClick={handleSecureLogout} className="k-logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default KitchenHeader;
