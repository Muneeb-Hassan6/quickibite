import React from "react";
import { FaList, FaClock, FaFire, FaCheckCircle } from "react-icons/fa";

const OrderFilterBar = ({ filterStatus, setFilterStatus }) => {
  // Filters ki array with Icons
  const filters = [
    { id: "all", label: "All Orders", icon: <FaList /> },
    { id: "pending", label: "Pending", icon: <FaClock /> },
    { id: "cooking", label: "Cooking", icon: <FaFire /> },
    { id: "delivered", label: "Delivered", icon: <FaCheckCircle /> },
  ];

  return (
    <div className="inline-flex gap-[0.5rem] bg-[var(--admin-panel)] p-[0.5rem] rounded-[0.75rem] mb-[1.563rem] shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex-wrap animate-slide-up">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`flex items-center gap-[0.5rem] border-none py-[0.625rem] px-[1.25rem] rounded text-[0.813rem] font-extrabold cursor-pointer transition-all duration-300 uppercase tracking-[0.5px] ${filterStatus === filter.id ? "bg-[var(--admin-orange)] text-white shadow-[var(--shadow-glow)] -translate-y-[1px]" : "bg-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.03)]"}`}
          onClick={() => setFilterStatus(filter.id)}
        >
          <span className="text-[0.938rem] flex">{filter.icon}</span>
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
};

export default OrderFilterBar;
