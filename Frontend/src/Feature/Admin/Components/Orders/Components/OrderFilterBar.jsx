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
    <div className="premium-filter-container animate-slide-up">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`premium-filter-btn ${filterStatus === filter.id ? "active" : ""}`}
          onClick={() => setFilterStatus(filter.id)}
        >
          <span className="filter-icon">{filter.icon}</span>
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
};

export default OrderFilterBar;
