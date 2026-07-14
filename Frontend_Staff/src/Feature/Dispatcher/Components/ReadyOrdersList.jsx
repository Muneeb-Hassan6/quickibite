import React from "react";
import { FaBoxOpen, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaCreditCard, FaExclamationTriangle } from "react-icons/fa";

const ReadyOrdersList = ({ orders, selectedId, onSelect }) => {
    return (
        <div className="bg-[var(--admin-panel)] rounded-[12px] p-[15px] h-[calc(100vh-580px)] min-h-[550px] overflow-y-auto m-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="mb-[15px] border-b border-[var(--admin-border)] pb-[10px]">
                <h3 className="m-[0_0_4px_0] flex items-center gap-[8px] text-[var(--admin-text)] font-oswald uppercase text-[1.17em] font-bold"><FaBoxOpen /> Ready Orders</h3>
            </div>
            <div className="flex flex-col gap-[12px]">
                {orders.map((order) => (
                    <div key={order.id} className={`bg-[var(--admin-bg)] rounded-[10px] p-[16px] cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] ${selectedId === order.id ? "ring-2 ring-[var(--rider-success)] bg-[rgba(16,185,129,0.08)]! shadow-[0_4px_15px_rgba(16,185,129,0.2)]!" : "shadow-sm"} ${order.isUrgent ? "ring-2 ring-[var(--brand-red)] bg-[rgba(239,68,68,0.05)] animate-[redPulse_2s_infinite]" : ""}`} onClick={() => onSelect(order)}>
                        <div className="flex justify-between mb-[8px]">
                            <span className="font-extrabold text-[16px] text-[var(--brand-red)] font-oswald">#{order.id}</span>
                            <span className={`text-[11px] text-[var(--admin-muted)] flex items-center gap-[5px] font-semibold ${order.isUrgent ? "text-[var(--brand-red)]! font-bold" : ""}`}>
                                <FaClock /> {order.time}
                                {order.isUrgent && <FaExclamationTriangle className="ml-[5px]" />}
                            </span>
                        </div>
                        <h4 className="m-[0_0_5px_0] text-[18px] font-bold">{order.customer}</h4>
                        <p className="m-[0_0_10px_0] text-[13px] text-[#d1d5db] flex items-center gap-[6px]"><FaMapMarkerAlt /> {order.address}</p>
                        <div className="mb-[5px]">
                            <span className={`inline-flex items-center gap-[4px] p-[4px_8px] rounded-[4px] text-[11px] font-bold uppercase ${order.payment === "COD" ? "bg-[rgba(245,158,11,0.1)] text-[var(--admin-orange)] border border-[rgba(245,158,11,0.2)]" : "bg-[rgba(16,185,129,0.1)] text-[var(--rider-success)] border border-[rgba(16,185,129,0.2)]"}`}>
                                {order.payment === "COD" ? <FaMoneyBillWave /> : <FaCreditCard />} {order.payment}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-[var(--admin-border)] pt-[8px] mt-[8px]">
                            <span className="text-[12px] text-[var(--admin-muted)]">{order.items}</span>
                            <span className="font-extrabold text-[var(--rider-success)]">{order.total}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReadyOrdersList;