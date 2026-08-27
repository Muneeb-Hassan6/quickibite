import React from "react";
import { FaClock } from "react-icons/fa";

export default function DashboardWelcomeHero({ currentTime }) {
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="bg-[var(--panel-bg)] border border-[var(--border-subtle)] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
      <div className="relative z-10">
        <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mb-2 border border-amber-500/20">
          BigBite Restaurant Operations
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-primary)] m-0 font-['Oswald',sans-serif] tracking-wide">
          {getGreeting()}, Admin! 👋
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 mb-0 font-sans">
          Here's the live overview and operational activity for today.
        </p>
      </div>

      <div className="text-left md:text-right relative z-10 p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
        <div className="text-amber-500 font-black text-base sm:text-lg font-mono flex items-center md:justify-end gap-1.5">
          <FaClock className="text-xs" />
          <span>
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)] block font-semibold mt-0.5">
          {currentTime.toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
