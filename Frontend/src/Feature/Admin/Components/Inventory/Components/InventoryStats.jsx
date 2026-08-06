import React from "react";
import { FaCube, FaExclamationTriangle, FaDollarSign } from "react-icons/fa";

const InventoryStats = ({ totalItems, lowStock, totalValue }) => {
  return (
    <div className="stats-grid">
      {/* Card 1: Total Items */}
      <div className="stat-card-premium">
        <div
          className="stat-icon-box"
          style={{ color: "#3b82f6", background: "rgba(59, 130, 246, 0.1)" }}
        >
          <FaCube />
        </div>
        <div>
          <h3>{totalItems}</h3>
          <p>Total Items</p>
        </div>
        <div className="bg-icon-overlay">
          <FaCube />
        </div>
      </div>

      {/* Card 2: Low Stock */}
      <div className="stat-card-premium">
        <div
          className="stat-icon-box"
          style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" }}
        >
          <FaExclamationTriangle />
        </div>
        <div>
          <h3>{lowStock}</h3>
          <p>Low Stock</p>
        </div>
        <div className="bg-icon-overlay">
          <FaExclamationTriangle />
        </div>
      </div>

      {/* Card 3: Total Value */}
      <div className="stat-card-premium">
        <div
          className="stat-icon-box"
          style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}
        >
          <FaDollarSign />
        </div>
        <div>
          <h3>Rs {totalValue}</h3>
          <p>Total Value</p>
        </div>
        <div className="bg-icon-overlay">
          <FaDollarSign />
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
