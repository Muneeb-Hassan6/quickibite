import React from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

const PrintModal = ({ printOrder, onClose }) => {
  if (!printOrder) return null;

  const executePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Thermal Printer HTML format (Isay bahar nahi le ja sakte)
    const content = `
      <html>
        <head>
          <title>KOT - ${printOrder.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 10px; width: 300px; margin: 0 auto; color: #000; background: #fff; }
            .center { text-align: center; }
            .brand { font-size: 24px; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px; }
            .title { font-size: 18px; font-weight: bold; border-bottom: 2px dashed #000; border-top: 2px dashed #000; padding: 5px 0; margin-bottom: 10px; }
            .meta-data { font-size: 14px; margin-bottom: 5px; font-weight: bold; }
            .divider { border-bottom: 1px solid #000; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-bottom: 6px; }
            .note { font-size: 12px; font-style: italic; margin-left: 25px; margin-bottom: 8px; }
            .table-box { background: #000; color: #fff; font-size: 20px; padding: 8px; text-align: center; font-weight: 900; margin: 15px 0; border-radius: 4px; }
            .footer { text-align: center; font-size: 12px; margin-top: 20px; font-weight: bold;}
          </style>
        </head>
        <body>
          <div class="center">
            <div class="brand">BIG BITE</div>
            <div class="title">KITCHEN ORDER TICKET</div>
          </div>
          <div class="meta-data">Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          <div class="meta-data">Order ID: #${printOrder.id}</div>
          <div class="meta-data">Type: ${printOrder.type.toUpperCase()}</div>
          <div class="table-box">${printOrder.table ? printOrder.table.toUpperCase() : "TAKEAWAY"}</div>
          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 5px;">
             <span>QTY x ITEM</span>
          </div>
          <div class="divider"></div>
          ${printOrder.items.map((item) => `
            <div class="item-row"><span>${item.qty}x ${item.name}</span></div>
            ${item.note ? `<div class="note">** Note: ${item.note}</div>` : ""}
          `).join("")}
          <div class="divider"></div>
          <div class="center" style="font-size: 16px; font-weight: bold; margin-top: 10px;">
            TOTAL ITEMS: ${printOrder.items.reduce((a, b) => a + b.qty, 0)}
          </div>
          <div class="footer">*** END OF KOT ***</div>
        </body>
      </html>
    `;
    iframe.contentWindow.document.write(content);
    iframe.contentWindow.document.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => { document.body.removeChild(iframe); onClose(); }, 1000);
  };

  return (
    <div className="k-modal-overlay" onClick={onClose}>
      <div className="k-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="k-modal-header">
          <button onClick={onClose} className="k-modal-close"><FaTimes /></button>
          <div className="k-modal-icon-wrapper"><FaPrint /></div>
          <h3 className="k-modal-title">Kitchen Ticket (KOT)</h3>
        </div>

        <div className="k-modal-body">
          <div className="k-receipt-preview">
            <div style={{ textAlign: "center", marginBottom: "15px", borderBottom: "1px dashed #333", paddingBottom: "10px" }}>
              <h4 style={{ margin: 0, color: "var(--brand-red)", fontSize: "18px" }}>BIG BITE</h4>
              <span style={{ fontSize: "12px", color: "#888" }}>Order #{printOrder.id}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px", color: "#ccc" }}>
              <span>Type: <strong style={{ color: "#fff" }}>{printOrder.type}</strong></span>
              <span>Table: <strong style={{ color: "#fff" }}>{printOrder.table}</strong></span>
            </div>
            <div style={{ borderTop: "1px dashed #333", paddingTop: "10px", marginTop: "10px" }}>
              {printOrder.items.map((item, idx) => (
                <div key={idx} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold" }}>
                    <span>{item.name}</span>
                    <span style={{ color: "var(--brand-red)" }}>x{item.qty}</span>
                  </div>
                  {item.note && <div style={{ fontSize: "11px", color: "#888", fontStyle: "italic", marginTop: "2px" }}>- {item.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="k-modal-footer">
          <button onClick={onClose} className="k-btn-cancel">Cancel</button>
          <button onClick={executePrint} className="k-btn-print">
            <FaPrint /> Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;