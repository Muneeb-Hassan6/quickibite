import React from 'react';
import { FaBrain, FaRoute, FaCamera, FaCheckCircle } from "react-icons/fa";

const DeliveryActions = ({ isArrived, aiData, distance, orderStatus, simulateDriving, handlePhotoUpload, deliveryPhoto, completeDelivery }) => {
    return (
        <div className={`action-box ${isArrived ? 'arrived' : ''}`}>
            <div className="eta-grid">
                <div className="eta-box">
                    <div className="eta-label purple"><FaBrain /> AI Traffic ETA</div>
                    <div className="eta-value">{isArrived ? "Arrived" : aiData.eta}</div>
                </div>
                <div className="eta-box">
                    <div className="eta-label blue"><FaRoute /> Road Distance</div>
                    <div className="eta-value">{isArrived ? "0 km" : aiData.roadDistance}</div>
                </div>
            </div>
            <div className="aerial-distance">Geofence Aerial Distance: {distance !== null ? `${distance}m` : "..."}</div>

            {orderStatus === "heading_to_customer" && (
                <button onClick={simulateDriving} className="btn-drive">🚗 Drive Closer</button>
            )}

            {orderStatus === "arrived" && (
                <label className="btn-camera">
                    <FaCamera style={{ marginRight: "8px" }} /> Take Proof of Delivery
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: "none" }} />
                </label>
            )}

            {orderStatus === "photo_captured" && (
                <div className="photo-proof-container">
                    <img src={deliveryPhoto} alt="Proof" className="proof-img" />
                    {/* 🔥 Swipe Button ki jagah Simple aur Reliable Click Button */}
                    <button className="btn-direct-complete" onClick={completeDelivery} style={{ marginTop: '15px' }}>
                        <FaCheckCircle /> Complete Delivery
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeliveryActions;