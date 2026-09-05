import React from "react";
import { FaCheck, FaMoneyBillWave, FaCreditCard, FaRandom } from "react-icons/fa";

export default function CartTotalsSummary({
  subtotal = 0,
  gstRate = 0,
  taxAmount = 0,
  orderType = "Dine-In",
  deliveryFee = 0,
  grandTotal = 0,
  cartLength = 0,
  paymentMethod = "Cash",
  setPaymentMethod,
  paymentStatus = "Paid",
  setPaymentStatus,
  transactionId = "",
  setTransactionId,
  onCheckout,
}) {
  const generateRandomTxn = () => {
    if (setTransactionId) {
      const randomRef = "TXN-" + Math.floor(100000 + Math.random() * 900000);
      setTransactionId(randomRef);
    }
  };

  return (
    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5 shrink-0 mt-2">
      {/* 1. Totals Calculation Breakdown */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Subtotal:</span>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            Rs. {Number(subtotal || 0).toFixed(2)}
          </span>
        </div>

        {gstRate > 0 && (
          <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
            <span>Tax ({gstRate}%):</span>
            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
              Rs. {Number(taxAmount || 0).toFixed(2)}
            </span>
          </div>
        )}

        {orderType === "Delivery" && deliveryFee > 0 && (
          <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
            <span>Delivery Fee:</span>
            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
              Rs. {Number(deliveryFee || 0).toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm sm:text-base font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono">
          <span>Grand Total:</span>
          <span className="text-amber-500 text-base sm:text-lg">
            Rs. {Number(grandTotal || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* 2. Payment Method & Status Tender Controls */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
            Payment Tender
          </label>
          {setPaymentStatus && (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setPaymentStatus("Paid")}
                className={`px-1.5 py-0.5 rounded-md border-none cursor-pointer transition-all ${
                  paymentStatus === "Paid"
                    ? "bg-emerald-500 text-white font-bold"
                    : "bg-transparent text-zinc-500 dark:text-zinc-400"
                }`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus("Pending")}
                className={`px-1.5 py-0.5 rounded-md border-none cursor-pointer transition-all ${
                  paymentStatus === "Pending"
                    ? "bg-rose-500 text-white font-bold"
                    : "bg-transparent text-zinc-500 dark:text-zinc-400"
                }`}
              >
                Pending
              </button>
            </div>
          )}
        </div>

        {setPaymentMethod && (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("Cash");
                if (setTransactionId) setTransactionId("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                paymentMethod === "Cash"
                  ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              <FaMoneyBillWave className="text-xs" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentMethod("Card");
                if (setTransactionId && !transactionId) {
                  generateRandomTxn();
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                paymentMethod === "Card" || paymentMethod === "Online"
                  ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              <FaCreditCard className="text-xs" />
              <span>Card / POS</span>
            </button>
          </div>
        )}

        {/* Transaction Reference for Card / Online */}
        {(paymentMethod === "Card" || paymentMethod === "Online") && setTransactionId && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <input
              type="text"
              placeholder="Ref / Transaction ID (e.g. TXN-12345)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 py-1.5 px-2.5 rounded-xl text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={generateRandomTxn}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-amber-500 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              title="Generate reference"
            >
              <FaRandom className="text-xs" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Place Order Button */}
      <button
        type="button"
        disabled={cartLength === 0}
        className={`w-full py-3.5 px-4 border-none rounded-2xl font-bold text-sm uppercase tracking-wider flex justify-center items-center gap-2 shadow-lg transition-all ${
          cartLength === 0
            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none"
            : "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/25 active:scale-[0.99] cursor-pointer"
        }`}
        onClick={onCheckout}
      >
        <FaCheck className="text-xs" /> PLACE ORDER
      </button>
    </div>
  );
}
