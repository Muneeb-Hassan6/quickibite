import React from "react";
import { FaMotorcycle, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../../Context/ThemeContext";

// 🔥 Yahan humne 'riderName' ka prop add kar diya hy
const RiderHeader = ({ onLogout, riderName }) => { 
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="rider-header">
            <div className="header-logo">
                <FaMotorcycle size={24} />
                {/* 🔥 Yahan condition laga di hy. Agar name hoga toh wo dikhega, warna default text */}
                <span>{riderName ? riderName : "QuickBite Rider"}</span>
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

                <button className="btn-logout" onClick={onLogout}>
                    <FaSignOutAlt /> Exit
                </button>
            </div>
        </div>
    );
};

export default RiderHeader;