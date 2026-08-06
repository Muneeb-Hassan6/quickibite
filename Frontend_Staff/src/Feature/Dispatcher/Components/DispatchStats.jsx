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
    <div className="dispatch-stats-row animate-slide-up">
      <div className="stat-box">
        <div className="stat-icon bg-red-glow">
          <FaBoxOpen />
        </div>
        <div className="stat-info">
          <span>Pending Dispatch</span>
          <h4>{readyCount || 0} Orders</h4>
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-icon bg-green-glow">
          <FaMotorcycle />
        </div>
        <div className="stat-info">
          <span>Available Riders</span>
          <h4>{freeRiders || 0} Free</h4>
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-icon bg-blue-glow">
          <FaStopwatch />
        </div>
        <div className="stat-info">
          <span>Avg. Delivery Time</span>
          {/* Yahan prop use kiya hai */}
          <h4>{avgDeliveryTime || 0} Mins</h4>
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-icon bg-purple-glow">
          <FaCheckDouble />
        </div>
        <div className="stat-info">
          <span>Completed Today</span>
          <h4>{completedToday || 0} Orders</h4>
        </div>
      </div>
    </div>
  );
};

export default DispatchStats;
