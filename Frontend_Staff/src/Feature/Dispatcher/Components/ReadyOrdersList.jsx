import React from "react";
import {
  FaBoxOpen,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";

export default function ReadyOrdersList({ orders = [], selectedId, onSelect }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-3.5 sm:p-4 h-full flex flex-col shadow-xs transition-colors overflow-hidden">
      {/* Header Accent Styling */}
      <div className="text-amber-600 dark:text-amber-400 border-b-2 border-amber-500/30 pb-2 mb-3 flex items-center justify-between shrink-0 font-['Oswald',sans-serif]">
        <h3 className="m-0 text-sm sm:text-base font-black uppercase flex items-center gap-2 tracking-wide">
          <FaBoxOpen className="text-amber-500 text-xs" />
          <span>Ready Orders</span>
        </h3>
        <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
          {orders.length}
        </span>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 overscroll-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800">
        {orders.length > 0 ? (
          orders.map((order) => {
            const isSelected = selectedId === order.id;
            return (
              <div
                key={order.id}
                onClick={() => onSelect(order)}
                className={`bg-stone-50 dark:bg-neutral-950/80 border rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected
                    ? "border-amber-500 ring-2 ring-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm"
                    : "border-stone-200 dark:border-neutral-800 hover:border-amber-500/40 shadow-xs"
                }`}
              >
                {/* Order ID & Time */}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono font-black text-sm text-stone-900 dark:text-white">
                    #{order.id}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-stone-500 dark:text-neutral-400 flex items-center gap-1">
                    <FaClock className="text-[10px]" />
                    <span>{order.time}</span>
                  </span>
                </div>

                {/* Customer & Address */}
                <h4 className="m-0 text-sm font-bold text-stone-900 dark:text-neutral-100 truncate">
                  {order.customer}
                </h4>
                <p className="m-0 mt-1 text-xs text-stone-500 dark:text-neutral-400 flex items-center gap-1.5 truncate">
                  <FaMapMarkerAlt className="text-amber-500 shrink-0 text-[11px]" />
                  <span className="truncate">{order.address}</span>
                </p>

                {/* Payment Tag */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      order.payment === "COD"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {order.payment === "COD" ? (
                      <FaMoneyBillWave className="text-[9px]" />
                    ) : (
                      <FaCreditCard className="text-[9px]" />
                    )}
                    <span>{order.payment}</span>
                  </span>
                </div>

                {/* Items & Total */}
                <div className="flex justify-between items-center border-t border-dashed border-stone-200 dark:border-neutral-800 pt-2 mt-2.5 text-xs font-bold">
                  <span className="text-stone-500 dark:text-neutral-400">
                    {order.items}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                    {order.total}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-stone-400 dark:text-neutral-500 font-semibold select-none">
            No ready delivery orders.
          </div>
        )}
      </div>
    </div>
  );
}