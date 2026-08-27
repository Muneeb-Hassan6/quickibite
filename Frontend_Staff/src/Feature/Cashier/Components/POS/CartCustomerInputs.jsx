import React from "react";

export default function CartCustomerInputs({
  orderType = "Dine-In",
  tableNo = "",
  setTableNo,
  customerName = "",
  setCustomerName,
  customerMobile = "",
  setCustomerMobile,
}) {
  return (
    <div className="space-y-2 mb-3 shrink-0">
      {orderType === "Dine-In" && (
        <input
          type="text"
          className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
          placeholder="Table Number (e.g. 5, T-12) *"
          value={tableNo}
          onChange={(e) => setTableNo(e.target.value)}
        />
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
