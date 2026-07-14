import React from "react";
import {
  FaChartLine,
  FaStopwatch,
  FaMotorcycle,
  FaCheckDouble,
  FaBoxOpen,
} from "react-icons/fa";

const DispatchStats = ({
  readyCount,
  freeRiders,
  avgDeliveryTime,
  completedToday,
}) => {
  return (
    <div className="grid grid-cols-4 gap-[20px] p-[15px_40px_0] max-w-full animate-slide-up">
      <div className="bg-[var(--admin-panel)] rounded-[12px] p-[15px] flex items-center gap-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="w-[45px] h-[45px] rounded-[10px] flex items-center justify-center text-[18px] text-white bg-gradient-to-br from-[#ef4444] to-[#b91c1c] shadow-[var(--shadow-glow)]">
          <FaBoxOpen />
        </div>
        <div>
          <span className="text-[11px] text-[var(--admin-muted)] uppercase font-bold">Pending Dispatch</span>
          <h4 className="m-[2px_0_0_0] text-[18px] text-[var(--text-main,#ffffff)] font-oswald">{readyCount || 0} Orders</h4>
        </div>
      </div>

      <div className="bg-[var(--admin-panel)] rounded-[12px] p-[15px] flex items-center gap-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="w-[45px] h-[45px] rounded-[10px] flex items-center justify-center text-[18px] text-white bg-gradient-to-br from-[#10b981] to-[#047857] shadow-[0_4px_10px_rgba(16,185,129,0.3)]">
          <FaMotorcycle />
        </div>
        <div>
          <span className="text-[11px] text-[var(--admin-muted)] uppercase font-bold">Available Riders</span>
          <h4 className="m-[2px_0_0_0] text-[18px] text-[var(--text-main,#ffffff)] font-oswald">{freeRiders || 0} Free</h4>
        </div>
      </div>

      <div className="bg-[var(--admin-panel)] rounded-[12px] p-[15px] flex items-center gap-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="w-[45px] h-[45px] rounded-[10px] flex items-center justify-center text-[18px] text-white bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
          <FaStopwatch />
        </div>
        <div>
          <span className="text-[11px] text-[var(--admin-muted)] uppercase font-bold">Avg. Delivery Time</span>
          {/* Yahan prop use kiya hai */}
          <h4 className="m-[2px_0_0_0] text-[18px] text-[var(--text-main,#ffffff)] font-oswald">{avgDeliveryTime || 0} Mins</h4>
        </div>
      </div>

      <div className="bg-[var(--admin-panel)] rounded-[12px] p-[15px] flex items-center gap-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="w-[45px] h-[45px] rounded-[10px] flex items-center justify-center text-[18px] text-white bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-[0_4px_10px_rgba(139,92,246,0.3)]">
          <FaCheckDouble />
        </div>
        <div>
          <span className="text-[11px] text-[var(--admin-muted)] uppercase font-bold">Completed Today</span>
          <h4 className="m-[2px_0_0_0] text-[18px] text-[var(--text-main,#ffffff)] font-oswald">{completedToday || 0} Orders</h4>
        </div>
      </div>
    </div>
  );
};

export default DispatchStats;
