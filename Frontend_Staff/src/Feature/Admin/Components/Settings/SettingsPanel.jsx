import React, { useState } from "react";
import {
  FaStore,
  FaMotorcycle,
  FaDollarSign,
  FaBell,
  FaLock,
  FaFileAlt,
} from "react-icons/fa";

// Import All Tab Components
import GeneralSettings from "./Components/GeneralSettings";
import OperationalSettings from "./Components/OperationalSettings";
import FinancialSettings from "./Components/FinancialSettings";
import NotificationSettings from "./Components/NotificationSettings";
import LegalSettings from "./Components/LegalSettings";
import SecuritySettings from "./Components/SecuritySettings";

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General Info", icon: <FaStore /> },
    { id: "operations", label: "Operations", icon: <FaMotorcycle /> },
    { id: "finance", label: "Financial", icon: <FaDollarSign /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "legal", label: "Legal & Content", icon: <FaFileAlt /> },
    { id: "security", label: "Security", icon: <FaLock /> },
  ];

  return (
    <div>
      <div className="mb-[1.875rem]">
        <h2 className="text-[1.375rem] font-bold text-[var(--admin-text)] flex items-center gap-[0.5rem] mb-[0.313rem]">
          System Settings
        </h2>
        <p className="text-[var(--admin-muted)] text-[0.875rem] m-0">
          Configure your restaurant operations, delivery rules, and legal content.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-[1.875rem] max-w-[68.75rem] mx-auto pb-[5rem] items-start">
        {/* Left Sub-Navigation */}
        <div className="w-full md:w-[15.625rem] bg-[var(--admin-panel)] rounded-[1rem] p-[0.938rem] flex flex-col gap-[0.5rem] md:sticky md:top-[1.25rem]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`bg-transparent border-none p-[0.875rem_1.25rem] rounded-[0.625rem] text-[0.875rem] font-semibold text-left flex items-center gap-[0.75rem] cursor-pointer transition-all duration-300 whitespace-nowrap md:whitespace-normal ${
                activeTab === tab.id
                  ? "bg-[var(--admin-orange)] text-white shadow-[var(--shadow-glow)]"
                  : "text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--admin-text)]"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-[1.125rem]">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col gap-[1.563rem] w-full">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "operations" && <OperationalSettings />}
          {activeTab === "finance" && <FinancialSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "legal" && <LegalSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
