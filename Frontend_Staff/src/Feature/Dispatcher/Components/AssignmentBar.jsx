import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const AssignmentBar = ({ order, rider, onConfirm }) => {
    if (!order || !rider) return null;

    return (
        <div className="assignment-bar animate-slide-up">
            <div className="assignment-details">
                <span className="assign-text">
                    Assigning <strong>Order #{order.id}</strong> to <strong>{rider.name}</strong>
                </span>
            </div>
            <button className="btn-assign" onClick={onConfirm}>
                <FaCheckCircle /> Confirm Assignment
            </button>
        </div>
    );
};

export default AssignmentBar;