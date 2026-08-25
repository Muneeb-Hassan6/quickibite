import React from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

const OrderReceiptModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  // --- ACTUAL THERMAL PRINTER OUTPUT HTML (Customer Invoice) ---
  const executePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Ye wo design hai jo asli thermal printer paper par print hoga
    const content = `
      <html>
        <head>
          <title>Customer Receipt - ${order.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 10px; width: 300px; margin: 0; color: #000; background: #fff; }
            .center { text-align: center; }
            .title { font-size: 24px; font-weight: 900; margin-bottom: 5px; border-bottom: 2px solid #000; padding-bottom: 5px; }
            .subtitle { font-size: 14px; margin-bottom: 10px; font-weight: bold; }
            .divider { border-bottom: 2px dashed #000; margin: 12px 0; }
            .item-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-bottom: 6px; }
            .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; margin-top: 10px; border-top: 2px solid #000; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="title">RESTAURANT INVOICE</div>
            <div class="subtitle">${new Date().toLocaleString()}</div>
          </div>
          <div class="divider"></div>
          <div style="font-weight: bold;">
            ID: ${order.id} <span style="float:right">${order.type || "Delivery"}</span>
          </div>
          <div style="font-weight: bold; margin-top: 5px;">
            Customer: ${order.customerName || "Walk-in Customer"}
          </div>
          <div class="divider"></div>
          
          <div class="item-row" style="text-decoration: underline;">
            <span style="flex:2">Item</span>
            <span style="flex:1; text-align:center">Qty</span>
            <span style="flex:1; text-align:right">Price</span>
          </div>
          
          ${order.items
            ?.map(
              (item) => `
            <div class="item-row">
              <span style="flex:2">${item.name}</span>
              <span style="flex:1; text-align:center">x${item.qty}</span>
              <span style="flex:1; text-align:right">${item.price ? item.price * item.qty : 0}</span>
            </div>`,
            )
            .join("")}
          
          <div class="divider"></div>
          <div class="item-row" style="font-weight: normal;"><span>Subtotal:</span> <span>Rs. ${order.subtotal || 0}</span></div>
          <div class="item-row" style="font-weight: normal;"><span>Delivery/Tax:</span> <span>Rs. ${order.deliveryFee || 0}</span></div>
          <div class="total-row"><span>GRAND TOTAL:</span> <span>Rs. ${order.total || 0}</span></div>
          <div class="divider"></div>
          <div class="center" style="font-size: 14px; font-weight: bold; margin-top: 10px;">
            Thank you for your visit!
          </div>
        </body>
      </html>
    `;

    iframe.contentWindow.document.write(content);
    iframe.contentWindow.document.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    setTimeout(() => {
      document.body.removeChild(iframe);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="modal-surface w-full max-w-md p-6 sm:p-7 relative overflow-hidden text-slate-900 dark:text-white animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* --- HEADER SECTION --- */}
        <div className="text-center pb-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 text-2xl shadow-sm">
            <FaPrint />
          </div>
          <h3 className="m-0 text-xl font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Customer Receipt
          </h3>
          <p className="m-0 mt-1 text-xs text-slate-500 dark:text-neutral-400 font-semibold">
            Review invoice details before printing.
          </p>
        </div>

        {/* --- DIGITAL RECEIPT PREVIEW --- */}
        <div className="bg-slate-50 dark:bg-[#111111] border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-5 my-5 font-mono text-xs">
          {/* Order Info */}
          <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-300 dark:border-white/10 mb-3">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                ORDER ID
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                #{order.id}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                TYPE
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">
                {order.type || "Delivery"}
              </div>
            </div>
          </div>

          {/* Customer Name */}
          <div className="text-center mb-3">
            <span className="inline-block px-4 py-1.5 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white rounded-full font-mono text-xs font-bold">
              {order.customerName || "Walk-in Customer"}
            </span>
          </div>

          {/* Items with Prices */}
          <div className="flex flex-col gap-2 py-3 border-t border-b border-dashed border-slate-300 dark:border-white/10">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              <span>Item</span>
              <span>Price</span>
            </div>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-slate-800 dark:text-neutral-200 font-semibold truncate pr-2">
                  <span className="font-bold text-slate-900 dark:text-white mr-1.5">{item.qty}x</span>
                  {item.name || item.title}
                </span>
                <span className="text-slate-900 dark:text-white font-mono font-bold shrink-0">
                  Rs. {item.price ? item.price * item.qty : 0}
                </span>
              </div>
            ))}
          </div>

          {/* Total Bill */}
          <div className="flex justify-between items-center pt-3 text-sm">
            <span className="text-slate-900 dark:text-white font-black uppercase tracking-wide">
              Grand Total
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-base font-mono">
              Rs. {order.total || 0}
            </span>
          </div>
        </div>

        {/* --- FOOTER BUTTONS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel
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

export default OrderReceiptModal;
