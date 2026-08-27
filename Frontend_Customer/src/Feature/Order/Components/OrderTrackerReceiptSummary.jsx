import React from "react";

export default function OrderTrackerReceiptSummary({ order }) {
  const cart = order?.cart || [];
  const total = parseFloat(order?.total || 0);

  return (
    <div className="md:col-span-7 bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3.5">
      <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 pb-2.5 border-b border-gray-100 dark:border-neutral-800">
        Itemized Order Receipt
      </h3>

      <div className="space-y-2.5">
        {cart.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 flex justify-between items-start gap-3 text-xs"
          >
            <div className="min-w-0 flex-1">
              <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm font-['Oswald',sans-serif] block truncate">
                {item.qty || 1}x {item.name || item.title}
              </span>
              {item.size && item.size !== "Regular" && (
                <span className="block text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                  Size: {item.size}
                </span>
              )}
              {item.note && (
                <span className="block text-amber-600 dark:text-amber-400 text-[11px]">
                  Note: "{item.note}"
                </span>
              )}
            </div>

            <span className="font-bold font-['Oswald',sans-serif] text-neutral-900 dark:text-white text-xs sm:text-sm shrink-0">
              Rs {(parseFloat(item.price || 0) * (item.qty || 1)).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
        <span className="font-['Oswald',sans-serif] font-bold text-sm sm:text-base uppercase text-neutral-900 dark:text-white">
          Grand Total
        </span>
        <span className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] text-amber-500 dark:text-amber-400">
          Rs {total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
