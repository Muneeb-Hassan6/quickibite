import React from "react";
import { FaLayerGroup } from "react-icons/fa";

const TopCategories = ({ data }) => {
  const categories =
    data && data.length > 0
      ? data
      : [
          { name: "Burgers & Sandwiches", percent: 45, qty: 120 },
          { name: "Pizzas & Calzones", percent: 30, qty: 80 },
          { name: "Sides & Appetizers", percent: 15, qty: 40 },
          { name: "Beverages & Drinks", percent: 10, qty: 25 },
        ];

  const barColors = [
    "bg-amber-500",
    "bg-orange-500",
    "bg-emerald-500",
    "bg-blue-500",
  ];

  return (
    <div className="bg-[var(--admin-panel,#171717)] rounded-2xl p-5 border border-[var(--admin-border,rgba(255,255,255,0.06))] shadow-sm flex flex-col justify-between h-[380px]">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
        <FaLayerGroup className="text-amber-400 text-sm" />
        <h3 className="m-0 text-sm sm:text-base font-black text-white font-['Oswald',sans-serif] uppercase tracking-wide">
          Sales by Category
        </h3>
      </div>

      <div className="space-y-4 my-auto">
        {categories.map((cat, idx) => {
          const color = barColors[idx % barColors.length];
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-neutral-300 truncate max-w-[180px]">
                  {cat.name}
                </span>
                <div className="flex items-center gap-2">
                  {cat.qty !== undefined && (
                    <span className="text-[10px] text-[var(--admin-muted,#888)] font-semibold">
                      {cat.qty} sold
                    </span>
                  )}
                  <span className="font-black text-white font-mono">
                    {cat.percent}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${color}`}
                  style={{ width: `${Math.max(5, cat.percent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-[var(--admin-border,rgba(255,255,255,0.06))] text-[11px] text-[var(--admin-muted,#888)] font-medium">
        Calculated from completed orders across catalog categories.
      </div>
    </div>
  );
};

export default TopCategories;
