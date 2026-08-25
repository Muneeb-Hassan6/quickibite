import React from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

const CashierReceiptModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const executePrint = () => {
    window.print();
    onClose();
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[999999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-surface w-full max-w-md p-6 sm:p-7 relative overflow-hidden text-slate-900 dark:text-white animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Header */}
        <div className="text-center pb-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 text-2xl shadow-sm">
            <FaPrint />
          </div>
          <h3 className="m-0 text-xl font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            BigBite Receipt
          </h3>
          <p className="m-0 mt-1 text-xs text-slate-500 dark:text-neutral-400 font-semibold">
            Cashier Invoice Overview
          </p>
        </div>

        {/* Digital Receipt Card */}
        <div className="bg-slate-50 dark:bg-[#111111] border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-5 my-5 font-mono text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-300 dark:border-white/10 mb-3">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">ORDER ID</div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono">#{order.id}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">TABLE</div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">{order.table || "Walk-In"}</div>
            </div>
          </div>

          <div className="mb-3 text-slate-600 dark:text-neutral-300 text-xs">
            <div><strong>Date:</strong> {order.time || new Date().toLocaleTimeString()}</div>
            <div><strong>Customer:</strong> {order.customerName || "Walk-In"}</div>
          </div>

          <div className="border-t border-b border-dashed border-slate-300 dark:border-white/10 py-3 mb-3">
            <div className="flex justify-between text-slate-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <span>ITEM</span>
              <span>SUBTOTAL</span>
            </div>
            
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs py-0.5">
                  <span className="text-slate-800 dark:text-neutral-200 font-semibold">
                    <span className="font-bold text-slate-900 dark:text-white mr-1.5">{item.qty}x</span>
                    {item.title || item.name}
                  </span>
                  <span className="text-slate-900 dark:text-white font-mono font-bold">Rs. {item.price * item.qty}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 dark:text-neutral-500 text-center py-2">Items details not found</div>
            )}
          </div>

          <div className="flex justify-between items-center pt-1 text-sm font-bold">
            <span className="text-slate-900 dark:text-white font-black uppercase">TOTAL BILL</span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-base font-mono">Rs. {order.total}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Done
          </button>
          <button
            type="button"
            onClick={executePrint}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer border-none active:scale-95"
          >
            <FaPrint className="text-xs" />
            <span>Print Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CashierReceiptModal;