import React, { useEffect, useState } from 'react';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';

const IncomingOrderModal = ({ order, onAccept, onDecline }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (!order) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timer); onDecline(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [order, onDecline]);

    if (!order) return null;
    const isOnlinePaid = order.paymentType === "Paid Online";

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.75)] backdrop-blur-[8px] flex justify-center items-center z-[10000]">
            <div className="bg-[var(--admin-panel)] p-[35px_30px] rounded-[20px] w-[90%] max-w-[400px] text-center text-[var(--admin-text)] shadow-[0_15px_50px_rgba(0,0,0,0.2)]">
                <div className="w-[80px] h-[80px] bg-[rgba(239,68,68,0.1)] text-[#ef4444] rounded-full flex items-center justify-center text-[36px] m-[0_auto_20px] shadow-[var(--shadow-glow)] animate-pulse"><FaBell size={50} className="text-[var(--brand-yellow)]" /></div>
                <h2 className="text-[var(--admin-text)] m-[0_0_10px_0] font-bold text-[24px]">New Order!</h2>
                <div className="inline-block p-[6px_12px] rounded-[8px] text-[12px] font-semibold mb-[15px] uppercase bg-[var(--admin-bg)] text-[var(--admin-text)] shadow-sm">{order.paymentType}</div>
                <p className="text-[var(--admin-muted)] text-[14px] mb-[5px]"><strong className="text-[var(--admin-text)]">Pickup:</strong> QuickBite Kitchen</p>
                <p className="text-[var(--admin-muted)] text-[14px] mb-[15px]"><strong className="text-[var(--admin-text)]">Dropoff:</strong> {order.address}</p>
                <div className="text-[var(--admin-orange)] text-[36px] mb-[20px] font-oswald">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
                <div className="flex gap-[10px]">
                    <button onClick={onDecline} className="w-full bg-transparent text-[var(--admin-text)] border border-[var(--admin-border)] p-[12px] rounded font-bold cursor-pointer flex-1 uppercase flex items-center justify-center gap-[5px]"><FaTimes /> Decline</button>
                    <button onClick={onAccept} className="bg-gradient-to-br from-[#ef4444] to-[#b71c1c] text-[var(--text-main,#ffffff)] border-none p-[12px_25px] rounded font-extrabold cursor-pointer flex-1 uppercase font-oswald flex items-center justify-center gap-[5px]"><FaCheck /> Accept</button>
                </div>
            </div>
        </div>
    );
};
export default IncomingOrderModal;