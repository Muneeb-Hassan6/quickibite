import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-box logout-modal animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Icon */}
        <div className="logout-icon-wrapper">
          <FaSignOutAlt style={{ marginLeft: "5px" }} />
        </div>

        {/* Text */}
        <h3 className="modal-title">Ready to Leave?</h3>
        <p className="logout-modal-desc">
          Are you sure you want to log out of the admin panel? You will need to
          enter your credentials again to access the dashboard.
        </p>

        {/* Action Buttons */}
        <div
          className="modal-actions"
          style={{ marginTop: 0, justifyContent: "center" }}
        >
          <button className="btn-cancel" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="logout-btn-confirm" onClick={onConfirm}>
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
