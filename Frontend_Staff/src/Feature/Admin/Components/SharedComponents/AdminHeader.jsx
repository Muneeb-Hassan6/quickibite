import React from "react";
import { FaBars, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../../../Context/ThemeContext";

const AdminHeader = ({
  activeTab,
  setIsSidebarOpen,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex justify-start md:justify-between items-center mb-[1.875rem] w-full gap-[0.938rem] md:gap-0">
      <div className="flex items-center">
        <button
          className="block md:hidden cursor-pointer text-[var(--admin-text)] text-[1.5rem] bg-transparent border-none mr-[0.938rem]"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars />
        </button>
        <div>
          <h2 className="m-0 text-[1.75rem] font-extrabold text-[var(--admin-text)] capitalize">{activeTab}</h2>
          <p className="hidden md:block text-[var(--admin-muted)] m-0 mt-[0.313rem] text-[0.875rem]">Manage your {activeTab} here</p>
        </div>
      </div>

      <button onClick={toggleTheme} className="theme-toggle-btn ml-auto md:ml-0" title={theme === "dark" ? "Light Mode" : "Dark Mode"}>
        {theme === "dark" ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  );
};

export default AdminHeader;
