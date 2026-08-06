import React from 'react';
import { FaInfoCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

const CustomAlert = ({ isOpen, message, onClose, type = "info" }) => {
    if (!isOpen) return null;

    // Dynamically set icons based on notification type
    const getIcon = () => {
        if (type === 'warning') return <FaExclamationTriangle />;
        if (type === 'danger') return <FaTimesCircle />;
        return <FaInfoCircle />;
    };

    const getTitle = () => {
        if (type === 'warning') return 'Attention!';
        if (type === 'danger') return 'Error!';
        return 'Notification';
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Glowing Icon */}
                <div className={`modal-icon-wrapper ${type}`}>
                    {getIcon()}
                </div>

                <h3 className={`custom-alert-title`}>
                    {getTitle()}
                </h3>

                <p className="custom-alert-text">
                    {message}
                </p>

                <button className="btn-acknowledge" onClick={onClose}>
                    Okay, Got It
                </button>
            </div>
        </div>
    );
};

export default CustomAlert;