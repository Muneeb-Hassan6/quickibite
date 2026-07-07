import React from "react";

const BottomStats = ({ stats }) => {
    return (
        <div className="bottom-stats-bar">
            <div className="bottom-stat-item">
                <div className="bottom-stat-val">{stats.deliveries}</div>
                <div className="bottom-stat-label">Deliveries</div>
            </div>
            <div className="bottom-stat-item">
                <div className="bottom-stat-val" style={{ color: '#10b981' }}>Rs {stats.earnings}</div>
                <div className="bottom-stat-label">Earned Today</div>
            </div>
        </div>
    );
};
export default BottomStats;