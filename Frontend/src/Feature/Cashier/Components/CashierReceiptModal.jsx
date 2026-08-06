import React from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

const CashierReceiptModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const executePrint = () => {
    window.print();
    onClose();
  };

  return (
    <div className="pos-modal-overlay" onClick={onClose}>
      <div className="pos-modal-box animate-slide-up" onClick={(e) => e.stopPropagation()}>
        
        <div className="receipt-header-box">
          <button onClick={onClose} className="receipt-close-btn">
            <FaTimes />
          </button>
          <div className="receipt-icon-wrapper">
            <FaPrint />
          </div>
          <h3 className="receipt-main-title">
            BigBite Receipt
          </h3>
        </div>

        <div className="receipt-body">
          <div className="receipt-ticket">
            
            <div className="receipt-meta-row">
              <div>
                <div className="receipt-meta-label">ORDER ID</div>
                <div className="receipt-meta-value">#{order.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="receipt-meta-label">TABLE</div>
                <div className="receipt-meta-value red-text">{order.table}</div>
              </div>
            </div>

            <div className="receipt-info-text">
              <strong>Date:</strong> {order.time} <br/>
              <strong>Customer:</strong> {order.customerName || "Walk-In"}
            </div>

            <div className="receipt-items-container">
              <div className="receipt-table-header">
                <span>ITEM</span>
                <span>SUBTOTAL</span>
              </div>
              
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="receipt-item-row">
                    <span>{item.qty}x {item.title || item.name}</span>
                    <span>Rs {item.price * item.qty}</span>
                  </div>
                ))
              ) : (
                <div className="receipt-empty-msg">Items details not found</div>
              )}
            </div>

            <div className="receipt-grand-total">
              <span>TOTAL BILL</span>
              <span>Rs. {order.total}</span>
            </div>
            
          </div>
        </div>

        <div className="receipt-footer-actions">
          <button onClick={onClose} className="btn-receipt-done">Done</button>
          <button onClick={executePrint} className="btn-receipt-print">
            <FaPrint /> Print Invoice
          </button>
        </div>

      </div>
    </div>
  );
};

export default CashierReceiptModal;