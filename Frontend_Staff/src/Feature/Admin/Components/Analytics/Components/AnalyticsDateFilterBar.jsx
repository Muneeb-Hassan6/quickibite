import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

export default function AnalyticsDateFilterBar({
  statsFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Analytics & Sales Overview
            </h2>
          </div>
          <p className="text-xs text-[var(--admin-muted,#888)] m-0 mt-0.5 font-sans">
            Real-time business performance metrics, volume patterns, and product trends.
          </p>
        </div>
      </div>

      {/* Custom Date Range Bar */}
      {statsFilter === "custom" && (
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
