import React from "react";

const SalesChart = ({ chartData, filter, setFilter }) => {
  return (
    <div className="bg-[var(--admin-panel)] rounded-[16px] p-[25px] flex flex-col h-[380px] shadow-[0_4px_6px_rgba(0,0,0,0.2)] lg:max-xl:h-auto lg:max-xl:min-h-[350px] max-lg:h-auto max-lg:min-h-[350px]">
      <div className="flex justify-between items-center mb-[30px]">
        <div className="text-[18px] font-extrabold text-[var(--admin-text)] border-l-[4px] border-[var(--admin-orange)] pl-[10px]">Sales Overview</div>
        <select
          className="bg-[var(--admin-bg)] text-[var(--admin-text)] p-[8px_12px] rounded-[8px] text-[12px] font-semibold outline-none cursor-pointer transition-all duration-200"
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

      <div className="flex-1 flex items-end justify-between pb-[10px] border-b border-[var(--admin-border)] gap-[15px] mt-[10px]">
        {chartData.map((data, idx) => (
          <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center relative cursor-pointer group">
            {/* Tooltip on hover */}
            <div className="absolute -top-[35px] bg-[var(--admin-text)] text-[var(--admin-bg)] p-[5px_10px] rounded-[6px] text-[12px] font-extrabold opacity-0 transition-all duration-200 pointer-events-none whitespace-nowrap translate-y-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] group-hover:opacity-100 group-hover:translate-y-0 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-solid after:border-[var(--admin-text)_transparent_transparent_transparent] z-10">{data.amount}</div>

            {/* Actual Bar */}
            <div
              className="w-full max-w-[45px] bg-gradient-to-b from-[var(--admin-orange)] to-[#b71c1c] rounded-t-[6px] transition-all duration-[1000ms] ease-out origin-bottom shadow-[var(--shadow-glow)] group-hover:scale-y-[1.05] group-hover:brightness-125"
              style={{ height: `${data.value}%` }}
            ></div>
            <span className="mt-[15px] text-[13px] text-[var(--admin-muted)] font-semibold">{data.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesChart;
