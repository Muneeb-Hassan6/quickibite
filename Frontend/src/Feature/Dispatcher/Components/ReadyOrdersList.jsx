import React from "react";
import { FaBoxOpen, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaCreditCard, FaExclamationTriangle } from "react-icons/fa";

const ReadyOrdersList = ({ orders, selectedId, onSelect }) => {
    return (
        <div className="dispatch-panel">
            <div className="panel-header">
                <h3><FaBoxOpen /> Ready Orders</h3>
            </div>
            <div className="card-list">
                {orders.map((order) => (
                    <div key={order.id} className={`dispatch-card ${selectedId === order.id ? "selected" : ""} ${order.isUrgent ? "urgent-card" : ""}`} onClick={() => onSelect(order)}>
                        <div className="card-top">
                            <span className="order-id">#{order.id}</span>
                            <span className={`order-time ${order.isUrgent ? "text-red" : ""}`}>
                                <FaClock /> {order.time}
                                {order.isUrgent && <FaExclamationTriangle className="ml-5" />}
                            </span>
                        </div>
                        <h4 className="customer-name">{order.customer}</h4>
                        <p className="order-address"><FaMapMarkerAlt /> {order.address}</p>
                        <div className="payment-badge-row">
                            <span className={`payment-badge ${order.payment === "COD" ? "cod" : "paid"}`}>
                                {order.payment === "COD" ? <FaMoneyBillWave /> : <FaCreditCard />} {order.payment}
                            </span>
                        </div>
                        <div className="card-bottom">
                            <span className="order-items">{order.items}</span>
                            <span className="order-total">{order.total}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReadyOrdersList;