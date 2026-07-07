import React from "react";
import { FaBars, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../../../Context/ThemeContext";

const AdminHeader = ({
  activeTab,
  setIsSidebarOpen,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="admin-header">
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          className="mobile-admin-toggle"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars />
        </button>
        <div className="admin-title">
          <h2 style={{ textTransform: "capitalize" }}>{activeTab}</h2>
          <p className="d-none d-md-block">Manage your {activeTab} here</p>
        </div>
      </div>

      <button onClick={toggleTheme} className="theme-toggle-btn" title={theme === "dark" ? "Light Mode" : "Dark Mode"}>
        {theme === "dark" ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  );
};

export default AdminHeader;
