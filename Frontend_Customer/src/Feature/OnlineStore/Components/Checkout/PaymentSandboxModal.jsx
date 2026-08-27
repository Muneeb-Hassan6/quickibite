import React from "react";
import { LuX, LuSmartphone } from "react-icons/lu";

export default function PaymentSandboxModal({
  isOpen = false,
  onClose,
  sandboxMethod = "card",
  sandboxLoading = false,
  sandboxInput1 = "",
  setSandboxInput1,
  sandboxInput2 = "",
  setSandboxInput2,
  handleSandboxPay,
  total = 0,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-white border-none bg-transparent cursor-pointer p-1"
        >
          <LuX className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="p-3 rounded-2xl bg-amber-400/15 text-amber-500">
            <LuSmartphone className="w-6 h-6" />
          </span>
          <div>
            <h3 className="font-['Oswald',sans-serif] font-bold text-xl uppercase text-neutral-900 dark:text-white m-0">
              {sandboxMethod === "jazzcash"
                ? "JazzCash Sandbox"
                : sandboxMethod === "easypaisa"
                ? "EasyPaisa Sandbox"
                : "Card Gateway Sandbox"}
            </h3>
            <span className="text-xs text-amber-500 font-semibold">
              Test Mode Active
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-neutral-800 border border-amber-200 dark:border-neutral-700 mb-5 text-center">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            Amount to Authorize
          </span>
          <div className="text-2xl font-black font-['Oswald',sans-serif] text-neutral-900 dark:text-white">
            Rs {total.toLocaleString()}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
              {sandboxMethod === "card"
                ? "Card Number"
                : "Mobile Wallet Account"}
            </label>
            <input
              type="text"
              value={sandboxInput1}
              onChange={(e) => setSandboxInput1(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm mt-1 text-neutral-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
              {sandboxMethod === "card" ? "CVV / Expiry" : "Mock MPIN"}
            </label>
            <input
              type="password"
              value={sandboxInput2}
              onChange={(e) => setSandboxInput2(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm mt-1 text-neutral-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={sandboxLoading}
          onClick={handleSandboxPay}
          className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black uppercase text-sm tracking-wider shadow-md active:scale-95 transition-all border-none cursor-pointer"
        >
          {sandboxLoading
            ? "Authorizing Payment..."
            : `Authorize Rs ${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
