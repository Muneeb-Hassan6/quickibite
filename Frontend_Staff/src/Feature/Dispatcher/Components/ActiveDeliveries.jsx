import React from "react";
import { FaRoute, FaExclamationTriangle, FaMotorcycle } from "react-icons/fa";

const ActiveDeliveries = ({ activeTrips, onComplete }) => {
    return (
        <div className="bg-[var(--admin-panel)] rounded-[12px] p-[15px] h-[calc(100vh-580px)] min-h-[550px] overflow-y-auto m-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] animate-slide-up">
            <div className="mb-[15px] border-b border-[var(--admin-border)] pb-[10px]">
                <h3 className="m-[0_0_4px_0] flex items-center gap-[8px] text-[var(--admin-text)] font-oswald uppercase text-[1.17em] font-bold"><FaRoute /> Active Trips (On The Way)</h3>
            </div>
            {activeTrips.length === 0 ? (
                <div className="text-center text-[var(--admin-muted)] p-[40px_0] text-[14px]  rounded-[8px] mt-[10px]">
                    No active deliveries at the moment.
                </div>
            ) : (
                <div className="flex flex-col gap-[12px]">
                    {activeTrips.map((trip) => (
                        <div key={trip.id} className="border-l-[4px] border-l-[var(--rider-success)]! flex justify-between items-center bg-[var(--admin-bg)] rounded-[10px] p-[16px] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] shadow-sm">
                            <div>
                                <div className="font-extrabold text-[16px] text-[var(--brand-red)] font-oswald mb-[8px]">Order #{trip.id}</div>
                                <div className="m-[0_0_5px_0] text-[15px] font-bold">{trip.customer} - {trip.address}</div>
                                <div className="inline-flex items-center gap-[6px] bg-[var(--admin-panel)] p-[4px_8px] rounded-[6px] mt-[6px] text-[12px] text-[var(--admin-text)] shadow-sm">
                                    <FaMotorcycle /> Rider: <strong>{trip.assignedRider.name}</strong>
                                </div>
                            </div>
                            <button className="bg-[rgba(239,68,68,0.1)] text-[var(--brand-red)] border-none p-[8px_12px] rounded-[6px] font-bold cursor-pointer flex items-center gap-[6px] transition-all duration-300 font-oswald uppercase text-[12px] hover:bg-[var(--brand-red)] hover:text-white hover:shadow-[var(--shadow-glow)]" onClick={() => onComplete(trip.id, trip.assignedRider.id)}>
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