import React from "react";
import { FaPrint, FaTimes, FaReceipt } from "react-icons/fa";

const CashierReceiptModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const cashierUser = (() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      return user.name || user.username || "Counter Cashier";
    } catch {
      return "Counter Cashier";
    }
  })();

  const customerName =
    order.customer_name ||
    order.customer ||
    order.guest_name ||
    order.customerName ||
    "Walk-In Customer";

  const rawType = (
    order.order_mode ||
    order.order_type ||
    order.type ||
    "DINE-IN"
  ).toUpperCase();

  const tableNum = order.table_number || order.table_no || order.table || "";
  const isDineIn =
    rawType.includes("DINE") ||
    (!rawType.includes("TAKEAWAY") && !rawType.includes("DELIVERY"));

  const typeDisplay =
    isDineIn && tableNum && !tableNum.toLowerCase().includes("takeaway") && !tableNum.toLowerCase().includes("delivery")
      ? `DINE-IN (Table #${tableNum})`
      : rawType;

  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : typeof order.cart === "string"
    ? JSON.parse(order.cart || "[]")
    : order.cart || [];

  const calculatedSubtotal = items.reduce(
    (s, i) => s + parseFloat(i.price || 0) * parseInt(i.qty || i.quantity || 1, 10),
    0
  );

  const subtotal =
    order.subtotal !== undefined && order.subtotal !== null && parseFloat(order.subtotal) > 0
      ? parseFloat(order.subtotal)
      : calculatedSubtotal || parseFloat(order.total || order.total_amount || 0);

  const discount = parseFloat(order.discount_amount || 0);
  const couponCode = order.coupon_code || "";
  const deliveryFee = parseFloat(order.delivery_fee || order.deliveryFee || 0);
  const riderTip = parseFloat(order.rider_tip || 0);
  const taxAmount = parseFloat(order.tax_amount || order.tax || 0);
  const grandTotal = parseFloat(
    order.total || order.total_amount || subtotal - discount + deliveryFee + riderTip + taxAmount
  );

  const orderDateTime =
    order.date && order.time
      ? `${order.date} ${order.time}`
      : order.created_at || order.time || new Date().toLocaleString();

  // Print function using iframe for pixel-perfect 80mm thermal receipt
  const executePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const itemsHtml = items
      .map((item) => {
        let addons = item.selectedAddons || item.addons || [];
        if (typeof addons === "string") {
          try {
            addons = JSON.parse(addons);
          } catch {
            addons = [];
          }
        }
        const addonsHtml =
          Array.isArray(addons) && addons.length > 0
            ? addons
                .map(
                  (a) =>
                    `<div style="font-size: 10px; color: #444; margin-left: 12px;">+ ${
                      a.name || a.addon_name || "Addon"
                    } (Rs. ${Number(a.price || 0)})</div>`
                )
                .join("")
            : "";

        return `
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 2px;">
          <span style="flex: 2; word-break: break-word;">${item.qty || item.quantity || 1}x ${item.name || item.title || "Item"}${
          item.size && item.size !== "Regular" ? ` (${item.size})` : ""
        }</span>
          <span style="flex: 1; text-align: right; font-family: monospace;">Rs. ${(
            parseFloat(item.price || 0) * parseInt(item.qty || item.quantity || 1, 10)
          ).toFixed(0)}</span>
        </div>
        ${addonsHtml}
        ${
          item.note
            ? `<div style="font-size: 10px; color: #555; margin-left: 12px; margin-bottom: 3px;">Note: ${item.note}</div>`
            : ""
        }
      `;
      })
      .join("");

    const content = `
      <html>
        <head>
          <title>Customer Receipt - #${order.id}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 8px 12px;
              width: 290px;
              margin: 0 auto;
              color: #000;
              background: #fff;
              font-size: 12px;
              line-height: 1.3;
            }
            .center { text-align: center; }
            .title { font-size: 20px; font-weight: 900; margin-bottom: 2px; text-transform: uppercase; }
            .subtitle { font-size: 11px; margin-bottom: 6px; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .double-divider { border-bottom: 2px solid #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px; }
            .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #000; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="title">BIGBITE RESTAURANT</div>
            <div class="subtitle">RESTAURANT INVOICE</div>
            <div style="font-size: 10px;">${orderDateTime}</div>
          </div>
          <div class="divider"></div>
          
          <div class="row" style="font-weight: bold;">
            <span>ORDER ID: #${order.id}</span>
            <span>${typeDisplay}</span>
          </div>
          <div class="row">
            <span>Customer: ${customerName}</span>
          </div>
          ${
            order.customer_mobile
              ? `<div class="row"><span>Phone: ${order.customer_mobile}</span></div>`
              : ""
          }
          ${
            order.customer_address
              ? `<div class="row"><span>Address: ${order.customer_address}</span></div>`
              : ""
          }
          <div class="row">
            <span>Cashier: ${cashierUser}</span>
            <span>Pay: ${order.payment_method || "Cash"}</span>
          </div>
          
          <div class="divider"></div>
          <div class="row" style="font-weight: bold; text-decoration: underline; font-size: 11px;">
            <span style="flex: 2;">ITEM</span>
            <span style="flex: 1; text-align: right;">PRICE</span>
          </div>
          
          ${itemsHtml || '<div style="text-align: center; padding: 6px 0;">No items found</div>'}
          
          <div class="divider"></div>
          <div class="row"><span>Subtotal:</span> <span style="font-family: monospace;">Rs. ${subtotal.toFixed(0)}</span></div>
          ${
            discount > 0
              ? `<div class="row" style="color: #000; font-weight: bold;"><span>Discount (${couponCode || "Promo"}):</span> <span style="font-family: monospace;">-Rs. ${discount.toFixed(0)}</span></div>`
              : ""
          }
          ${
            deliveryFee > 0
              ? `<div class="row"><span>Delivery Fee:</span> <span style="font-family: monospace;">Rs. ${deliveryFee.toFixed(0)}</span></div>`
              : ""
          }
          ${
            riderTip > 0
              ? `<div class="row"><span>Rider Tip:</span> <span style="font-family: monospace;">Rs. ${riderTip.toFixed(0)}</span></div>`
              : ""
          }
          ${
            taxAmount > 0
              ? `<div class="row"><span>Tax / GST:</span> <span style="font-family: monospace;">Rs. ${taxAmount.toFixed(0)}</span></div>`
              : ""
          }
          <div class="total-row">
            <span>GRAND TOTAL:</span>
            <span style="font-family: monospace;">Rs. ${grandTotal.toFixed(0)}</span>
          </div>
          
          <div class="double-divider"></div>
          <div class="center" style="font-size: 11px; font-weight: bold; margin-top: 8px;">
            Thank you for choosing BigBite!<br/>
            Please visit us again soon.
          </div>
        </body>
      </html>
    `;

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(content);
    iframe.contentWindow.document.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-surface w-full max-w-md p-5 sm:p-6 relative overflow-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Header */}
        <div className="text-center pb-1">
          <div className="w-11 h-11 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-2.5 text-xl shadow-xs">
            <FaReceipt />
          </div>
          <h3 className="m-0 text-lg font-black text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            BigBite Thermal Receipt
          </h3>
          <p className="m-0 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            High-Contrast Monochrome POS Standard
          </p>
        </div>

        {/* Unified Monochrome Digital / Thermal Receipt Card */}
        <div
          id="thermal-receipt"
          className="bg-zinc-50 dark:bg-[#111111] border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 my-3.5 font-mono text-xs text-black dark:text-white"
        >
          {/* Header */}
          <div className="text-center pb-2 mb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
            <h2 className="text-base font-black uppercase tracking-wider text-black dark:text-white m-0 font-mono">
              BIGBITE RESTAURANT
            </h2>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 m-0 mt-0.5 font-semibold">
              RESTAURANT INVOICE
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 m-0 font-mono">
              {orderDateTime}
            </p>
          </div>

          {/* Order Info */}
          <div className="flex justify-between items-start pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700 mb-2">
            <div>
              <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                ORDER ID
              </div>
              <div className="text-sm font-black font-mono text-black dark:text-white">
                #{order.id}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                TYPE / TABLE
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase font-mono">
                {typeDisplay}
              </div>
            </div>
          </div>

          {/* Customer & Cashier Metadata */}
          <div className="mb-2 text-zinc-700 dark:text-zinc-300 text-[11px] space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Customer:</span>
              <span className="font-bold text-black dark:text-white">{customerName}</span>
            </div>
            {order.customer_mobile && (
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Phone:</span>
                <span className="font-semibold text-black dark:text-white">{order.customer_mobile}</span>
              </div>
            )}
            {order.customer_address && (
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Address:</span>
                <span className="font-semibold text-black dark:text-white text-right max-w-[180px] truncate">{order.customer_address}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Cashier:</span>
              <span className="font-semibold text-black dark:text-white">{cashierUser}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Payment:</span>
              <span className="font-semibold text-black dark:text-white">
                {order.payment_method || "Cash"} ({order.payment_status || "Paid"})
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed border-zinc-300 dark:border-zinc-700 py-2 mb-2">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[9px] font-bold uppercase tracking-wider mb-1.5 font-mono">
              <span style={{ flex: 2 }}>ITEM</span>
              <span style={{ flex: 1, textAlign: "right" }}>PRICE</span>
            </div>

            {items && items.length > 0 ? (
              items.map((item, index) => {
                let addons = item.selectedAddons || item.addons || [];
                if (typeof addons === "string") {
                  try {
                    addons = JSON.parse(addons);
                  } catch {
                    addons = [];
                  }
                }

                return (
                  <div key={index} className="py-1 border-b border-dotted border-zinc-200 dark:border-zinc-800 last:border-none">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-black dark:text-white font-bold" style={{ flex: 2 }}>
                        <span className="text-amber-600 dark:text-amber-400 font-mono mr-1">
                          {item.qty || item.quantity || 1}x
                        </span>
                        {item.title || item.name}
                        {item.size && item.size !== "Regular" && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 ml-1 font-normal">
                            ({item.size})
                          </span>
                        )}
                      </span>
                      <span className="text-black dark:text-white font-mono font-bold shrink-0" style={{ flex: 1, textAlign: "right" }}>
                        Rs. {(
                          parseFloat(item.price || 0) * parseInt(item.qty || item.quantity || 1, 10)
                        ).toFixed(0)}
                      </span>
                    </div>
                    {Array.isArray(addons) && addons.length > 0 && (
                      <div className="space-y-0.5 mt-0.5">
                        {addons.map((addon, aIdx) => (
                          <div key={aIdx} className="text-[10px] text-zinc-500 dark:text-zinc-400 pl-3 font-mono">
                            + {addon.name || addon.addon_name} (Rs. {Number(addon.price || 0)})
                          </div>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 italic pl-3 mt-0.5">
                        Note: {item.note}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-zinc-400 text-center py-2">
                No items recorded
              </div>
            )}
          </div>

          {/* Breakdown & Grand Total */}
          <div className="space-y-1 text-xs pt-1 font-mono">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-black dark:text-white">
                Rs. {subtotal.toFixed(0)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Discount ({couponCode || "Promo"}):</span>
                <span className="font-mono">-Rs. {discount.toFixed(0)}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Delivery Fee:</span>
                <span className="font-mono font-bold text-black dark:text-white">
                  Rs. {deliveryFee.toFixed(0)}
                </span>
              </div>
            )}
            {riderTip > 0 && (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Rider Tip:</span>
                <span className="font-mono font-bold text-black dark:text-white">
                  Rs. {riderTip.toFixed(0)}
                </span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Tax / GST:</span>
                <span className="font-mono font-bold text-black dark:text-white">
                  Rs. {taxAmount.toFixed(0)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-black dark:border-white text-sm font-bold">
              <span className="text-black dark:text-white font-black uppercase">
                GRAND TOTAL
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-black text-base font-mono">
                Rs. {grandTotal.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 mt-3 border-t border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
            <p className="m-0 font-bold">Thank you for dining with BigBite!</p>
            <p className="m-0 mt-0.5">Please visit us again soon.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={executePrint}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer border-none active:scale-95"
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