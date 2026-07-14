import React from "react";

const StatusToggle = ({ isOnline, onToggle }) => {
    return (
        <div className="flex justify-between items-center p-[15px_20px] bg-[var(--admin-bg)] ">
            <div className={`font-bold text-[15px] tracking-[0.5px] uppercase font-oswald ${isOnline ? 'text-[var(--rider-success)]' : 'text-[var(--admin-muted)]'}`}>
                {isOnline ? "Duty: ONLINE" : "Duty: OFFLINE"}
            </div>
            <div className={`w-[54px] h-[30px] rounded-[30px] relative cursor-pointer transition-[background] duration-300 ease  ${isOnline ? 'bg-[var(--rider-success)]' : 'bg-[var(--admin-muted)]'}`} onClick={onToggle}>
                <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[3px] transition-[left] duration-300 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${isOnline ? 'left-[27px]' : 'left-[4px]'}`}></div>
            </div>
        </div>
    );
};
export default StatusToggle;