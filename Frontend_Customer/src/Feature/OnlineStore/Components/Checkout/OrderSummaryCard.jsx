import React from "react";
import { LuArrowRight, LuShieldCheck, LuTag, LuHeart } from "react-icons/lu";
import CheckoutItemsReview from "./CheckoutItemsReview";

export default function OrderSummaryCard({
  cartItems = [],
  subTotal = 0,
  deliveryFee = 0,
  riderTip = 0,
  discountAmount = 0,
  appliedCoupon = null,
  orderType = "delivery",
  total = 0,
  isSubmitting = false,
  handleProceedOrder,
}) {
  const isDelivery = orderType === "delivery";

  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-sm backdrop-blur-md space-y-6">
      <CheckoutItemsReview cartItems={cartItems} />

      {/* Breakdown */}
      <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-2 text-sm">
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Subtotal</span>
          <span className="font-bold text-neutral-900 dark:text-white">
            Rs {subTotal.toLocaleString()}
          </span>
        </div>

        {/* Applied Coupon Discount Line */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <LuTag className="w-3.5 h-3.5 text-emerald-500" />
              <span>Coupon Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ""}</span>
            </span>
            <span className="font-bold">
              -Rs {discountAmount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Delivery Fee Line */}
        {isDelivery ? (
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Delivery Fee</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {deliveryFee > 0 ? `Rs ${deliveryFee.toLocaleString()}` : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
              )}
            </span>
          </div>
        ) : (
          <div className="flex justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Fulfillment Type</span>
            <span className="font-bold text-amber-500 uppercase font-['Oswald',sans-serif]">
              {orderType === "dine_in" ? "Dine-In Table Service" : "Self Takeaway"}
            </span>
          </div>
        )}

        {/* Rider Tip Line */}
        {isDelivery && riderTip > 0 && (
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5">
              <LuHeart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Rider Tip</span>
            </span>
            <span className="font-bold text-neutral-900 dark:text-white">
              Rs {riderTip.toLocaleString()}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
          <span className="font-['Oswald',sans-serif] font-bold text-base uppercase text-neutral-900 dark:text-white">
            Grand Total
          </span>
          <span className="text-2xl font-black font-['Oswald',sans-serif] text-amber-500">
            Rs {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Place Order CTA Button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleProceedOrder}
        className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-[0.98] disabled:opacity-50 text-neutral-950 font-['Oswald',sans-serif] font-black text-base uppercase tracking-wider shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
      >
        <span>
          {isSubmitting
            ? "Placing Order..."
            : `Place Order (Rs ${total.toLocaleString()})`}
        </span>
        <LuArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
        <LuShieldCheck className="w-4 h-4 text-amber-500" />
        <span>Live Kitchen Dispatch & SMS Notification</span>
      </div>
    </div>
  );
}

