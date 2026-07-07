import React from "react";
import { FaMotorcycle, FaStar, FaBiking, FaBox } from "react-icons/fa";

const ActiveRidersList = ({ riders, selectedId, onSelect }) => {
    return (
        <div className="dispatch-panel">
            <div className="panel-header">
                <h3><FaMotorcycle /> Active Riders</h3>
                <p>Select an available rider to assign order</p>
            </div>
            <div className="card-list">
                {riders.map((rider) => (
                    <div key={rider.id} className={`dispatch-card rider-card ${rider.status !== "Available" ? "disabled" : ""} ${selectedId === rider.id ? "selected" : ""}`} onClick={() => rider.status === "Available" && onSelect(rider)}>
                        <div className="w-100">
                            <div className="rider-info flex-between">
                                <div className="flex-center-gap">
                                    <div className="rider-avatar">{rider.name.charAt(0)}</div>
                                    <div>
                                        <h4 className="rider-name">{rider.name}
                                            <span className="vehicle-tag ml-5"><FaBiking size={10} /> {rider.vehicle}</span>
                                        </h4>
                                        <span className="rider-phone">{rider.phone}</span>
                                    </div>
                                </div>
                                <div className="rating-badge"><FaStar size={10} /> {rider.rating}</div>
                            </div>

                            {rider.status === "On Delivery" ? (
                                <div className="current-order-badge">
                                    <span className="current-order-text"><FaBox /> ONGOING: #{rider.currentOrderId}</span>
                                    <span className="section-label margin-none">Busy</span>
                                </div>
                            ) : (
                                <div className="rider-details-grid">
                                    <div className="rider-stat-item"><span>Trips:</span> <strong className="text-white">{rider.trips}</strong></div>
                                    <div className="rider-stat-item"><span>Accuracy:</span> <strong className="accuracy-text">{rider.accuracy}</strong></div>
                                </div>
                            )}
                        </div>
                        <div className="ml-5">
                            <span className={`status-badge ${rider.status === "Available" ? "bg-green" : "bg-orange"}`}>{rider.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ActiveRidersList;