import React from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

const CashierReceiptModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const executePrint = () => {
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-[999999] backdrop-blur-[6px]" onClick={onClose}>
      <div className="bg-[#141417] text-white rounded-[24px] w-full max-w-[450px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        
        <div className="bg-[rgba(239,68,68,0.05)] pt-[30px] px-[20px] pb-[20px] text-center border-b border-[var(--admin-border)] relative">
          <button onClick={onClose} className="absolute top-[15px] right-[15px] bg-transparent border-none text-[var(--admin-muted)] text-[18px] cursor-pointer transition-colors duration-200 hover:text-[var(--text-main,#ffffff)]">
            <FaTimes />
          </button>
          <div className="w-[65px] h-[65px] bg-[rgba(239,68,68,0.1)] text-[var(--brand-red)] rounded-full flex justify-center items-center text-[28px] mx-auto mb-[15px] border border-[rgba(239,68,68,0.2)]">
            <FaPrint />
          </div>
          <h3 className="m-0 font-oswald text-[24px] font-extrabold text-[var(--text-main,#ffffff)] uppercase">
            BigBite Receipt
          </h3>
        </div>

        <div className="p-[25px]">
          <div className="bg-[var(--admin-bg)] border border-dashed border-[#555] rounded-[12px] p-[20px] font-mono">
            
            <div className="flex justify-between mb-[15px] border-b border-dashed border-[#444] pb-[10px]">
              <div>
                <div className="text-[11px] text-[var(--admin-muted)] font-bold">ORDER ID</div>
                <div className="text-[16px] font-black text-[var(--text-main,#ffffff)]">#{order.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="text-[11px] text-[var(--admin-muted)] font-bold">TABLE</div>
                <div className="text-[16px] font-black text-[var(--brand-red)]">{order.table}</div>
              </div>
            </div>

            <div className="mb-[15px] text-[#ccc] text-[13px]">
              <strong>Date:</strong> {order.time} <br/>
              <strong>Customer:</strong> {order.customerName || "Walk-In"}
            </div>

            <div className="border-t border-b border-dashed border-[#444] py-[10px] mb-[15px]">
              <div className="flex justify-between text-[var(--admin-muted)] text-[11px] font-bold mb-[10px]">
                <span>ITEM</span>
                <span>SUBTOTAL</span>
              </div>
              
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-[var(--text-main,#ffffff)] text-[13px] mb-[8px]">
                    <span>{item.qty}x {item.title || item.name}</span>
                    <span>Rs {item.price * item.qty}</span>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-[#777] text-center">Items details not found</div>
              )}
            </div>

            <div className="flex justify-between items-center text-[18px] [&>span:first-child]:text-[var(--text-main,#ffffff)] [&>span:first-child]:font-black [&>span:last-child]:text-[var(--brand-red)] [&>span:last-child]:font-black">
              <span>TOTAL BILL</span>
              <span>Rs. {order.total}</span>
            </div>
            
          </div>
        </div>

        <div className="py-[15px] px-[25px] bg-[rgba(0,0,0,0.2)] border-t border-[var(--admin-border)] flex gap-[12px]">
          <button onClick={onClose} className="flex-1 p-[14px] bg-transparent border border-[var(--admin-border)] text-[var(--text-main,#ffffff)] rounded-[10px] font-bold cursor-pointer transition-colors duration-300 hover:bg-[rgba(255,255,255,0.05)] hover:border-[var(--text-main,#ffffff)]">Done</button>
          <button onClick={executePrint} className="flex-[2] p-[14px] bg-[var(--brand-red)] border-none text-[var(--text-main,#ffffff)] rounded-[10px] font-black text-[15px] font-oswald uppercase flex justify-center items-center gap-[8px] cursor-pointer transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)]">
            <FaPrint /> Print Invoice
          </button>
        </div>

      </div>
    </div>
  );
};

export default CashierReceiptModal;