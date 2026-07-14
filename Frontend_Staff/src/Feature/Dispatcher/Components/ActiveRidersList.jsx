import React from "react";
import { FaMotorcycle, FaStar, FaBiking, FaBox } from "react-icons/fa";

const ActiveRidersList = ({ riders, selectedId, onSelect }) => {
    return (
        <div className="bg-[var(--admin-panel)] rounded-[12px] p-[15px] h-[calc(100vh-580px)] min-h-[550px] overflow-y-auto m-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="mb-[15px] border-b border-[var(--admin-border)] pb-[10px]">
                <h3 className="m-[0_0_4px_0] flex items-center gap-[8px] text-[var(--admin-text)] font-oswald uppercase text-[1.17em] font-bold"><FaMotorcycle /> Active Riders</h3>
                <p className="m-0 text-[var(--admin-muted)] text-[12px]">Select an available rider to assign order</p>
            </div>
            <div className="flex flex-col gap-[12px]">
                {riders.map((rider) => (
                    <div key={rider.id} className={`bg-[var(--admin-bg)] rounded-[10px] p-[16px] cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] flex justify-between items-center ${rider.status !== "Available" ? "opacity-50 cursor-not-allowed grayscale hover:translate-y-0 hover:shadow-none" : "shadow-sm"} ${selectedId === rider.id ? "ring-2 ring-[var(--rider-success)] bg-[rgba(16,185,129,0.08)]! shadow-[0_4px_15px_rgba(16,185,129,0.2)]!" : ""}`} onClick={() => rider.status === "Available" && onSelect(rider)}>
                        <div className="w-full">
                            <div className="flex justify-between w-full">
                                <div className="flex items-center gap-[15px]">
                                    <div className="w-[40px] h-[40px] bg-[var(--brand-red)] text-white font-extrabold text-[16px] flex items-center justify-center rounded-full">{rider.name.charAt(0)}</div>
                                    <div>
                                        <h4 className="m-[0_0_2px_0] text-[15px] font-bold">{rider.name}
                                            <span className="text-[10px] bg-[var(--admin-bg)] border border-[var(--admin-border)] p-[2px_6px] rounded-[4px] text-[var(--admin-text)] ml-[5px] inline-flex items-center"><FaBiking size={10} className="mr-[3px]" /> {rider.vehicle}</span>
                                        </h4>
                                        <span className="text-[12px] text-[var(--admin-muted)]">{rider.phone}</span>
                                    </div>
                                </div>
                                <div className="bg-[rgba(245,158,11,0.1)] text-[var(--admin-orange)] p-[2px_6px] rounded-[4px] text-[11px] font-extrabold flex items-center gap-[3px] h-fit"><FaStar size={10} /> {rider.rating}</div>
                            </div>

                            {rider.status === "On Delivery" ? (
                                <div className="mt-[8px] bg-[rgba(239,68,68,0.05)] border border-dashed border-[var(--brand-red)] p-[6px_10px] rounded-[6px] flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-[var(--brand-red)] font-oswald flex items-center gap-[4px]"><FaBox /> ONGOING: #{rider.currentOrderId}</span>
                                    <span className="p-[2px_8px] rounded-[4px] bg-[var(--admin-border)] text-[var(--admin-text)] text-[10px] font-bold m-0 uppercase">Busy</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-[8px] mt-[8px]">
                                    <div className="text-[11px] text-[var(--admin-muted)] flex items-center gap-[5px] font-semibold"><span>Trips:</span> <strong className="text-white">{rider.trips}</strong></div>
                                    <div className="text-[11px] text-[var(--admin-muted)] flex items-center gap-[5px] font-semibold"><span>Accuracy:</span> <strong className="text-[var(--rider-success)]">{rider.accuracy}</strong></div>
                                </div>
                            )}
                        </div>
                        <div className="ml-[5px]">
                            <span className={`p-[4px_10px] rounded-[12px] text-[11px] font-extrabold uppercase ${rider.status === "Available" ? "bg-[rgba(16,185,129,0.15)] text-[var(--rider-success)] border border-[rgba(16,185,129,0.3)]" : "bg-[rgba(245,158,11,0.15)] text-[var(--admin-orange)] border border-[rgba(245,158,11,0.3)]"}`}>{rider.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ActiveRidersList;