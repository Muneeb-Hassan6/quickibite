import React from 'react';
import { FaWallet, FaBullseye, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

const ShiftSummary = ({ stats }) => {
    const target = 10;
    const progress = (stats.deliveries / target) * 100;

    return (
        <div className="dashboard-card">
            <h3 className="dashboard-title">Shift Summary</h3>

            <div className="summary-grid-3">
                <div className="summary-box-new">
                    <div className="icon-red"><FaMoneyBillWave /> Cash</div>
                    <div className="summary-val-new">Rs. {stats.cashInHand}</div>
                </div>
                <div className="summary-box-new">
                    <div className="icon-blue"><FaCreditCard /> Online</div>
                    <div className="summary-val-new">Rs. {stats.onlineCollected}</div>
                </div>
                <div className="summary-box-new">
                    <div className="icon-green"><FaWallet /> Earning</div>
                    <div className="summary-val-new">Rs. {stats.earnings}</div>
                </div>
            </div>

            <div className="progress-container">
                <div className="summary-target-text">
                    <span><FaBullseye color="#f59e0b" /> Daily Bonus Target</span>
                    <span>{stats.deliveries} / {target}</span>
                </div>
                <div className="progress-bar-bg">
                    {/* Width dynamically calculate hoti hai isliye yeh sirf ek inline CSS zaroori hai */}
                    <div className="progress-bar-fill" style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
                </div>
                <div className="summary-bonus-text">
                    {target - stats.deliveries > 0 ? `Complete ${target - stats.deliveries} more for Rs. 500 bonus!` : "🎉 You hit the daily bonus!"}
                </div>
            </div>
        </div>
    );
};

export default ShiftSummary;