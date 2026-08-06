import React from "react";

const SalesChart = ({ chartData, filter, setFilter }) => {
  return (
    <div className="premium-chart-card">
      <div className="chart-header-row">
        <div className="chart-title">Sales Overview</div>
        <select
          className="chart-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="yearly">This Year</option>
          <option value="all">All Time</option>
          <option value="custom">📅 Custom Range</option>
        </select>
      </div>

      <div className="bar-chart-container">
        {chartData.map((data, idx) => (
          <div key={idx} className="bar-wrapper">
            {/* Tooltip on hover */}
            <div className="bar-tooltip">{data.amount}</div>

            {/* Actual Bar */}
            <div
              className="bar-fill"
              style={{ height: `${data.value}%` }}
            ></div>
            <span className="bar-label">{data.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesChart;
