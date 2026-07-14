import React from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaShoppingBag, FaMoneyBillWave, FaWhatsapp } from "react-icons/fa";

const ActiveOrderCard = ({ order, onComplete, onCancel }) => {
    if (!order) return null;
    const isCod = order.paymentType === "Cash on Delivery";

    return (
        <div className="bg-[var(--admin-panel)] rounded-[16px] overflow-hidden  mb-[20px] relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-[6px] before:h-full before:bg-[var(--admin-yellow)]">
            <div className="p-[15px_20px] flex justify-between items-center ">
                <span className="text-[20px] text-[var(--admin-text)] font-oswald"># {order.id}</span>
                <span className="text-[12px] text-[var(--admin-muted)] font-semibold">{order.time}</span>
            </div>

            <div className="p-[20px]">
                <div className="flex items-center justify-between gap-[10px] mb-[20px]">
                    <div>
                        <div className="text-[18px] font-bold text-[var(--admin-text)] mb-[4px]">{order.customer}</div>
                        <div className="text-[#888] text-[14px]">{order.phone}</div>
                    </div>

                    <div className="flex gap-[10px]">
                        <a href={`tel:${order.phone}`} className="bg-[rgba(239,68,68,0.1)] text-[var(--admin-orange)] p-[10px_18px] rounded-[8px] font-semibold flex items-center gap-[8px] text-[14px]"><FaPhoneAlt /> Call</a>
                        <a href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`} className="bg-[#25d366] text-white  p-[10px_15px] rounded-[8px] font-semibold flex items-center gap-[8px] text-[14px] " target="_blank" rel="noopener noreferrer"><FaWhatsapp /> WhatsApp</a>
                    </div>
                </div>

                <div className="bg-[var(--admin-bg)] p-[15px] rounded-[12px] text-[var(--admin-text)] mb-[15px]  text-[14px] leading-[1.6] flex items-start gap-[6px]">
                    <FaMapMarkerAlt color="#ef4444" size={20} className="m-0" style={{ flexShrink: 0 }} />
                    <span>{order.address}</span>
                </div>

                <div className="bg-[var(--admin-bg)] p-[15px] rounded-[12px] text-[var(--admin-text)] mb-[15px]  text-[14px] leading-[1.6]">
                    <div className="text-[10px] font-bold text-[var(--admin-muted)] uppercase tracking-[1px] mb-[8px] m-0"><FaShoppingBag /> ORDER ITEMS</div>
                    {order.items}
                </div>

                <div className="bg-[var(--admin-bg)] p-[15px] rounded-[12px] text-[var(--admin-text)] mb-[15px]  text-[14px] leading-[1.6] flex justify-between items-center">
                    <div>
                        <div className="text-[10px] font-bold text-[var(--admin-muted)] uppercase tracking-[1px] mb-[8px] m-0"><FaMoneyBillWave /> TO COLLECT</div>
                        <div className="text-[26px] text-[var(--admin-text)] font-oswald">{isCod ? order.total : "PAID"}</div>
                    </div>
                    <div className={`text-[12px] p-[6px_14px] rounded-[6px] font-bold uppercase text-center ${isCod ? 'bg-[var(--admin-yellow)] text-[#000]' : 'bg-[rgba(255,255,255,0.1)] text-[var(--admin-text)]'}`}>
                        {order.paymentType}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button
                        onClick={onCancel}
                        style={{ flex: 1, padding: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="w-full p-[15px] bg-[var(--rider-success)] text-white  rounded font-bold text-[15px] cursor-pointer flex justify-center items-center gap-[8px] font-oswald uppercase"
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