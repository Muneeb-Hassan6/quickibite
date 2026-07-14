import React, { useState } from 'react';

const DeliveryHistory = ({ history }) => {
    // Naya state jo toggle karega ki sab dikhana hai ya nahi
    const [showAll, setShowAll] = useState(false);

    if (!history || history.length === 0) return null;

    // Agar showAll true hai to puri history, warna sirf aakhri 5
    const displayHistory = showAll ? history : history.slice(0, 5);

    return (
        <div className="mt-[25px] bg-[var(--admin-bg)] p-0 rounded-[16px] ">
            <div className="flex justify-between items-center mb-[15px]">
                <h3 className="text-[var(--admin-text)] text-[22px] pb-[5px] mb-[15px] mt-0 uppercase tracking-[1px] font-oswald" >
                    {showAll ? "Full Delivery History" : "Recent Deliveries"}
                </h3>
                <span className="text-[12px] text-[var(--admin-muted)] font-semibold">Total: {history.length}</span>
            </div>

            {displayHistory.map((item, index) => (
                <div key={index} className="bg-[var(--admin-panel)] flex justify-between items-center p-[15px] text-[14px]  rounded-[12px] mb-[10px] transition-all duration-300 ">
                    <div>
                        <span className="text-[var(--admin-text)] font-bold text-[14px] font-oswald tracking-[0.5px]">#{item.id}</span> - {item.customer}
                        <div className="text-[12px] text-[var(--admin-muted)] mt-[4px]">{item.time}</div>
                    </div>
                    <div className="text-[var(--admin-text)] font-bold text-[16px] bg-[rgba(255,255,255,0.05)] p-[4px_10px] rounded-[8px] font-oswald">+Rs {item.earnings}</div>
                </div>
            ))}

            {/* Ab ye button toggle ka kaam karega */}
            {history.length > 5 && (
                <div className="text-center mt-[15px] text-[var(--admin-orange)] text-[13px] cursor-pointer font-bold uppercase tracking-[0.5px]" onClick={() => setShowAll(!showAll)}>
                    {showAll ? "Show Less" : "View All History"}
                </div>
            )}
        </div>
    );
};

export default DeliveryHistory;