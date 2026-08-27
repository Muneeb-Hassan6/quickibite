import React from "react";
import { FaSearch } from "react-icons/fa";

export default function HistoryFilterBar({
  filterType = "ALL",
  setFilterType,
  searchTerm = "",
  setSearchTerm,
}) {
  const tabs = [
    { label: "ALL ORDERS", value: "ALL" },
    { label: "DINE-IN", value: "DINE-IN" },
    { label: "TAKEAWAY", value: "TAKEAWAY" },
    { label: "DELIVERY", value: "DELIVERY" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilterType(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 border-none cursor-pointer ${
              filterType === tab.value
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-extrabold"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Order ID, Customer Name, or Table..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm box-border"
        />
      </div>
    </div>
  );
}
