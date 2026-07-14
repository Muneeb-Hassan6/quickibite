import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    <div className="flex justify-between items-center mb-[25px] flex-wrap gap-[20px] p-[15px_25px] bg-[var(--k-panel)] shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-[20px]">
        <div className="flex items-center gap-[10px] cursor-pointer" onClick={() => navigate("/")}>
          {/* 🔥 Dynamic Logo Logic */}
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="Kitchen Brand Logo"
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
        <div className="bg-[rgba(255,255,255,0.05)] p-[4px_10px] rounded-[6px] text-[var(--k-muted,#aaa)] text-[12px] font-bold uppercase tracking-[1px]">KITCHEN PANEL</div>
      </div>

      <div className="flex items-center gap-[20px] flex-wrap">
        <div className="flex items-center gap-[8px] p-[10px_15px] bg-[var(--k-bg)] rounded-[10px] text-[var(--k-text,#fff)] font-bold text-[14px] font-mono">
          <FaClock className="text-[var(--brand-yellow,#ef4444)]" />
          {time.toLocaleTimeString()}
        </div>

        <div className="flex gap-[5px] bg-[var(--k-bg)] p-[6px] rounded-[12px]">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`flex items-center gap-[6px] border-none rounded p-[10px_18px] font-extrabold text-[13px]  cursor-pointer transition-all duration-300 ${activeFilter === filter.name ? "bg-[var(--brand-yellow)] text-[var(--text-main,#ffffff)]" : "bg-transparent text-[var(--k-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-main,#ffffff)]"}`}
            >
              {filter.icon} {filter.name}
            </button>
          ))}
        </div>

        {/* THEME TOGGLE */}
        <button
          className="theme-toggle-btn mr-[10px]"
          onClick={toggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <button onClick={handleSecureLogout} className="flex items-center gap-[8px] p-[10px_18px] bg-[rgba(239,68,68,0.1)] text-[var(--brand-yellow)] rounded font-bold text-[14px] cursor-pointer transition-all duration-300 border-none hover:bg-[var(--brand-yellow)] hover:text-[var(--text-main,#ffffff)]">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default KitchenHeader;
