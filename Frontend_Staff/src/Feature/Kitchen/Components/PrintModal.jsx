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
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-[9999] backdrop-blur-[6px]" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-[var(--k-panel)] border border-[var(--k-border)] rounded-[16px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[rgba(239,68,68,0.05)] p-[25px_20px_15px] text-center border-b border-[var(--k-border)] relative">
          <button onClick={onClose} className="absolute top-[15px] right-[15px] bg-transparent border-none text-[var(--k-muted)] text-[18px] cursor-pointer transition-colors duration-200 hover:text-[var(--text-main,#ffffff)]"><FaTimes /></button>
          <div className="w-[60px] h-[60px] bg-[rgba(239,68,68,0.1)] text-[var(--brand-red)] rounded-full flex justify-center items-center text-[26px] mx-auto mb-[10px] border border-[rgba(239,68,68,0.3)]"><FaPrint /></div>
          <h3 className="m-0 text-[22px] font-oswald text-[var(--text-main,#ffffff)] uppercase tracking-[1px]">Kitchen Ticket (KOT)</h3>
        </div>

        <div className="p-[20px]">
          <div className="bg-[var(--bg-body,#0a0a0a)] border border-dashed border-[var(--border-color,#333)] rounded-[8px] p-[15px] font-mono text-[var(--text-main,#ffffff)]">
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

        <div className="p-[15px_20px] bg-[rgba(0,0,0,0.2)] flex gap-[10px] border-t border-[var(--k-border)]">
          <button onClick={onClose} className="flex-1 rounded p-[12px] bg-transparent border border-[var(--k-border)] text-[var(--text-main,#ffffff)]  font-bold cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]">Cancel</button>
          <button onClick={executePrint} className="flex-[2] rounded p-[12px] bg-[var(--brand-yellow)] border-none text-[var(--text-main,#ffffff)]  font-black font-oswald text-[15px] uppercase tracking-[1px] cursor-pointer flex justify-center items-center gap-[8px] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)]">
            <FaPrint /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;