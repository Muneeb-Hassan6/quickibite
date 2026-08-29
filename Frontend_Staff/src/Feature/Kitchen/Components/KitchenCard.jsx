import React from "react";
import { FaUtensils, FaArrowRight, FaCheck, FaPrint } from "react-icons/fa";

export default function KitchenCard({
  order,
  btnText,
  btnClass = "amber",
  onNext,
  isReady = false,
  onPrint,
}) {
  // Ultra safe items parsing
  let parsedItems = [];
  try {
    const rawData =
      order.items ||
      order.cart ||
      order.order_items ||
      order.details ||
      order.products;

    if (Array.isArray(rawData)) {
      parsedItems = rawData;
    } else if (typeof rawData === "string" && rawData.trim() !== "") {
      let firstParse = JSON.parse(rawData);
      if (typeof firstParse === "string") {
        parsedItems = JSON.parse(firstParse);
      } else if (Array.isArray(firstParse)) {
        parsedItems = firstParse;
      } else {
        parsedItems =
          firstParse.items || firstParse.cart || Object.values(firstParse);
      }
    }
  } catch (error) {
    console.error("Items parse error in KitchenCard for Order ID:", order.id);
  }

  const borderClass =
    order.status === "pending"
      ? "border-l-amber-500"
      : order.status === "preparing"
      ? "border-l-orange-500"
      : "border-l-emerald-500";

  const btnStyleClass =
    btnClass === "amber"
      ? "bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black"
      : btnClass === "orange"
      ? "bg-orange-500 hover:bg-orange-600 text-white font-black"
      : btnClass === "emerald"
      ? "bg-emerald-500 hover:bg-emerald-600 text-white font-black"
      : "bg-stone-200 text-stone-500 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed opacity-80 font-bold";

  return (
    <div
      className={`relative flex flex-col justify-between bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden border-l-[5px] sm:border-l-[6px] ${borderClass}`}
    >
      {/* Card Header: Table + Time + Print */}
      <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-stone-50 border-b border-stone-200 dark:bg-neutral-950/60 dark:border-neutral-800/80 flex justify-between items-center">
        <div className="bg-stone-100 text-stone-900 dark:bg-neutral-800 dark:text-neutral-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md font-bold text-xs flex items-center gap-1.5 shadow-xs border border-stone-200/60 dark:border-neutral-700/60 truncate max-w-[140px] sm:max-w-none">
          <FaUtensils className="text-[10px] text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="truncate">{order.table || order.table_number || "Takeaway"}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onPrint && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrint(order);
              }}
              className="w-7 h-7 rounded-md bg-stone-100 hover:bg-amber-400 text-stone-700 hover:text-neutral-950 dark:bg-neutral-800 dark:hover:bg-amber-400 dark:text-neutral-300 dark:hover:text-neutral-950 flex items-center justify-center transition-all border border-stone-200/80 dark:border-neutral-700 cursor-pointer text-xs active:scale-95"
              title="Print KOT"
              aria-label="Print Kitchen Ticket"
            >
              <FaPrint />
            </button>
          )}
          <span className="text-stone-500 dark:text-neutral-400 font-bold text-[11px] sm:text-xs font-mono">
            {order.time}
          </span>
        </div>
      </div>

      {/* Card Body: Items List */}
      <div className="p-3 sm:p-3.5 flex-1">
        <div className="flex justify-between text-xs text-stone-500 dark:text-neutral-400 font-bold mb-2.5 sm:mb-3 pb-1.5 sm:pb-2 border-b border-dashed border-stone-200 dark:border-neutral-800">
          <span className="font-mono text-stone-900 dark:text-neutral-200 font-bold">
            #{order.id}
          </span>
          <span className="uppercase tracking-wider text-amber-700 dark:text-amber-400 font-black text-[10px] sm:text-[11px]">
            {order.type || "Dine-In"}
          </span>
        </div>

        <div className="space-y-2 sm:space-y-2.5">
          {parsedItems.length > 0 ? (
            parsedItems.map((item, idx) => (
              <div
                key={idx}
                className="pb-2 sm:pb-2.5 border-b border-dashed border-stone-200/70 dark:border-neutral-800/60 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-2 text-xs sm:text-sm font-bold text-stone-900 dark:text-neutral-100">
                  <span className="bg-stone-100 text-amber-700 dark:bg-neutral-800 dark:text-amber-400 font-black text-[11px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6 flex justify-center items-center rounded-md shrink-0 text-center mt-0.5 border border-stone-200/80 dark:border-neutral-700">
                    {item.qty || item.quantity || 1}x
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="leading-snug break-words">
                      {item.name || item.title || item.item_name}
                    </span>
                    {item.size && (
                      <span className="text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs ml-1.5 font-black">
                        [{item.size}]
                      </span>
                    )}
                  </div>
                </div>

                {(item.description || item.note) && (
                  <div className="pl-7 sm:pl-8 mt-1 space-y-1">
                    {item.description && (
                      <p className="text-[10px] sm:text-[11px] text-stone-600 dark:text-neutral-400 leading-tight m-0 break-words">
                        {item.description}
                      </p>
                    )}
                    {item.note && (
                      <div className="text-[10px] sm:text-[11px] bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300 rounded px-1.5 sm:px-2 py-0.5 italic inline-block">
                        Note: {item.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-stone-400 dark:text-neutral-500 text-xs italic py-2">
              No items details found.
            </div>
          )}
        </div>
      </div>

      {/* Card Action Button - Min 44px touch height */}
      {btnText && (
        <button
          type="button"
          className={`w-full py-2.5 sm:py-3 px-4 min-h-[42px] sm:min-h-[44px] rounded-none font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer mt-auto border-none active:brightness-95 ${btnStyleClass}`}
          onClick={onNext}
          disabled={btnClass === "gray" || !onNext}
        >
          <span>{btnText}</span>
          {isReady ? (
            <FaCheck className="text-xs" />
          ) : (
            <FaArrowRight className="text-xs" />
          )}
        </button>
      )}
    </div>
  );
}
