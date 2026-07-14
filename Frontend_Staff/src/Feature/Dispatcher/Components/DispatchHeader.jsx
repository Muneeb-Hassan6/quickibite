import React from "react";
import { FaMotorcycle, FaSignOutAlt, FaSun, FaMoon, FaFire } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // 🔥 Premium Alerts Import
import { useTheme } from "../../../Context/ThemeContext";

const DispatchHeader = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // 🔥 Fetch Settings from React Query
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    }
  });

  const storeLogo = settingsData?.store_logo || "";

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
    <header className="flex justify-between items-center p-[15px_40px] bg-[var(--admin-panel)] shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-[20px]">
        <div className="flex items-center gap-[10px] cursor-pointer" onClick={() => navigate("/")}>
          {/* 🔥 Dynamic Logo Logic */}
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="Dispatch Brand Logo"
              className="max-w-[140px] max-h-[45px] object-contain cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
            />
          ) : (
            <>
              <div className="bg-[var(--brand-red)] text-[var(--text-main,#ffffff)] p-[10px] rounded-[8px] text-[20px] flex">
                <FaFire />
              </div>
              <h1 className="font-oswald text-[28px] text-[var(--k-text,#ffffff)] m-0 tracking-[1px] uppercase">
                Big<span className="text-[var(--brand-red,#ef4444)]">Bite</span>
              </h1>
            </>
          )}
        </div>

      </div>
      <div className="flex items-center gap-[10px]">
        <span className="flex items-center gap-[8px] text-[14px] font-bold text-[var(--rider-success)] uppercase">
          <span className="w-[10px] h-[10px] bg-[var(--rider-success)] rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Live
        </span>

        {/* THEME TOGGLE */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <button className="bg-[var(--brand-yellow)] rounded border-none text-[var(--admin-text)] p-[8px_16px] rounded-[10px] cursor-pointer flex items-center gap-[8px] transition-all duration-300 font-semibold hover:bg-[rgba(239,68,68,0.1)] hover:text-[var(--brand-yellow)]" onClick={handleLogout}>
          <FaSignOutAlt style={{ marginRight: "5px" }} /> Logout
        </button>
      </div>
    </header>
  );
};

export default DispatchHeader;
