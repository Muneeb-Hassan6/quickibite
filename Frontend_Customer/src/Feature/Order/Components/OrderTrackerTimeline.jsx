import React from "react";
import { FaSync } from "react-icons/fa";

export default function OrderTrackerTimeline({
  order,
  searchId,
  currentStep,
  steps,
  isRefreshing,
  fetchOrderDetails,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Tracking Reference
          </span>
          <h2 className="font-['Oswald',sans-serif] font-black text-xl sm:text-2xl uppercase text-neutral-900 dark:text-white m-0 mt-0.5">
            Order #{order.id}
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider">
            Status: {order.status || "Pending"}
          </div>

          <button
            type="button"
            onClick={() => fetchOrderDetails(searchId, true)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-amber-500 transition-all border-none cursor-pointer"
            title="Refresh Status"
            aria-label="Refresh Status"
          >
            <FaSync
              className={`text-xs ${
                isRefreshing ? "animate-spin text-amber-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Step Timeline Graphic: Vertical on Mobile (<640px), Horizontal on Desktop (sm+) */}
      <div className="pt-6 sm:pt-8 pb-3">
        {/* Mobile Vertical Stepper (< 640px) */}
        <div className="sm:hidden space-y-4 relative pl-2">
          <div className="absolute left-[26px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-neutral-800 pointer-events-none" />
          {steps.map((step) => {
            const isCompleted = currentStep >= step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                className={`flex items-start gap-3.5 relative z-10 transition-all ${
                  isCompleted ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all shrink-0 shadow-xs ${
                    isCurrent
                      ? "bg-amber-400 text-neutral-950 ring-4 ring-amber-400/25 shadow-md scale-105"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-neutral-800 text-neutral-400 border border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  {step.icon}
                </div>

                <div className="flex-1 pt-0.5">
                  <h4 className="font-['Oswald',sans-serif] font-bold text-sm uppercase text-neutral-900 dark:text-white m-0">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 m-0 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Horizontal Stepper (>= 640px) */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-4 md:gap-6 relative">
          {steps.map((step) => {
            const isCompleted = currentStep >= step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                className={`flex flex-col items-center text-center gap-2.5 transition-all ${
                  isCompleted ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-base md:text-lg transition-all shrink-0 ${
                    isCurrent
                      ? "bg-amber-400 text-neutral-950 ring-4 ring-amber-400/25 shadow-lg scale-110"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {step.icon}
                </div>

                <div>
                  <h4 className="font-['Oswald',sans-serif] font-bold text-sm md:text-base uppercase text-neutral-900 dark:text-white m-0">
                    {step.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 m-0 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
