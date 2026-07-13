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
      className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] z-[9999] backdrop-blur-[6px] flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[26.25rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[1rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER SECTION (Kitchen Jaisa Glowing Design) --- */}
        <div className="bg-[rgba(239,68,68,0.03)] p-[1.875rem_1.25rem_1.25rem] text-center border-b border-[var(--admin-border)] relative">
          <button
            onClick={onClose}
            className="absolute top-[0.938rem] right-[0.938rem] bg-transparent border-none text-[var(--admin-muted)] text-[1rem] cursor-pointer transition-colors duration-200 hover:text-[var(--admin-text)]"
          >
            <FaTimes />
          </button>

          <div className="w-[4.063rem] h-[4.063rem] bg-[rgba(239,68,68,0.1)] text-[var(--admin-orange)] rounded-full flex justify-center items-center text-[1.75rem] mx-auto mb-[0.938rem] shadow-[0_0_25px_rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.2)]">
            <FaPrint />
          </div>
          <h3 className="m-0 text-[1.375rem] font-black text-[var(--admin-text)]">
            Customer Receipt
          </h3>
          <p className="m-0 mt-[0.313rem] text-[0.813rem] text-[var(--admin-muted)] font-semibold">
            Review invoice details before printing.
          </p>
        </div>

        {/* --- DIGITAL RECEIPT PREVIEW --- */}
        <div className="p-[1.563rem]">
          <div className="bg-[var(--admin-bg)] border border-dashed border-[var(--admin-border)] rounded-[0.75rem] p-[1.25rem] font-['Courier_New',Courier,monospace]">
            {/* Order Info */}
            <div className="flex justify-between items-center mb-[0.938rem]">
              <div>
                <div className="text-[0.688rem] text-[var(--admin-muted)] font-bold tracking-[1px]">
                  ORDER ID
                </div>
                <div className="text-[1rem] font-black text-[var(--admin-text)]">
                  {order.id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[0.688rem] text-[var(--admin-muted)] font-bold tracking-[1px]">
                  TYPE
                </div>
                <div className="text-[0.875rem] font-black text-[var(--admin-orange)]">
                  {order.type || "Delivery"}
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div className="text-center mb-[1.25rem]">
              <span className="bg-[var(--admin-text)] text-[var(--admin-panel)] py-[0.375rem] px-[1.25rem] rounded-[1.875rem] font-black text-[0.875rem] tracking-[0.5px] inline-block">
                {order.customerName || "Walk-in Customer"}
              </span>
            </div>

            {/* Items with Prices */}
            <div className="flex flex-col gap-[0.625rem] pb-[0.938rem] border-b border-dashed border-[var(--admin-border)]">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-[0.875rem]"
                >
                  <span className="text-[var(--admin-text)] font-bold">
                    {item.qty}x {item.name}
                  </span>
                  <span className="text-[var(--admin-muted)] font-black">
                    Rs. {item.price ? item.price * item.qty : 0}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Bill */}
            <div className="flex justify-between items-center mt-[0.938rem] text-[1.125rem]">
              <span className="text-[var(--admin-text)] font-black">
                TOTAL
              </span>
              <span className="text-[var(--admin-orange)] font-black">
                Rs. {order.total || 0}
              </span>
            </div>
          </div>
        </div>

        {/* --- FOOTER BUTTONS --- */}
        <div className="p-[0.938rem_1.563rem] bg-[rgba(0,0,0,0.1)] border-t border-[var(--admin-border)] flex gap-[0.75rem]">
          <button
            onClick={onClose}
            className="flex-1 p-[0.875rem] bg-transparent border border-[var(--admin-border)] text-[var(--admin-muted)] rounded-[0.625rem] font-bold cursor-pointer transition-colors duration-200 hover:text-white hover:border-white"
          >
            Cancel
          </button>

          <button
            onClick={executePrint}
            className="flex-[2] p-[0.875rem] bg-[var(--admin-orange)] border-none text-white rounded-[0.625rem] font-black text-[0.938rem] flex justify-center items-center gap-[0.5rem] cursor-pointer shadow-[0_4px_15px_rgba(239,68,68,0.3)] transition-transform duration-200 hover:-translate-y-[2px]"
          >
            <FaPrint /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptModal;
