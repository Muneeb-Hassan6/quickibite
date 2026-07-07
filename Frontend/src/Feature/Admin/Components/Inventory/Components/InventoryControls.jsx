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
    <div className="inventory-controls">
      {/* Tabs */}
      <div className="inv-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`inv-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & Add Button */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <div className="inv-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="btn-save"
          style={{ flex: "none", margin: 0, width: "auto" }}
          onClick={onAddClick}
        >
          <FaPlus style={{ marginRight: "8px" }} /> Add Product
        </button>
      </div>
    </div>
  );
};

export default InventoryControls;
