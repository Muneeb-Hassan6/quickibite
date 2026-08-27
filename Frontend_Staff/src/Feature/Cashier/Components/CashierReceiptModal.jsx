import React from "react";
import { FaPrint, FaTimes, FaReceipt } from "react-icons/fa";

const CashierReceiptModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const executePrint = () => {
    window.print();
    onClose();
  };

  const cashierUser = (() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      return user.name || user.username || "Counter Cashier";
    } catch {
      return "Counter Cashier";
    }
  })();

  const subtotal = order.subtotal || (order.items && order.items.reduce((s, i) => s + (i.price * i.qty), 0)) || order.total;
  const tax = order.tax_amount || 0;
  const delivery = order.delivery_fee || 0;
  const grandTotal = order.total || (subtotal + tax + delivery);

  return (
    <div className="modal-overlay fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="modal-surface w-full max-w-md p-6 sm:p-7 relative overflow-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Header */}
        <div className="text-center pb-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-3 text-xl shadow-xs">
            <FaReceipt />
          </div>
          <h3 className="m-0 text-xl font-black text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            BigBite POS Receipt
          </h3>
          <p className="m-0 mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
            Thermal Print & Digital Invoice Preview
          </p>
        </div>

        {/* Digital / Thermal Receipt Card */}
        <div 
          id="thermal-receipt" 
          className="bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-5 my-4 font-mono text-xs"
        >
          {/* Thermal Header (Visible in print) */}
          <div className="text-center pb-2 mb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white m-0">
              BIGBITE RESTAURANT
            </h2>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 m-0 mt-0.5">
              Fresh & Fast Food Delivery
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 m-0">
              Tel: +92 300 1234567 | NTN: 893421-4
            </p>
          </div>

          {/* Order Info Row */}
          <div className="flex justify-between items-center pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700 mb-2">
            <div>
              <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">ORDER ID</div>
              <div className="text-sm font-black text-zinc-900 dark:text-white font-mono">#{order.id}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">TYPE / TABLE</div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase font-mono">{order.table || "Walk-In"}</div>
            </div>
          </div>

          <div className="mb-2 text-zinc-600 dark:text-zinc-300 text-[11px] space-y-0.5">
            <div><strong>Date & Time:</strong> {order.time || new Date().toLocaleTimeString()}</div>
            <div><strong>Customer:</strong> {order.customerName || "Walk-In Customer"}</div>
            <div><strong>Cashier:</strong> {cashierUser}</div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed border-zinc-300 dark:border-zinc-700 py-2 mb-2">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[9px] font-bold uppercase tracking-wider mb-1.5">
              <span>ITEM & MODIFIERS</span>
              <span>PRICE</span>
            </div>
            
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="py-1 border-b border-dotted border-zinc-200 dark:border-zinc-800 last:border-none">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                      <span className="font-mono text-amber-600 dark:text-amber-400 mr-1">{item.qty}x</span>
                      {item.title || item.name}
                      {item.size && item.size !== "Regular" && (
                        <span className="text-[10px] text-zinc-500 ml-1">({item.size})</span>
                      )}
                    </span>
                    <span className="text-zinc-900 dark:text-white font-mono font-bold">
                      Rs. {((item.price || 0) * (item.qty || 1)).toFixed(2)}
                    </span>
                  </div>
                  {item.note && (
                    <div className="text-[10px] text-zinc-500 italic pl-4">Note: {item.note}</div>
                  )}
                  {item.excluded_ingredients && item.excluded_ingredients.length > 0 && (
                    <div className="text-[10px] text-red-500 pl-4 font-semibold">- Removed Ingredients</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">Items details not found</div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">Rs. {parseFloat(subtotal).toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Tax / GST:</span>
                <span className="font-mono font-semibold">Rs. {parseFloat(tax).toFixed(2)}</span>
              </div>
            )}
            {delivery > 0 && (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Delivery Charge:</span>
                <span className="font-mono font-semibold">Rs. {parseFloat(delivery).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-zinc-300 dark:border-zinc-700 text-sm font-bold">
              <span className="text-zinc-900 dark:text-white font-black uppercase">NET TOTAL</span>
              <span className="text-amber-600 dark:text-amber-400 font-black text-base font-mono">
                Rs. {parseFloat(grandTotal).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 mt-3 border-t border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] text-zinc-500 dark:text-zinc-400">
            <p className="m-0 font-bold">Thank you for dining with BigBite!</p>
            <p className="m-0 mt-0.5">Please visit us again soon.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={executePrint}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer border-none active:scale-95"
          >
            <FaPrint className="text-xs" />
            <span>Print Thermal Receipt</span>
          </button>
        </div>

      </div>

      {/* Scoped Thermal Print CSS */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible !important;
          }
          #thermal-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            padding: 5mm 3mm !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            color: #000000 !important;
            background: #ffffff !important;
            font-family: 'Courier New', Courier, monospace !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CashierReceiptModal;