// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 🔥 Navigate import kiya
import Swal from "sweetalert2"; // 🔥 Premium Alerts ke liye Swal import kiya
import "./styles/index.css";

// Components Import
import AdminSidebar from "./Components/SharedComponents/AdminSidebar";
import AdminHeader from "./Components/SharedComponents/AdminHeader";
import DashboardHome from "./DashboardHome";
import OrdersManager from "./Components/Orders/OrdersManager";
import MenuManager from "./Components/Menu/MenuManager";
import InventoryDashboard from "./Components/Inventory/InventoryManager";
import StaffDashboard from "./Components/Staff/StaffDashboard";
import AnalyticsPanel from "./Components/Analytics/AnalyticsPanel";
import SettingsPanel from "./Components/Settings/SettingsPanel";
import DealsDashboard from "./Components/Deals/DealsDashboard"; // 🔥 Deals Dashboard Import
import HomepageBuilder from "./Components/HomepageBuilder/HomepageBuilder"; // 🔥 Homepage Builder Import
import TableManager from "./Components/Tables/TableManager"; // 🔥 Table Manager Import
import ProductProfitTab from "./Components/ProductProfitTab/ProductProfitTab"; // 🔥 Product Profit Import

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate(); // 🔥 Hook initialize kiya

  // 1. Initial state ab localStorage se aayegi
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("adminActiveTab");
    return savedTab ? savedTab : "dashboard";
  });

  // 2. Jab bhi tab change ho, usey localStorage mein save kar lo
  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  // Theme Toggle Logic
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

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
        // 1. Dono Sessions ko jarr se khatam karein (Unified Auth wale)
        sessionStorage.removeItem("staff_session");
        sessionStorage.removeItem("user");

        // 2. Active tab ka data bhi remove karein taake agla banda fresh start kare
        sessionStorage.removeItem("adminActiveTab");

        // 3. Wapis Login page par bhej dein (replace: true se browser history clear ho jayegi)
        navigate("/login", { replace: true });
      }
    });
  };

  // Content Switcher
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome setActiveTab={setActiveTab} />;
      case "orders":
        return <OrdersManager />;
      case "menu":
        return <MenuManager />;
      case "inventory":
        return <InventoryDashboard />;
      case "staff":
        return <StaffDashboard />;
      case "analytics":
        return <AnalyticsPanel />;
      case "settings":
        return <SettingsPanel />;
      case "profit":
        return <ProductProfitTab />;
      case "deals":
        return <DealsDashboard />;
      case "tables":
        return <TableManager />;
      case "homepage_builder":
        return <HomepageBuilder />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar Component */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />

      <div className="admin-main">
        {/* Header Component */}
        <AdminHeader
          activeTab={activeTab}
          setIsSidebarOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        {/* Dynamic Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
