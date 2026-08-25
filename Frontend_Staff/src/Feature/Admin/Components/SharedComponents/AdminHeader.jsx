import React, { useState, useEffect } from "react";
import { FaBars, FaSun, FaMoon, FaClock } from "react-icons/fa";
import { useTheme } from "../../../../Context/ThemeContext";

const TAB_DESCRIPTIONS = {
  dashboard: "Real-time metrics, order volumes, and financial summary",
  orders: "Live kitchen, cashier, and delivery pipeline monitoring",
  menu: "Product catalog, pricing, variants, and addon modifiers",
  deals: "Promotional combos, bundle deals, and dynamic banners",
  inventory: "Raw ingredient tracking, stock alerts, and usage recipes",
  staff: "Employee roster, attendance logs, and payroll management",
  analytics: "Sales trends, top performing items, and customer metrics",
  profit: "Item-level cost breakdown, gross profits, and profit margins",
  tables: "Dine-in floor plan, active occupancy, and printable QR codes",
  homepage_builder: "Customer portal hero slider, banners, and layout controls",
  settings: "Restaurant profile, operational timings, delivery rules, and legal terms",
};

const AdminHeader = ({ activeTab, setIsSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const titleFormatted = (activeTab || "Dashboard")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 py-3.5 bg-[var(--admin-panel,#171717)]/95 backdrop-blur-md border-b border-[var(--admin-border,rgba(255,255,255,0.06))] flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="md:hidden w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--admin-text,#fff)] flex items-center justify-center border border-white/10 cursor-pointer transition-all shrink-0"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Navigation"
        >
          <FaBars className="text-sm" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h1 className="m-0 text-base sm:text-lg font-black text-[var(--admin-text,#fff)] tracking-wide font-['Oswald',sans-serif] uppercase truncate">
              {titleFormatted}
            </h1>
          </div>
          <p className="hidden md:block text-[11px] text-[var(--admin-muted,#9ca3af)] m-0 mt-0.5 truncate font-sans">
            {TAB_DESCRIPTIONS[activeTab] || "Manage and configure your system"}
          </p>
        </div>
      </div>

      {/* Right: Live Status Pill & Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Live Store Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider">Store Online</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[var(--admin-muted,#9ca3af)] text-xs font-mono font-semibold">
          <FaClock className="text-amber-400 text-[11px]" />
          <span>{currentTime}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.03] hover:bg-white/10 text-[var(--admin-text,#fff)] border border-[var(--admin-border,rgba(255,255,255,0.08))] flex items-center justify-center cursor-pointer transition-all shadow-sm"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <FaSun className="text-amber-400 text-xs sm:text-sm" />
          ) : (
            <FaMoon className="text-neutral-700 text-xs sm:text-sm" />
          )}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
