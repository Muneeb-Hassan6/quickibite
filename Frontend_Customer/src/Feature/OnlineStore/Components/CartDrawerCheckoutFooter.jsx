import React from "react";
import { FaArrowRight, FaShieldAlt } from "react-icons/fa";

export default function CartDrawerCheckoutFooter({
  totalQty,
  totalAmount,
  toggleCart,
  navigate,
}) {
  return (
    <div className="p-3.5 sm:p-5 border-t border-gray-200/80 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md space-y-3 shrink-0">
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>Subtotal ({totalQty} items)</span>
          <span className="font-bold text-neutral-900 dark:text-white">
            Rs {totalAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>Delivery & Taxes</span>
          <span className="font-semibold text-amber-500 dark:text-amber-400">
            Calculated at Checkout
          </span>
        </div>
        <div className="pt-1.5 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
          <span className="font-['Oswald',sans-serif] font-bold text-xs sm:text-sm uppercase text-neutral-900 dark:text-white">
            Estimated Total
          </span>
          <span className="text-lg sm:text-xl font-black font-['Oswald',sans-serif] text-amber-500 dark:text-amber-400">
            Rs {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          toggleCart();
          navigate("/checkout");
        }}
        className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
      >
        <span>Proceed to Checkout</span>
        <FaArrowRight className="text-xs" />
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">
        <FaShieldAlt className="text-amber-500 text-[10px]" />
        <span>Safe & Secure Checkout</span>
      </div>
    </div>
  );
}
