import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const SummaryCards = ({ metrics }) => {
  return (
    <div className="analytics-summary-grid">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="analytic-summary-card animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="summary-card-header">
            <span>{metric.title}</span>
            <div className="summary-icon-box">{metric.icon}</div>
          </div>
          <div className="summary-metric-value">{metric.value}</div>
          <span
            className={`trend-indicator ${metric.isUp ? "trend-up" : "trend-down"}`}
          >
            {metric.isUp ? <FaArrowUp /> : <FaArrowDown />} {metric.trend} from
            last month
          </span>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
