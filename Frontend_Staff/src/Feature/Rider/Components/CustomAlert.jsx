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
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.75)] backdrop-blur-[8px] flex justify-center items-center z-[10000]">
            <div className="bg-gradient-to-br from-[#1e1e1e] to-[#121212] p-[35px_30px] rounded-[20px] w-[90%] max-w-[400px] text-center text-[var(--text-main,#ffffff)] shadow-[0_15px_50px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.05)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-[60%] before:h-[4px] before:bg-gradient-to-r before:from-transparent before:via-[#ef4444] before:to-transparent before:rounded-[10px]">
                {/* Glowing Icon */}
                <div className={`w-[75px] h-[75px] rounded-full flex justify-center items-center mx-auto mb-[20px] text-[32px] transition-all duration-300 ${type === 'warning' ? 'text-[#f59e0b] bg-[rgba(245,158,11,0.15)] shadow-[0_0_25px_rgba(245,158,11,0.4)]' : type === 'info' ? 'text-[#3b82f6] bg-[rgba(59,130,246,0.15)] shadow-[0_0_25px_rgba(59,130,246,0.4)]' : 'text-[#ef4444] bg-[rgba(239,68,68,0.15)] shadow-[var(--shadow-glow)]'}`}>
                    {getIcon()}
                </div>

                <h3 className="m-[0_0_10px_0] text-[24px] font-extrabold font-oswald uppercase tracking-[1.5px]">
                    {getTitle()}
                </h3>

                <p className="text-[#a3a3a3] mb-[25px] leading-[1.6] text-[15px] font-medium">
                    {message}
                </p>

                <button className="bg-gradient-to-r from-[#ef4444] to-[#b91c1c] text-white border-none p-[14px_0] rounded-[12px] font-bold text-[16px] w-full cursor-pointer transition-all duration-300 font-oswald uppercase tracking-[1px] shadow-[var(--shadow-glow)] hover:-translate-y-[3px] hover:shadow-[var(--shadow-glow)]" onClick={onClose}>
                    Okay, Got It
                </button>
            </div>
        </div>
    );
};

export default CustomAlert;