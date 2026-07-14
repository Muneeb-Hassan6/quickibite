import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const AssignmentBar = ({ order, rider, onConfirm }) => {
    if (!order || !rider) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--admin-bg)] backdrop-blur-[10px] p-[15px_40px] flex justify-between items-center z-[100] animate-slide-up shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
            <div>
                <span className="text-[16px]">
                    Assigning <strong className="text-[var(--brand-red)]">Order #{order.id}</strong> to <strong className="text-[var(--brand-red)]">{rider.name}</strong>
                </span>
            </div>
            <button className="bg-[var(--brand-red)] text-white p-[10px_24px] rounded text-[15px] font-bold cursor-pointer flex items-center gap-[8px] transition-all duration-300 hover:bg-[#dc2626] hover:scale-105" onClick={onConfirm}>
                <FaCheckCircle /> Confirm Assignment
            </button>
        </div>
    );
};

export default AssignmentBar;