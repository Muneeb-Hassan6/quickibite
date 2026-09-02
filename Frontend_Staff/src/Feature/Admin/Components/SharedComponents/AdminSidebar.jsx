import { API_BASE } from '../../../../utils/apiHelper';
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
  FaTicketAlt,
  FaUserTie,
  FaDesktop,
  FaQrcode,
  FaMoneyBillWave,
  FaUserShield,
  FaUsers,
  FaStar,
} from "react-icons/fa";

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
}) => {
  const [storeLogo, setStoreLogo] = useState("");
  const [userData, setUserData] = useState({ name: "Admin", role: "Manager" });

  // Fetch user info from session
  useEffect(() => {
    try {
      const rawUser =
        sessionStorage.getItem("staff_session") ||
        sessionStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        setUserData({
          name: parsed.name || parsed.username || "Administrator",
          role: parsed.role || "Admin",
        });
      }
    } catch (e) {
      console.error("Sidebar user parse error", e);
    }
  }, []);

  // Fetch Logo from settings
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/get_settings.php`
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

  const menuSections = [
    {
      title: "Core Operations",
      items: [
        { id: "dashboard", icon: <FaHome />, label: "Overview" },
        { id: "orders", icon: <FaClipboardList />, label: "Live Orders" },
        { id: "menu", icon: <FaUtensils />, label: "Menu & Addons" },
        { id: "deals", icon: <FaTag />, label: "Combos & Deals" },
      ],
    },
    {
      title: "Management & HR",
      items: [
        { id: "customers", icon: <FaUsers />, label: "Customers CRM" },
        { id: "reviews", icon: <FaStar />, label: "Customer Reviews" },
        { id: "inventory", icon: <FaBoxOpen />, label: "Inventory" },
        { id: "staff", icon: <FaUserTie />, label: "Staff & HR" },
        { id: "tables", icon: <FaQrcode />, label: "Tables & QR" },
      ],
    },
    {
      title: "Finance & Store",
      items: [
        { id: "analytics", icon: <FaChartLine />, label: "Analytics" },
        { id: "profit", icon: <FaMoneyBillWave />, label: "Product Profits" },
        { id: "coupons", icon: <FaTicketAlt />, label: "Promo Codes" },
        { id: "homepage_builder", icon: <FaDesktop />, label: "Homepage Builder" },
        { id: "settings", icon: <FaCog />, label: "System Settings" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay (< lg) */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[1040] lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 block" : "opacity-0 pointer-events-none hidden"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main Sidebar Shell (Fixed Drawer on < lg, Static on lg+) */}
      <aside
        className={`w-64 sm:w-72 bg-[var(--admin-panel,#171717)] border-r border-[var(--admin-border,rgba(255,255,255,0.06))] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 fixed inset-y-0 left-0 h-full z-[1050] select-none shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--admin-border,rgba(255,255,255,0.06))] flex items-center justify-between shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt="Store Logo"
                className="max-w-[130px] max-h-9 object-contain"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20">
                  BB
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[var(--admin-text,#fff)] tracking-wider font-['Oswald',sans-serif] uppercase">
                    BigBite Suite
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                    Staff Portal
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-5">
          {menuSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[var(--admin-muted,#9ca3af)]">
                {sec.title}
              </div>
              <ul className="list-none p-0 m-0 space-y-1">
                {sec.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border-none text-left relative ${
                          isActive
                            ? "bg-amber-400/90 dark:bg-amber-500 text-neutral-950 font-bold shadow-sm scale-[1.01]"
                            : "bg-transparent text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span
                          className={`text-sm shrink-0 transition-transform duration-200 ${
                            isActive ? "scale-110 text-neutral-950 font-black" : "text-[var(--admin-muted,#9ca3af)]"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="tracking-wide flex-1 truncate">{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 sm:p-4 border-t border-[var(--admin-border,rgba(255,255,255,0.06))] bg-white/[0.01] shrink-0 space-y-2.5">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xs font-black shrink-0">
              <FaUserShield />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-[var(--admin-text,#fff)] truncate">
                {userData.name}
              </div>
              <div className="text-[10px] text-[var(--admin-muted,#9ca3af)] font-semibold uppercase tracking-wider">
                {userData.role}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <FaSignOutAlt className="text-xs" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
