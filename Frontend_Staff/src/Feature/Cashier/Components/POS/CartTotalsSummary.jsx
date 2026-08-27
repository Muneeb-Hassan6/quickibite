import React from "react";
import { FaCheck } from "react-icons/fa";

export default function CartTotalsSummary({
  subtotal = 0,
  gstRate = 0,
  taxAmount = 0,
  orderType = "Dine-In",
  deliveryFee = 0,
  grandTotal = 0,
  cartLength = 0,
  onCheckout,
}) {
  return (
    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 shrink-0 mt-2">
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Subtotal:</span>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            Rs. {Number(subtotal).toFixed(2)}
          </span>
        </div>

        {gstRate > 0 && (
          <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
            <span>Tax ({gstRate}%):</span>
            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
              Rs. {Number(taxAmount).toFixed(2)}
            </span>
          </div>
        )}

        {orderType === "Delivery" && deliveryFee > 0 && (
          <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
            <span>Delivery Fee:</span>
            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
              Rs. {Number(deliveryFee).toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm sm:text-base font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono">
          <span>Total:</span>
          <span className="text-amber-500 text-base sm:text-lg">
            Rs. {Number(grandTotal).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={cartLength === 0}
        className={`w-full py-3.5 px-4 border-none rounded-2xl font-bold text-sm uppercase tracking-wider flex justify-center items-center gap-2 shadow-lg transition-all ${
          cartLength === 0
            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none"
            : "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/25 active:scale-[0.99] cursor-pointer"
        }`}
        onClick={onCheckout}
      >
        <FaCheck className="text-xs" /> PLACE ORDER
      </button>
    </div>
  );
}
