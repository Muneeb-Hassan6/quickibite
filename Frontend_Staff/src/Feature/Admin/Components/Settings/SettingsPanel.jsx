import React, { useState } from "react";
import "./styles/index.css";
import {
  FaStore,
  FaMotorcycle,
  FaDollarSign,
  FaBell,
  FaLock,
  FaSave,
  FaUndo,
} from "react-icons/fa";

// Import All Tab Components
import GeneralSettings from "./Components/GeneralSettings";
import OperationalSettings from "./Components/OperationalSettings";
import FinancialSettings from "./Components/FinancialSettings";
import NotificationSettings from "./Components/NotificationSettings";
import SecuritySettings from "./Components/SecuritySettings";
import FooterSettings from "./Components/FooterSettings";

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState("general");

  // Global Centralized State
  const [settings, setSettings] = useState({
    storeName: "QuickBite Restaurant",
    phone: "+92 300 1234567",
    address: "Gulberg III, Lahore",
    minOrder: "500",
    deliveryRadius: "10",
    taxRate: "16",
    deliveryFee: "150",
    acceptOrders: true,
    acceptCards: true,
    soundAlert: true,
    emailNotif: false,
    stockAlerts: true,
  });

  const handleChange = (e) =>
    setSettings({ ...settings, [e.target.name]: e.target.value });
  const handleToggle = (e) =>
    setSettings({ ...settings, [e.target.name]: e.target.checked });

  const handleSave = () => {
    alert("Settings Updated Successfully!");
    console.log("Saving Data to API:", settings);
  };

  const tabs = [
    { id: "general", label: "General Info", icon: <FaStore /> },
    { id: "operations", label: "Operations", icon: <FaMotorcycle /> },
    { id: "finance", label: "Financial", icon: <FaDollarSign /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "footer", label: "Footer", icon: <FaStore /> }, // using FaStore for footer as a generic layout icon, or maybe we can import FaLayerGroup if available. We will just use FaSave or something else if needed, but for now we'll stick to FaStore or omit
    { id: "security", label: "Security", icon: <FaLock /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h2 className="section-header" style={{ marginBottom: "5px" }}>
          System Settings
        </h2>
        <p style={{ color: "var(--admin-muted)", fontSize: "14px", margin: 0 }}>
          Configure your restaurant operations and preferences.
        </p>
      </div>

      <div className="settings-page-wrapper">
        {/* Left Sidebar Tabs */}
        <div className="settings-sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="settings-content-area">
          {activeTab === "general" && (
            <GeneralSettings settings={settings} handleChange={handleChange} />
          )}
          {activeTab === "operations" && (
            <OperationalSettings
              settings={settings}
              handleChange={handleChange}
              handleToggle={handleToggle}
            />
          )}
          {activeTab === "finance" && (
            <FinancialSettings
              settings={settings}
              handleChange={handleChange}
              handleToggle={handleToggle}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationSettings
              settings={settings}
              handleToggle={handleToggle}
            />
          )}
          {activeTab === "footer" && <FooterSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </div>
      </div>

      
    </div>
  );
};

export default SettingsPanel;
