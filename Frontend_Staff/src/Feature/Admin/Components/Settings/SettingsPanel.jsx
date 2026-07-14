import React, { useState } from "react";
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
    { id: "security", label: "Security", icon: <FaLock /> },
  ];

  return (
    <div>
      <div className="mb-[1.875rem]">
        <h2 className="text-[1.375rem] font-bold text-[var(--admin-text)] flex items-center gap-[0.5rem] mb-[0.313rem]">
          System Settings
        </h2>
        <p className="text-[var(--admin-muted)] text-[0.875rem] m-0">
          Configure your restaurant operations and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-[1.875rem] max-w-[68.75rem] mx-auto pb-[5rem] items-start">
        <div className="w-full md:w-[15.625rem] bg-[var(--admin-panel)] rounded-[1rem] p-[0.938rem] flex flex-col gap-[0.5rem] md:sticky md:top-[1.25rem]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`bg-transparent border-none p-[0.875rem_1.25rem] rounded-[0.625rem] text-[0.875rem] font-semibold text-left flex items-center gap-[0.75rem] cursor-pointer transition-all duration-300 whitespace-nowrap md:whitespace-normal ${activeTab === tab.id ? "bg-[var(--admin-orange)] text-white shadow-[var(--shadow-glow)]" : "text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--admin-text)]"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-[1.125rem]">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col gap-[1.563rem] w-full">
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
          {activeTab === "security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
