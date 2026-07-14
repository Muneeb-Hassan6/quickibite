import React from 'react';
import { FaBrain, FaRoute, FaCamera, FaCheckCircle } from "react-icons/fa";

const DeliveryActions = ({ isArrived, aiData, distance, orderStatus, simulateDriving, handlePhotoUpload, deliveryPhoto, completeDelivery }) => {
    return (
        <div className={`bg-[var(--admin-panel)] p-[20px] rounded-[16px] mb-[20px] shadow-sm ${isArrived ? 'ring-2 ring-[var(--rider-success)] shadow-[0_4px_15px_rgba(16,185,129,0.2)]' : ''}`}>
            <div className="grid grid-cols-2 gap-[15px] mb-[15px]">
                <div className="bg-[rgba(239,68,68,0.05)] p-[15px] rounded-[12px] text-center">
                    <div className="text-[12px] font-bold flex items-center justify-center gap-[6px] uppercase text-[var(--admin-muted)] purple"><FaBrain /> AI Traffic ETA</div>
                    <div className="text-[26px] font-semibold text-[var(--admin-text)] mt-[5px] font-oswald">{isArrived ? "Arrived" : aiData.eta}</div>
                </div>
                <div className="bg-[rgba(239,68,68,0.05)] p-[15px] rounded-[12px] text-center">
                    <div className="text-[12px] font-bold flex items-center justify-center gap-[6px] uppercase text-[var(--admin-muted)] blue"><FaRoute /> Road Distance</div>
                    <div className="text-[26px] font-semibold text-[var(--admin-text)] mt-[5px] font-oswald">{isArrived ? "0 km" : aiData.roadDistance}</div>
                </div>
            </div>
            <div className="text-[12px] font-semibold text-[var(--admin-muted)] text-center mb-[15px] uppercase">Geofence Aerial Distance: {distance !== null ? `${distance}m` : "..."}</div>

            {orderStatus === "heading_to_customer" && (
                <button onClick={simulateDriving} className="w-full p-[16px] bg-[var(--admin-panel)] text-[var(--admin-text)] border-2 border-white shadow-sm rounded cursor-pointer font-bold text-[16px] font-oswald uppercase">🚗 Drive Closer</button>
            )}

            {orderStatus === "arrived" && (
                <label className="block w-full p-[16px] bg-gradient-to-r from-[#ef4444] to-[#b71c1c] text-white text-center rounded-[10px] cursor-pointer font-bold text-[16px] font-oswald uppercase border-none shadow-[var(--shadow-glow)]">
                    <FaCamera style={{ marginRight: "8px" }} /> Take Proof of Delivery
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: "none" }} />
                </label>
            )}

            {orderStatus === "photo_captured" && (
                <div className="text-center mt-[15px]">
                    <img src={deliveryPhoto} alt="Proof" className="w-[100px] h-[100px] rounded-[12px] object-cover mb-[20px] p-[4px] bg-[var(--admin-panel)] shadow-sm" />
                    {/* 🔥 Swipe Button ki jagah Simple aur Reliable Click Button */}
                    <button className="w-full p-[15px] bg-[var(--rider-success)] text-white border-none rounded-[10px] font-bold text-[15px] cursor-pointer flex justify-center items-center gap-[8px] font-oswald uppercase mt-[15px]" onClick={completeDelivery}>
                        <FaCheckCircle /> Complete Delivery
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeliveryActions;