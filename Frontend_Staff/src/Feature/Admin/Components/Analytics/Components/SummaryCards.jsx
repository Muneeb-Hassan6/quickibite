import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const SummaryCards = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[20px] mb-[30px]">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-[var(--admin-panel)] rounded-[16px] p-[20px] flex flex-col gap-[12px] transition-all duration-300 relative shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[var(--shadow-glow)] animate-in slide-in-from-bottom-4 fade-in"
          style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
        >
          <div className="flex justify-between items-center text-[var(--admin-muted)] text-[13px] font-semibold uppercase">
            <span>{metric.title}</span>
            <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center text-[18px] bg-[rgba(255,255,255,0.03)] text-[var(--admin-text)]">{metric.icon}</div>
          </div>
          <div className="text-[28px] font-black text-[var(--admin-text)] tracking-[0.5px]">{metric.value}</div>
          <span
            className={`inline-flex items-center gap-[5px] text-[12px] font-bold p-[4px_10px] rounded-[20px] w-fit ${metric.isUp ? "bg-[rgba(16,185,129,0.15)] text-[#10b981]" : "bg-[rgba(239,68,68,0.15)] text-[#ef4444]"}`}
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
