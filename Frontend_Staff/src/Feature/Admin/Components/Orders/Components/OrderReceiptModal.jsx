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
      className="admin-modal-overlay"
      onClick={onClose}
      style={{ zIndex: 9999, backdropFilter: "blur(6px)" }} // Glassmorphism Blur Effect
    >
      <div
        className="admin-modal-box animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "420px",
          padding: "0",
          overflow: "hidden",
          border: "1px solid var(--admin-border)",
          borderRadius: "16px",
        }}
      >
        {/* --- HEADER SECTION (Kitchen Jaisa Glowing Design) --- */}
        <div
          style={{
            background: "rgba(239, 68, 68, 0.03)",
            padding: "30px 20px 20px",
            textAlign: "center",
            borderBottom: "1px solid var(--admin-border)",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "transparent",
              border: "none",
              color: "var(--admin-muted)",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            <FaTimes />
          </button>

          <div
            style={{
              width: "65px",
              height: "65px",
              background: "rgba(239, 68, 68, 0.1)",
              color: "var(--admin-orange)",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "28px",
              margin: "0 auto 15px auto",
              boxShadow: "0 0 25px rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <FaPrint />
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "900",
              color: "var(--admin-text)",
            }}
          >
            Customer Receipt
          </h3>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "13px",
              color: "var(--admin-muted)",
              fontWeight: "600",
            }}
          >
            Review invoice details before printing.
          </p>
        </div>

        {/* --- DIGITAL RECEIPT PREVIEW --- */}
        <div style={{ padding: "25px" }}>
          <div
            style={{
              background: "var(--admin-bg)",
              border: "1px dashed var(--admin-border)",
              borderRadius: "12px",
              padding: "20px",
              fontFamily: "'Courier New', Courier, monospace", // Monospace for real receipt feel
            }}
          >
            {/* Order Info */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--admin-muted)",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                  }}
                >
                  ORDER ID
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "900",
                    color: "var(--admin-text)",
                  }}
                >
                  {order.id}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--admin-muted)",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                  }}
                >
                  TYPE
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "900",
                    color: "var(--admin-orange)",
                  }}
                >
                  {order.type || "Delivery"}
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span
                style={{
                  background: "var(--admin-text)",
                  color: "var(--admin-panel)",
                  padding: "6px 20px",
                  borderRadius: "30px",
                  fontWeight: "900",
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                }}
              >
                {order.customerName || "Walk-in Customer"}
              </span>
            </div>

            {/* Items with Prices */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingBottom: "15px",
                borderBottom: "1px dashed var(--admin-border)",
              }}
            >
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "14px",
                  }}
                >
                  <span
                    style={{ color: "var(--admin-text)", fontWeight: "700" }}
                  >
                    {item.qty}x {item.name}
                  </span>
                  <span
                    style={{ color: "var(--admin-muted)", fontWeight: "900" }}
                  >
                    Rs. {item.price ? item.price * item.qty : 0}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Bill */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "15px",
                fontSize: "18px",
              }}
            >
              <span style={{ color: "var(--admin-text)", fontWeight: "900" }}>
                TOTAL
              </span>
              <span style={{ color: "var(--admin-orange)", fontWeight: "900" }}>
                Rs. {order.total || 0}
              </span>
            </div>
          </div>
        </div>

        {/* --- FOOTER BUTTONS --- */}
        <div
          style={{
            padding: "15px 25px",
            background: "rgba(0,0,0,0.1)",
            borderTop: "1px solid var(--admin-border)",
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px",
              background: "transparent",
              border: "1px solid var(--admin-border)",
              color: "var(--admin-muted)",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.color = "#fff";
              e.target.style.borderColor = "#fff";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "var(--admin-muted)";
              e.target.style.borderColor = "var(--admin-border)";
            }}
          >
            Cancel
          </button>

          <button
            onClick={executePrint}
            style={{
              flex: 2,
              padding: "14px",
              background: "var(--admin-orange)",
              border: "none",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: "900",
              fontSize: "15px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
          >
            <FaPrint /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptModal;
