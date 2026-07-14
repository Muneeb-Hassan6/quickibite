import React from "react";

const BottomStats = ({ stats }) => {
    return (
        <div className="absolute bottom-0 left-0 w-full bg-[var(--admin-panel)]  flex justify-around p-[15px_0_20px_0] z-[100]">
            <div className="text-center">
                <div className="text-[var(--admin-text)] text-[22px] font-oswald">{stats.deliveries}</div>
                <div className="text-[var(--admin-muted)] text-[11px] font-semibold mt-[5px] uppercase">Deliveries</div>
            </div>
            <div className="text-center">
                <div className="text-[var(--admin-text)] text-[22px] font-oswald" style={{ color: '#10b981' }}>Rs {stats.earnings}</div>
                <div className="text-[var(--admin-muted)] text-[11px] font-semibold mt-[5px] uppercase">Earned Today</div>
            </div>
        </div>
    );
};
export default BottomStats;