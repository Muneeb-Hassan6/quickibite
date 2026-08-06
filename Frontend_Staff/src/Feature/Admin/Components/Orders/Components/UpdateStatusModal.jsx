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
    <div className="us-modal-overlay" onClick={onClose}>
      <div
        className="us-modal-box animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="us-header">
          <button className="us-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="us-icon-circle">
            <FaSyncAlt />
          </div>
          <h3 className="us-title">Update Order Status</h3>
          <p className="us-subtitle">
            Current tracking ID: <strong>{order.id}</strong>
          </p>
        </div>

        {/* --- STATUS SELECTION CARDS --- */}
        <div className="us-body">
          <div className="us-status-list">
            {["pending", "cooking", "delivered"].map((status) => (
              <div
                key={status}
                onClick={() => setNewStatus(status)}
                className={`us-status-card ${status} ${newStatus === status ? "selected" : ""}`}
              >
                <div className="us-card-icon">{getIcon(status)}</div>

                <div className="us-card-text">
                  <div className="us-card-title">{status}</div>
                  <div className="us-card-desc">{getDesc(status)}</div>
                </div>

                <div className="us-radio-circle">
                  {newStatus === status && <div className="us-radio-dot"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- FOOTER BUTTONS --- */}
        <div className="us-footer">
          <button className="us-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="us-btn-save"
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
