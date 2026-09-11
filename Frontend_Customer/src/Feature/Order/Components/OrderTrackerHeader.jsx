import React from "react";
import { FaClock, FaSearch } from "react-icons/fa";

export default function OrderTrackerHeader({
  inputSearchId,
  setInputSearchId,
  handleSearchSubmit,
}) {
  return (
    <section className="relative overflow-hidden pt-6 pb-6 sm:pt-10 sm:pb-8 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1.5">
          <FaClock className="text-[10px]" />
          <span>REAL-TIME STATUS</span>
        </div>
        <h1 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-neutral-950 dark:text-white m-0">
          TRACK YOUR{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            FEAST
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-lg">
          Monitor preparation progress and live delivery dispatch in real time.
        </p>

        {/* Quick Search Form */}
        <form onSubmit={handleSearchSubmit} className="mt-4 sm:mt-5 max-w-md">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputSearchId}
              onChange={(e) => setInputSearchId(e.target.value)}
              placeholder="Enter Order ID (e.g. 1042)..."
              className="w-full pl-9 pr-24 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs transition-all font-mono font-bold"
            />
            <FaSearch className="absolute left-3.5 text-neutral-400 text-xs pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer active:scale-95"
            >
              Track
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
