import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import bigBiteLogo from "../../../assets/bigbite logo.png";

const CashierSidebar = ({ activeTab, setActiveTab, handleLogout, onResetTerminal, isMobileSidebarOpen }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    }
  });

  const storeLogo = settingsData?.store_logo || "";

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
    <div className={`w-[90px] bg-[var(--pos-panel)] flex flex-col items-center py-[30px] z-[100] max-[900px]:fixed max-[900px]:left-0 max-[900px]:top-0 max-[900px]:h-full max-[900px]:transition-transform max-[900px]:duration-300 ${isMobileSidebarOpen ? 'max-[900px]:translate-x-0' : 'max-[900px]:-translate-x-full'}`}>
      {/* 🔥 Header / Dynamic Logo */}
      <div className="flex justify-center items-center mb-[30px] h-[65px] text-[32px] text-[var(--brand-red)] drop-shadow-[var(--shadow-glow)]">
        {storeLogo ? (
          <img src={storeLogo} alt="Logo" className="max-w-[65px] max-h-[65px] object-contain transition-transform duration-300 hover:scale-105" />
        ) : (
          <img src={bigBiteLogo} alt="Logo" className="max-w-[65px] max-h-[65px] object-contain transition-transform duration-300 hover:scale-105" />
        )}
      </div>

      <div className="flex flex-col gap-[20px] w-full items-center">
        <button
          className={`w-[60px] h-[60px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-none ${activeTab === "terminal" ? "bg-[#FFDD00] text-[#1a1a1a] shadow-[0_4px_15px_rgba(255,221,0,0.4)] -translate-y-[2px]" : "bg-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"}`}
          style={{ borderRadius: "16px", border: "none", outline: "none" }}
          onClick={() => {
            if (activeTab === "terminal" && onResetTerminal) {
              onResetTerminal();
            } else {
              setActiveTab("terminal");
            }
          }}
        >
          <FaCashRegister className="text-[22px] mb-[6px]" /> <span className="text-[9px] font-extrabold uppercase">POS</span>
        </button>
        <button
          className={`w-[60px] h-[60px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-none ${activeTab === "history" ? "bg-[#FFDD00] text-[#1a1a1a] shadow-[0_4px_15px_rgba(255,221,0,0.4)] -translate-y-[2px]" : "bg-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"}`}
          style={{ borderRadius: "16px", border: "none", outline: "none" }}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory className="text-[22px] mb-[6px]" /> <span className="text-[9px] font-extrabold uppercase">History</span>
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-[15px] items-center">
        {/* Settings Button */}
        <button
          className="w-[60px] h-[60px] bg-transparent text-[var(--admin-muted)] border-none flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
          style={{ borderRadius: "16px", border: "none", outline: "none" }}
          onClick={toggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? <FaSun className="text-[20px]" /> : <FaMoon className="text-[20px]" />}
        </button>

        <button
          className="w-[50px] h-[50px] flex items-center justify-center text-[var(--text-main,#ffffff)] bg-transparent border-none cursor-pointer transition-all duration-300 text-[20px] hover:bg-[rgba(239,68,68,0.1)] hover:text-[var(--brand-red)] hover:scale-110"
          style={{ borderRadius: "16px", border: "none", outline: "none" }}
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
