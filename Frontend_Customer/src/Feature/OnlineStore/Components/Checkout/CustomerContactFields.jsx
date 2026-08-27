import React from "react";
import { LuCircleAlert } from "react-icons/lu";

export default function CustomerContactFields({
  customerName = "",
  handleNameChange,
  customerMobile = "",
  handleMobileChange,
  errors = {},
}) {
  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
      <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
        2. Contact Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Full Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={handleNameChange}
            placeholder="e.g. Faiz Ul Hassan"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
              errors.name
                ? "border-red-500 bg-red-50/10 ring-1 ring-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
          {errors.name ? (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
              <LuCircleAlert className="w-3 h-3 shrink-0" />
              {errors.name}
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400">
              Letters and spaces only
            </span>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Phone Number (11 Digits) *
          </label>
          <input
            type="tel"
            maxLength={11}
            value={customerMobile}
            onChange={handleMobileChange}
            placeholder="e.g. 0300 1234567"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors font-mono ${
              errors.mobile
                ? "border-red-500 bg-red-50/10 ring-1 ring-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
          {errors.mobile ? (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
              <LuCircleAlert className="w-3 h-3 shrink-0" />
              {errors.mobile}
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400">
              Format: 03XXXXXXXXX (11 digits)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
