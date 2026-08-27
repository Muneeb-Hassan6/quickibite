import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

export default function ProductProfitFilterBar({
  categoryFilter,
  setCategoryFilter,
  categories = [],
  filter,
  setFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <>
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Product Profitability & Unit Economics
            </h2>
          </div>
          <p className="text-xs text-[var(--admin-muted,#888)] m-0 mt-0.5 font-sans">
            Cost of Goods Sold (COGS), gross margins, and net profitability per menu item.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 outline-none cursor-pointer focus:border-amber-500 transition-colors"
          >
            {categories.map((cat, idx) => (
              <option key={idx} className="bg-[#171717]" value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          {/* Time Range Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 outline-none cursor-pointer focus:border-amber-500 transition-colors"
          >
            <option className="bg-[#171717]" value="today">Today</option>
            <option className="bg-[#171717]" value="weekly">This Week</option>
            <option className="bg-[#171717]" value="monthly">This Month</option>
            <option className="bg-[#171717]" value="yearly">This Year</option>
            <option className="bg-[#171717]" value="all">All Time</option>
            <option className="bg-[#171717]" value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range Bar */}
      {filter === "custom" && (
        <div className="flex items-center gap-3 bg-[var(--admin-panel,#171717)] p-3 rounded-2xl border border-amber-500/20 flex-wrap">
          <FaCalendarAlt className="text-amber-400 text-xs" />
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <span>From:</span>
            <input
              type="date"
              className="bg-black/40 text-white border border-white/10 rounded-xl px-2.5 py-1 text-xs [color-scheme:dark]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <span>To:</span>
            <input
              type="date"
              className="bg-black/40 text-white border border-white/10 rounded-xl px-2.5 py-1 text-xs [color-scheme:dark]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </>
  );
}
