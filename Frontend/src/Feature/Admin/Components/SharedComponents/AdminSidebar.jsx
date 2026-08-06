import React, { useState, useEffect } from "react";
import "../../styles/AdminSidebar.css";
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
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Main Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        {/* 🔥 Header / Dynamic Logo (Cross Removed & Centered) */}
        <div className="sidebar-logo-container">
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="Store Logo"
              className="sidebar-logo-img"
            />
          ) : (
            <span className="sidebar-logo-text">
              ADMIN
            </span>
          )}
        </div>

        {/* Menu Items Loop */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`menu-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
            >
              {item.icon} <span>{item.label}</span>
            </li>
          ))}
        </ul>

        {/* Footer / Logout */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn-style">
            <FaSignOutAlt style={{ marginRight: "8px" }} /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
