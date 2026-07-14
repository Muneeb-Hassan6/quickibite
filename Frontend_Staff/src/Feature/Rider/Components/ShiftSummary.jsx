import React from 'react';
import { FaWallet, FaBullseye, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

const ShiftSummary = ({ stats }) => {
    const target = 10;
    const progress = (stats.deliveries / target) * 100;

    return (
        <div className="mt-[25px] bg-[var(--admin-bg)] p-0 rounded-[16px] border-none">
            <h3 className="text-[var(--admin-text)] text-[22px] pb-[5px] mb-[15px] mt-0 uppercase tracking-[1px] font-oswald">Shift Summary</h3>

            <div className="grid grid-cols-3 gap-[15px] mb-[20px]">
                <div className="bg-[var(--admin-panel)] p-[15px] rounded-[16px] text-center  transition-all duration-300 hover:-translate-y-[5px] hover:border-[var(--admin-orange)] hover:shadow-[var(--shadow-glow)]">
                    <div className="text-[var(--admin-muted)] text-[11px] font-bold flex items-center justify-center gap-[6px] uppercase tracking-[0.5px]"><FaMoneyBillWave /> Cash</div>
                    <div className="text-[var(--admin-text)] text-[22px] mt-[8px] font-oswald">Rs. {stats.cashInHand}</div>
                </div>
                <div className="bg-[var(--admin-panel)] p-[15px] rounded-[16px] text-center  transition-all duration-300 hover:-translate-y-[5px] hover:border-[var(--admin-orange)] hover:shadow-[var(--shadow-glow)]">
                    <div className="text-[var(--admin-muted)] text-[11px] font-bold flex items-center justify-center gap-[6px] uppercase tracking-[0.5px]"><FaCreditCard /> Online</div>
                    <div className="text-[var(--admin-text)] text-[22px] mt-[8px] font-oswald">Rs. {stats.onlineCollected}</div>
                </div>
                <div className="bg-[var(--admin-panel)] p-[15px] rounded-[16px] text-center  transition-all duration-300 hover:-translate-y-[5px] hover:border-[var(--admin-orange)] hover:shadow-[var(--shadow-glow)]">
                    <div className="text-[var(--admin-muted)] text-[11px] font-bold flex items-center justify-center gap-[6px] uppercase tracking-[0.5px]"><FaWallet /> Earning</div>
                    <div className="text-[var(--admin-text)] text-[22px] mt-[8px] font-oswald">Rs. {stats.earnings}</div>
                </div>
            </div>

            <div className="bg-[var(--admin-panel)] p-[20px] rounded-[16px] ">
                <div className="flex justify-between text-[var(--admin-text)] text-[13px] font-semibold mb-[12px] uppercase">
                    <span><FaBullseye color="#f59e0b" /> Daily Bonus Target</span>
                    <span>{stats.deliveries} / {target}</span>
                </div>
                <div className="w-full bg-[var(--admin-bg)] rounded-[10px] h-[10px] overflow-hidden my-[10px] ">
                    {/* Width dynamically calculate hoti hai isliye yeh sirf ek inline CSS zaroori hai */}
                    <div className="bg-gradient-to-r from-[#ef4444] to-[#b71c1c] h-full transition-[width] duration-[600ms] ease-out" style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
                </div>
                <div className="text-[var(--admin-muted)] text-[12px] font-medium mt-[10px] text-center">
                    {target - stats.deliveries > 0 ? `Complete ${target - stats.deliveries} more for Rs. 500 bonus!` : "🎉 You hit the daily bonus!"}
                </div>
            </div>
        </div>
    );
};

export default ShiftSummary;