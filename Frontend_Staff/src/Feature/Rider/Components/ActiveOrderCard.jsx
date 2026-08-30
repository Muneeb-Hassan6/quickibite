import React from "react";
import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaMoneyBillWave,
  FaWhatsapp,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

export default function ActiveOrderCard({ order, onComplete, onCancel, isCompleting }) {
  if (!order) return null;
  const isCod = order.paymentType === "Cash on Delivery" || order.paymentType === "COD";

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden mb-4 shadow-xs transition-colors relative">
      {/* Top Accent Stripe */}
      <div className="h-1.5 w-full bg-amber-500" />

      {/* Header Info */}
      <div className="p-4 sm:p-5 pb-3 flex justify-between items-center border-b border-stone-200 dark:border-neutral-800">
        <span className="text-lg sm:text-xl font-black font-['Oswald',sans-serif] text-stone-900 dark:text-white">
          Order #{order.id}
        </span>
        <span className="text-xs font-mono font-bold text-stone-500 dark:text-neutral-400">
          {order.time}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Customer & Call / WhatsApp Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-base font-bold text-stone-900 dark:text-neutral-100 m-0 truncate">
              {order.customer}
            </h4>
            <div className="text-xs font-mono text-stone-500 dark:text-neutral-400 mt-0.5">
              {order.phone}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${order.phone}`}
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all no-underline active:scale-95"
            >
              <FaPhoneAlt className="text-xs" />
              <span>Call</span>
            </a>
            <a
              href={`https://wa.me/${order.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all no-underline shadow-xs active:scale-95"
            >
              <FaWhatsapp className="text-sm" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3 rounded-xl text-xs text-stone-800 dark:text-neutral-200 leading-relaxed flex items-start gap-2">
          <FaMapMarkerAlt className="text-red-500 shrink-0 text-sm mt-0.5" />
          <span className="font-medium">{order.address}</span>
        </div>

        {/* Order Items */}
        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3 rounded-xl text-xs text-stone-800 dark:text-neutral-200">
          <div className="text-[10px] font-bold text-stone-500 dark:text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <FaShoppingBag className="text-[10px]" />
            <span>ORDER ITEMS</span>
          </div>
          <span className="font-semibold">{order.items}</span>
        </div>

        {/* Payment Amount to Collect */}
        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3.5 rounded-xl flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-stone-500 dark:text-neutral-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <FaMoneyBillWave className="text-[10px]" />
              <span>TO COLLECT</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] text-stone-900 dark:text-white">
              {isCod ? order.total : "PAID"}
            </div>
          </div>

          <div
            className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase ${
              isCod
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {order.paymentType}
          </div>
        </div>

        {/* Actions: Cancel & Mark as Delivered */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[44px] px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <FaTimes className="text-xs" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            disabled={isCompleting}
            onClick={onComplete}
            className="flex-[2] min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaCheckCircle className="text-xs" />
            <span>{isCompleting ? "Completing..." : "Mark as Delivered"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}