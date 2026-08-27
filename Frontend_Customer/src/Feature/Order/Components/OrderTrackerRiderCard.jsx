import React from "react";
import { FaPhoneAlt } from "react-icons/fa";

export default function OrderTrackerRiderCard({ order, restaurantPhone }) {
  return (
    <div className="md:col-span-5 space-y-4">
      <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3.5">
        <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 pb-2.5 border-b border-gray-100 dark:border-neutral-800">
          Delivery Coordinates
        </h3>

        <div className="space-y-2.5 text-xs">
          <div>
            <span className="text-neutral-400 uppercase font-semibold">Recipient:</span>
            <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm m-0 mt-0.5">
              {order.customer_name || "Guest Customer"}
            </p>
          </div>

          <div>
            <span className="text-neutral-400 uppercase font-semibold">Contact:</span>
            <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm m-0 mt-0.5">
              {order.customer_mobile || "N/A"}
            </p>
          </div>

          <div>
            <span className="text-neutral-400 uppercase font-semibold">Fulfillment Type:</span>
            <p className="font-bold text-amber-500 dark:text-amber-400 uppercase text-xs sm:text-sm m-0 mt-0.5">
              {order.order_type || "Delivery"}
            </p>
          </div>

          {order.customer_address && (
            <div>
              <span className="text-neutral-400 uppercase font-semibold">Address / Notes:</span>
              <p className="font-medium text-neutral-700 dark:text-neutral-300 m-0 mt-0.5 leading-relaxed">
                {order.customer_address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Need Help Helpline Card */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
        <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
          Need Help With Your Order?
        </span>
        <a
          href={`tel:${restaurantPhone}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all no-underline shadow-xs active:scale-95"
        >
          <FaPhoneAlt className="text-[10px]" />
          <span>Call Support ({restaurantPhone})</span>
        </a>
      </div>
    </div>
  );
}
