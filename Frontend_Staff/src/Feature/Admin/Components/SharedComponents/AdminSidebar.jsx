import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaClipboardList,
  FaUtensils,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBoxOpen,
  FaTag,
  FaUserTie,
  FaDesktop,
  FaQrcode,
  FaMoneyBillWave
} from "react-icons/fa"; // 🔥 FaTimes yahan se nikal diya hai

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
}) => {
  const [storeLogo, setStoreLogo] = useState("");

  // 🔥 Fetch Logo from settings
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
        console.error("Sidebar: Failed to load logo", error);
      }
    };
    fetchLogo();
  }, []);

  const menuItems = [
    { id: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { id: "orders", icon: <FaClipboardList />, label: "Orders" },
    { id: "menu", icon: <FaUtensils />, label: "Menu" },
    { id: "deals", icon: <FaTag />, label: "Combos & Deals" },
    { id: "inventory", icon: <FaBoxOpen />, label: "Inventory" },
    { id: "staff", icon: <FaUserTie />, label: "Staff & HR" },
    { id: "analytics", icon: <FaChartLine />, label: "Analytics" },
    { id: "profit", icon: <FaMoneyBillWave />, label: "Product Profits" },
    { id: "tables", icon: <FaQrcode />, label: "Tables & QR" },
    { id: "homepage_builder", icon: <FaDesktop />, label: "Homepage Builder" },
    { id: "settings", icon: <FaCog />, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Overlay (Click karne par sidebar band ho jayega) */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] z-[1040] md:hidden ${isSidebarOpen ? "block" : "hidden"}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Main Sidebar */}
      <div className={`w-[17.5rem] bg-[var(--admin-panel)] shadow-[4px_0_24px_rgba(0,0,0,0.04)] flex flex-col p-[1.25rem] transition-transform duration-300 overflow-y-auto overflow-x-hidden md:relative md:translate-x-0 fixed top-0 left-0 h-full z-[1050] ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* 🔥 Header / Dynamic Logo (Cross Removed & Centered) */}
        <div className="flex justify-center items-center pb-[1.25rem] mb-[1.25rem] border-b border-[var(--admin-border)] shrink-0">
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="Store Logo"
              className="max-w-[9.375rem] max-h-[3.75rem] object-contain"
            />
          ) : (
            <span className="text-[1.5rem] font-black text-red-500 tracking-[2px]">
              ADMIN
            </span>
          )}
        </div>

        {/* Menu Items Loop */}
        <ul className="list-none p-0 m-0 flex flex-col gap-[0.625rem]">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-[0.938rem] p-[0.75rem_0.938rem] rounded-[0.625rem] no-underline text-[1rem] transition-all duration-300 cursor-pointer ${activeTab === item.id ? "bg-red-500 text-white font-bold shadow-[var(--shadow-glow)] hover:translate-x-0" : "text-[var(--admin-muted)] font-medium hover:bg-[rgba(128,128,128,0.1)] hover:text-[var(--admin-text)] hover:translate-x-1"}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
            >
              <div className="text-[1.125rem] w-[1.563rem] text-center flex items-center justify-center">{item.icon}</div> <span>{item.label}</span>
            </li>
          ))}
        </ul>

        {/* Footer / Logout */}
        <div className="mt-auto pt-[1.25rem] shrink-0">
          <button onClick={handleLogout} className="w-full p-[0.75rem] bg-[rgba(239,68,68,0.1)] text-red-500 border border-[rgba(239,68,68,0.3)] rounded-[0.5rem] flex items-center justify-center gap-[0.5rem] font-bold cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500">
            <FaSignOutAlt className="mr-[0.5rem]" /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
