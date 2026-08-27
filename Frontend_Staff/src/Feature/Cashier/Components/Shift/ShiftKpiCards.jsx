import React from "react";
import { FaCoins, FaWallet, FaCreditCard, FaReceipt } from "react-icons/fa";

export default function ShiftKpiCards({
  totalSales = 0,
  paidOrdersCount = 0,
  cashSales = 0,
  digitalSales = 0,
  totalOrdersCount = 0,
  unpaidOrdersCount = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
      {/* Total Sales / Revenue */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Total Sales
          </span>
          <h3 className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white mt-1">
            Rs. {Number(totalSales).toFixed(2)}
          </h3>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1">
            {paidOrdersCount} Settled Orders
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xl shadow-xs">
          <FaCoins />
        </div>
      </div>

      {/* Cash Drawer */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Cash in Drawer
          </span>
          <h3 className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            Rs. {Number(cashSales).toFixed(2)}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Physical Cash Tendered
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl shadow-xs">
          <FaWallet />
        </div>
      </div>

      {/* Card / Digital */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Card / Digital
          </span>
          <h3 className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1">
            Rs. {Number(digitalSales).toFixed(2)}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Online & POS Terminal
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center text-xl shadow-xs">
          <FaCreditCard />
        </div>
      </div>

      {/* Order Volume */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Orders Handled
          </span>
          <h3 className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white mt-1">
            {totalOrdersCount}
          </h3>
          <p className="text-[11px] text-amber-500 font-semibold mt-1">
            {unpaidOrdersCount} Pending Balance
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center text-xl shadow-xs">
          <FaReceipt />
        </div>
      </div>
    </div>
  );
}
