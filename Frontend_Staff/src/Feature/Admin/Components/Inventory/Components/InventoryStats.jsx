import React from "react";
import { FaCube, FaExclamationTriangle, FaDollarSign } from "react-icons/fa";

const InventoryStats = ({ totalItems, lowStock, totalValue }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[24px] mb-[35px]">
      {/* Card 1: Total Items */}
      <div className="bg-[var(--admin-panel)] p-[24px] rounded-[16px] flex items-center gap-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4)] transition-all duration-200 relative overflow-hidden hover:-translate-y-[3px] hover:border-[var(--admin-orange)] group">
        <div
          className="w-[56px] h-[56px] rounded-[12px] flex items-center justify-center text-[28px] z-[2]"
          style={{ color: "#3b82f6", background: "rgba(59, 130, 246, 0.1)" }}
        >
          <FaCube />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-[var(--admin-text)] m-[0_0_5px_0] z-[2] relative">{totalItems}</h3>
          <p className="text-[14px] font-semibold text-[var(--admin-muted)] uppercase m-0 z-[2] relative">Total Items</p>
        </div>
        <div className="absolute -right-[20px] -bottom-[20px] text-[100px] opacity-[0.03] text-[var(--admin-text)] -rotate-[15deg] pointer-events-none z-[1]">
          <FaCube />
        </div>
      </div>

      {/* Card 2: Low Stock */}
      <div className="bg-[var(--admin-panel)] p-[24px] rounded-[16px] flex items-center gap-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4)] transition-all duration-200 relative overflow-hidden hover:-translate-y-[3px] hover:border-[var(--admin-orange)] group">
        <div
          className="w-[56px] h-[56px] rounded-[12px] flex items-center justify-center text-[28px] z-[2]"
          style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" }}
        >
          <FaExclamationTriangle />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-[var(--admin-text)] m-[0_0_5px_0] z-[2] relative">{lowStock}</h3>
          <p className="text-[14px] font-semibold text-[var(--admin-muted)] uppercase m-0 z-[2] relative">Low Stock</p>
        </div>
        <div className="absolute -right-[20px] -bottom-[20px] text-[100px] opacity-[0.03] text-[var(--admin-text)] -rotate-[15deg] pointer-events-none z-[1]">
          <FaExclamationTriangle />
        </div>
      </div>

      {/* Card 3: Total Value */}
      <div className="bg-[var(--admin-panel)] p-[24px] rounded-[16px] flex items-center gap-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4)] transition-all duration-200 relative overflow-hidden hover:-translate-y-[3px] hover:border-[var(--admin-orange)] group">
        <div
          className="w-[56px] h-[56px] rounded-[12px] flex items-center justify-center text-[28px] z-[2]"
          style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}
        >
          <FaDollarSign />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-[var(--admin-text)] m-[0_0_5px_0] z-[2] relative">Rs {totalValue}</h3>
          <p className="text-[14px] font-semibold text-[var(--admin-muted)] uppercase m-0 z-[2] relative">Total Value</p>
        </div>
        <div className="absolute -right-[20px] -bottom-[20px] text-[100px] opacity-[0.03] text-[var(--admin-text)] -rotate-[15deg] pointer-events-none z-[1]">
          <FaDollarSign />
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
