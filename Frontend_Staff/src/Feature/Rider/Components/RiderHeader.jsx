import React from "react";
import { FaMotorcycle, FaSignOutAlt, FaSun, FaMoon, FaFire } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../../../Context/ThemeContext";

// 🔥 Yahan humne 'riderName' ka prop add kar diya hy
const RiderHeader = ({ onLogout, riderName }) => {
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

    return (
        <div className="flex justify-between items-center p-[15px_20px] bg-[var(--admin-panel)] shadow-[0_4px_15px_rgba(0,0,0,0.5)] z-10">
            <div className="flex items-center gap-[10px] cursor-pointer">
                {/* 🔥 Dynamic Logo Logic */}
                {storeLogo ? (
                    <img
                        src={storeLogo}
                        alt="Rider Brand Logo"
                        className="max-w-[120px] max-h-[40px] object-contain cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
                    />
                ) : (
                    <>
                        <div className="bg-[var(--brand-red)] text-[var(--text-main,#ffffff)] p-[8px] rounded-[8px] text-[18px] flex">
                            <FaFire />
                        </div>
                        <h1 className="font-oswald text-[24px] text-[var(--k-text,#ffffff)] m-0 tracking-[1px] uppercase">
                            Big<span className="text-[var(--brand-red,#ef4444)]">Bite</span>
                        </h1>
                    </>
                )}
                <div className="bg-[rgba(255,255,255,0.05)] p-[4px_10px] rounded-[6px] text-[var(--k-muted,#aaa)] text-[11px] font-bold uppercase tracking-[1px] ml-[10px]">
                    {riderName ? riderName : "GUEST"}
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* THEME TOGGLE */}
                <button
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={theme === "dark" ? "Light Mode" : "Dark Mode"}
                >
                    {theme === "dark" ? <FaSun /> : <FaMoon />}
                </button>

                <button className="bg-transparent  text-[var(--admin-text)] p-[8px_16px] rounded-[8px] cursor-pointer flex items-center gap-[6px] font-semibold text-[13px] transition-all duration-300 active:bg-[rgba(239,68,68,0.1)] active:text-[var(--admin-orange)] active:border-[var(--admin-orange)]" onClick={onLogout}>
                    <FaSignOutAlt />
                </button>
            </div>
        </div>
    );
};

export default RiderHeader;