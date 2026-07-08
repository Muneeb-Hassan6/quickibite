import React from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaShoppingBag, FaMoneyBillWave, FaWhatsapp } from "react-icons/fa";

const ActiveOrderCard = ({ order, onComplete, onCancel }) => {
    if (!order) return null;
    const isCod = order.paymentType === "Cash on Delivery";

    return (
        <div className="order-card-pro">
            <div className="order-pro-header">
                <span className="order-pro-id"># {order.id}</span>
                <span className="order-pro-time">{order.time}</span>
            </div>

            <div className="order-pro-body">
                <div className="order-pro-customer">
                    <div>
                        <div className="customer-name-large">{order.customer}</div>
                        <div className="customer-phone-muted">{order.phone}</div>
                    </div>

                    <div className="communication-buttons">
                        <a href={`tel:${order.phone}`} className="btn-call"><FaPhoneAlt /> Call</a>
                        <a href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`} className="btn-whatsapp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /> WhatsApp</a>
                    </div>
                </div>

                <div className="order-pro-address">
                    <FaMapMarkerAlt color="#ef4444" size={20} className="margin-none" style={{ flexShrink: 0 }} />
                    <span>{order.address}</span>
                </div>

                <div className="order-items-box">
                    <div className="section-label"><FaShoppingBag /> ORDER ITEMS</div>
                    {order.items}
                </div>

                <div className="order-pro-payment">
                    <div>
                        <div className="section-label"><FaMoneyBillWave /> TO COLLECT</div>
                        <div className="payment-amount">{isCod ? order.total : "PAID"}</div>
                    </div>
                    <div className={`payment-type-tag ${isCod ? 'payment-cod' : 'payment-online'}`}>
                        {order.paymentType}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button 
                        className="btn-decline" 
                        onClick={onCancel} 
                        style={{ flex: 1, padding: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn-direct-complete" 
                        onClick={onComplete}
                        style={{ flex: 2 }}
                    >
                        Mark as Delivered
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ActiveOrderCard;