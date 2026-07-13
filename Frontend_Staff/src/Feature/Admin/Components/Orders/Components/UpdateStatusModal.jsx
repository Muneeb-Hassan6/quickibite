import React, { useState, useEffect } from "react";
import {
  FaFire,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaSyncAlt,
} from "react-icons/fa";

const UpdateStatusModal = ({ order, onClose, onSave }) => {
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (order) setNewStatus(order.status);
  }, [order]);

  if (!order) return null;

  // Helper functions for icons and descriptions
  const getIcon = (status) => {
    if (status === "pending") return <FaClock />;
    if (status === "cooking") return <FaFire />;
    if (status === "delivered") return <FaCheckCircle />;
  };

  const getDesc = (status) => {
    if (status === "pending") return "Order received, waiting for kitchen.";
    if (status === "cooking")
      return "Kitchen is currently preparing this order.";
    if (status === "delivered")
      return "Order has been served/delivered successfully.";
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[9999]" onClick={onClose}>
      <div
        className="w-full max-w-[28.125rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[1rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="bg-[rgba(239,68,68,0.03)] p-[1.875rem_1.25rem_1.25rem] text-center border-b border-[var(--admin-border)] relative">
          <button className="absolute top-[0.938rem] right-[0.938rem] bg-transparent border-none text-[var(--admin-muted)] text-[1rem] cursor-pointer transition-colors duration-200 hover:text-[var(--admin-text)]" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="w-[4.063rem] h-[4.063rem] bg-[rgba(239,68,68,0.1)] text-[var(--admin-orange)] rounded-full flex justify-center items-center text-[1.625rem] mx-auto mb-[0.938rem] shadow-[0_0_25px_rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.2)]">
            <FaSyncAlt />
          </div>
          <h3 className="m-0 text-[1.375rem] font-black text-[var(--admin-text)]">Update Order Status</h3>
          <p className="m-0 mt-[0.313rem] text-[0.813rem] text-[var(--admin-muted)] font-semibold">
            Current tracking ID: <strong>{order.id}</strong>
          </p>
        </div>

        {/* --- STATUS SELECTION CARDS --- */}
        <div className="p-[1.563rem]">
          <div className="flex flex-col gap-[0.75rem]">
            {["pending", "cooking", "delivered"].map((status) => {
              const statusColor = status === "pending" ? "#f59e0b" : status === "cooking" ? "var(--admin-orange)" : "#10b981";
              const isSelected = newStatus === status;
              const selectedBg = status === "pending" ? "rgba(245,158,11,0.15)" : status === "cooking" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)";
              const selectedShadow = status === "pending" ? "0 4px 15px rgba(245,158,11,0.1)" : status === "cooking" ? "0 4px 15px rgba(239,68,68,0.1)" : "0 4px 15px rgba(16,185,129,0.1)";

              return (
                <div
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`flex items-center gap-[0.938rem] p-[1rem_1.25rem] rounded-[0.75rem] bg-transparent border-2 cursor-pointer transition-all duration-300 ${isSelected ? "scale-[1.02]" : ""}`}
                  style={{ 
                    borderColor: isSelected ? statusColor : "var(--admin-border)",
                    backgroundColor: isSelected ? selectedBg : "transparent",
                    boxShadow: isSelected ? selectedShadow : "none"
                  }}
                >
                  <div className="text-[1.5rem]" style={{ color: statusColor }}>{getIcon(status)}</div>

                  <div className="flex-1">
                    <div className="text-[1rem] font-extrabold uppercase transition-colors duration-300" style={{ color: isSelected ? statusColor : "var(--admin-text)" }}>{status}</div>
                    <div className="text-[0.75rem] text-[var(--admin-muted)] font-semibold mt-[0.125rem]">{getDesc(status)}</div>
                  </div>

                  <div className="w-[1.25rem] h-[1.25rem] rounded-full border-2 flex justify-center items-center transition-colors duration-300" style={{ borderColor: isSelected ? statusColor : "var(--admin-muted)" }}>
                    {isSelected && <div className="w-[0.625rem] h-[0.625rem] rounded-full" style={{ backgroundColor: statusColor }}></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- FOOTER BUTTONS --- */}
        <div className="p-[0.938rem_1.563rem] bg-[rgba(0,0,0,0.1)] border-t border-[var(--admin-border)] flex gap-[0.75rem]">
          <button className="flex-1 p-[0.875rem] bg-transparent border border-[var(--admin-border)] text-[var(--admin-muted)] rounded-[0.625rem] font-bold cursor-pointer transition-colors duration-200 hover:text-white hover:border-white" onClick={onClose}>
            Cancel
          </button>
          <button
            className="flex-[2] p-[0.875rem] bg-[var(--admin-orange)] border-none text-white rounded-[0.625rem] font-black text-[0.938rem] flex justify-center items-center gap-[0.5rem] cursor-pointer shadow-[0_4px_15px_rgba(239,68,68,0.3)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)]"
            onClick={() => onSave(order.id, newStatus)}
          >
            <FaCheckCircle /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
