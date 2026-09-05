import React, { useState } from "react";
import { FaChair } from "react-icons/fa";
import TableSelectorModal from "./TableSelectorModal";

export default function CartCustomerInputs({
  orderType = "Dine-In",
  tableNo = "",
  setTableNo,
  customerName = "",
  setCustomerName,
  customerMobile = "",
  setCustomerMobile,
}) {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  return (
    <div className="space-y-2 mb-3 shrink-0">
      {orderType === "Dine-In" && (
        <div className="flex gap-1.5">
          <input
            type="text"
            className="flex-1 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
            placeholder="Table Number (e.g. Table 1, 5) *"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 active:scale-95"
            title="Open Dine-In Floor Tables"
          >
            <FaChair className="text-xs" />
            <span className="hidden sm:inline">Select</span>
          </button>

          <TableSelectorModal
            isOpen={isTableModalOpen}
            onClose={() => setIsTableModalOpen(false)}
            onSelectTable={(selected) => setTableNo(selected)}
            selectedTable={tableNo}
          />
        </div>
      )}

      {orderType === "Delivery" && (
        <>
          <input
            type="text"
            className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
            placeholder="Delivery Address *"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
          />
          <input
            type="text"
            className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
            placeholder="Customer Mobile Number *"
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
          />
        </>
      )}

      <input
        type="text"
        className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
        placeholder="Customer Name (Optional)"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
    </div>
  );
}
