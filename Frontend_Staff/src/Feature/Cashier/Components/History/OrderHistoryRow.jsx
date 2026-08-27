import React from "react";
import { FaClock, FaEye, FaPrint } from "react-icons/fa";

export default function OrderHistoryRow({ order, printHandler, viewHandler }) {
  const isPaid = order.payment_status?.toLowerCase() === "paid";

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-amber-500">
        #{order.id}
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <div className="font-bold text-zinc-900 dark:text-zinc-100">
          {order.customer_name || "Walk-in"}
        </div>
        <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
          <FaClock className="w-2.5 h-2.5" />
          {order.created_at || "Just now"}
        </div>
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <span className="inline-block px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold uppercase font-mono">
          {order.order_type || "POS"}{" "}
          {order.table_no ? `• T-${order.table_no}` : ""}
        </span>
      </td>

      <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-zinc-900 dark:text-zinc-100">
        Rs. {Number(order.total_amount || 0).toFixed(2)}
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            isPaid
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
          }`}
        >
          {isPaid ? "Paid" : "Pending"}
        </span>
      </td>

      <td className="py-4 px-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => printHandler && printHandler(order)}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-neutral-950 transition-all shadow-sm border-none cursor-pointer"
            title="Print Receipt"
          >
            <FaPrint className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => viewHandler && viewHandler(order)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all border-none cursor-pointer"
            title="View Details"
          >
            <FaEye className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
