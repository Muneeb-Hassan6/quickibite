import React, { useState } from 'react';

const DeliveryHistory = ({ history }) => {
    // Naya state jo toggle karega ki sab dikhana hai ya nahi
    const [showAll, setShowAll] = useState(false);

    if (!history || history.length === 0) return null;

    // Agar showAll true hai to puri history, warna sirf aakhri 5
    const displayHistory = showAll ? history : history.slice(0, 5);

    return (
        <div className="dashboard-card">
            <div className="history-header-row">
                <h3 className="dashboard-title" style={{ border: 'none', margin: 0, padding: 0 }}>
                    {showAll ? "Full Delivery History" : "Recent Deliveries"}
                </h3>
                <span className="history-count-badge">Total: {history.length}</span>
            </div>

            {displayHistory.map((item, index) => (
                <div key={index} className="history-item">
                    <div>
                        <span className="history-id">#{item.id}</span> - {item.customer}
                        <div className="history-time">{item.time}</div>
                    </div>
                    <div className="history-earning">+Rs {item.earnings}</div>
                </div>
            ))}

            {/* Ab ye button toggle ka kaam karega */}
            {history.length > 5 && (
                <div className="btn-view-all" onClick={() => setShowAll(!showAll)}>
                    {showAll ? "Show Less" : "View All History"}
                </div>
            )}
        </div>
    );
};

export default DeliveryHistory;