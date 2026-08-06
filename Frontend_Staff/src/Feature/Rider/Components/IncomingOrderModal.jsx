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
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="bell-icon-wrapper"><FaBell size={50} color="#f59e0b" /></div>
                <h2 className="incoming-modal-title">New Order!</h2>
                <div className={`payment-badge ${isOnlinePaid ? 'badge-online' : 'badge-cod'}`}>{order.paymentType}</div>
                <p className="incoming-modal-text"><strong>Pickup:</strong> QuickBite Kitchen</p>
                <p className="incoming-modal-text last"><strong>Dropoff:</strong> {order.address}</p>
                <div className="modal-timer">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
                <div className="modal-actions">
                    <button onClick={onDecline} className="btn-decline"><FaTimes /> Decline</button>
                    <button onClick={onAccept} className="btn-accept"><FaCheck /> Accept</button>
                </div>
            </div>
        </div>
    );
};
export default IncomingOrderModal;