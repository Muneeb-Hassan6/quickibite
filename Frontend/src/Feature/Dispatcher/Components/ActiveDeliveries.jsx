import React from "react";
import { FaRoute, FaExclamationTriangle, FaMotorcycle } from "react-icons/fa";

const ActiveDeliveries = ({ activeTrips, onComplete }) => {
    return (
        <div className="active-trips-section animate-slide-up">
            <div className="panel-header mb-15">
                <h3><FaRoute /> Active Trips (On The Way)</h3>
            </div>
            {activeTrips.length === 0 ? (
                <div className="empty-trips-message">
                    No active deliveries at the moment.
                </div>
            ) : (
                <div className="active-trips-grid">
                    {activeTrips.map((trip) => (
                        <div key={trip.id} className="dispatch-card active-trip-card">
                            <div className="trip-info">
                                <div className="order-id">Order #{trip.id}</div>
                                <div className="customer-name">{trip.customer} - {trip.address}</div>
                                <div className="assigned-rider-badge">
                                    <FaMotorcycle /> Rider: <strong>{trip.assignedRider.name}</strong>
                                </div>
                            </div>
                            <button className="btn-force-complete" onClick={() => onComplete(trip.id, trip.assignedRider.id)}>
                                <FaExclamationTriangle /> Force Complete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveDeliveries;