import React from "react";
import { FaSearch, FaPlus } from "react-icons/fa";

const InventoryControls = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onAddClick,
}) => {
  const tabs = ["All", "In Stock", "Low Stock", "Out of Stock"];

  return (
    <div className="flex justify-between items-center mb-[25px] gap-[15px] bg-[var(--admin-panel)] p-[12px_20px] rounded-[16px] flex-wrap shadow-[0_4px_6px_rgba(0,0,0,0.1)] max-md:flex-col max-md:items-stretch">
      {/* Tabs */}
      <div className="flex gap-[5px] bg-[var(--admin-bg)] p-[5px] rounded-[10px] ">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`bg-transparent p-[8px_16px] rounded-[8px] text-[13px] font-bold text-[var(--admin-muted)] cursor-pointer transition-all duration-300 ease uppercase hover:text-[var(--admin-text)] ${activeTab === tab ? "bg-[var(--admin-orange)] text-white" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & Add Button */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div className="relative w-[280px] max-md:w-full">
          <FaSearch className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-[10px_10px_10px_40px] rounded-[10px] outline-none bg-[var(--admin-bg)] text-[var(--admin-text)] text-[14px] transition-all duration-300 "
          />
        </div>
        <button
          className="btn-save bg-[var(--brand-yellow)] rounded px-3 py-2 flex items-center gap-2"
          style={{ flex: "none", margin: 0, width: "auto" }}
          onClick={onAddClick}
        >
          <FaPlus /> <span className="max-md:hidden">Add Product</span>
        </button>
      </div>
    </div>
  );
};

export default InventoryControls;
