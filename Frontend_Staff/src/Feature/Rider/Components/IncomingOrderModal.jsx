import React, { useEffect, useState } from "react";
import { FaBell, FaCheck, FaTimes } from "react-icons/fa";

export default function IncomingOrderModal({ order, onAccept, onDecline }) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!order) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [order, onDecline]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl w-full max-w-sm text-center text-stone-900 dark:text-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Animated Bell Icon */}
        <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-500/30 animate-bounce shadow-xs">
          <FaBell />
        </div>

        <h2 className="text-xl font-bold font-['Oswald',sans-serif] m-0 mb-1 uppercase tracking-wide">
          New Dispatch Offer!
        </h2>

        <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold mb-4 uppercase bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-stone-700 dark:text-neutral-300">
          {order.paymentType}
        </div>

        {/* Order Details Box */}
        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3.5 rounded-xl text-left text-xs space-y-1.5 mb-4">
          <p className="m-0 text-stone-600 dark:text-neutral-400">
            <strong className="text-stone-900 dark:text-white">Order:</strong> #{order.id} ({order.items})
          </p>
          <p className="m-0 text-stone-600 dark:text-neutral-400">
            <strong className="text-stone-900 dark:text-white">Total:</strong>{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{order.total}</span>
          </p>
          <p className="m-0 text-stone-600 dark:text-neutral-400 truncate">
            <strong className="text-stone-900 dark:text-white">Dropoff:</strong> {order.address}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="text-amber-500 text-3xl font-black mb-5 font-mono">
          00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 min-h-[44px] bg-stone-100 hover:bg-stone-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 border border-stone-300 dark:border-neutral-700 p-3 rounded-xl font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <FaTimes />
            <span>Decline</span>
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 min-h-[44px] bg-emerald-500 hover:bg-emerald-600 text-white border-none p-3 rounded-xl font-black text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <FaCheck />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}