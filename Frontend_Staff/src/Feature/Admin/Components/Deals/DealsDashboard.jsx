import React, { useState } from "react";
import DealMaker from "./DealMaker";
import DealList from "./DealList";
import { LuLayers, LuCirclePlus } from "react-icons/lu";
import { useTheme } from "../../../../Context/ThemeContext";

const DealsDashboard = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [activeSubTab, setActiveSubTab] = useState("manage");
  const [dealToEdit, setDealToEdit] = useState(null);

  const handleEditDeal = (deal) => {
    setDealToEdit(deal);
    setActiveSubTab("create");
  };

  const clearEdit = () => {
    setDealToEdit(null);
    setActiveSubTab("manage");
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Tabs Toggle */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={clearEdit}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
            activeSubTab === "manage"
              ? "bg-amber-400 text-neutral-950 border border-amber-400 shadow-amber-400/20"
              : isDarkMode
              ? "bg-[#18181b] hover:bg-[#27272a] text-neutral-300 border border-neutral-800"
              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
          }`}
        >
          <LuLayers className="w-4 h-4" /> Manage Deals
        </button>
        <button
          type="button"
          onClick={() => {
            setDealToEdit(null);
            setActiveSubTab("create");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
            activeSubTab === "create"
              ? "bg-amber-400 text-neutral-950 border border-amber-400 shadow-amber-400/20"
              : isDarkMode
              ? "bg-[#18181b] hover:bg-[#27272a] text-neutral-300 border border-neutral-800"
              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
          }`}
        >
          <LuCirclePlus className="w-4 h-4" />{" "}
          {dealToEdit ? "Edit Deal" : "Create New Deal"}
        </button>
      </div>

      {/* Content View */}
      {activeSubTab === "manage" ? (
        <DealList onEdit={handleEditDeal} />
      ) : (
        <DealMaker editDeal={dealToEdit} onSuccess={clearEdit} />
      )}
    </div>
  );
};

export default DealsDashboard;
