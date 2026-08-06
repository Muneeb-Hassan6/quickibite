import React from "react";

const StatusToggle = ({ isOnline, onToggle }) => {
    return (
        <div className="status-toggle-bar">
            <div className={`status-text ${isOnline ? 'status-online' : 'status-offline'}`}>
                {isOnline ? "Duty: ONLINE" : "Duty: OFFLINE"}
            </div>
            <div className={`toggle-switch ${isOnline ? 'toggle-bg-on' : 'toggle-bg-off'}`} onClick={onToggle}>
                <div className={`toggle-circle ${isOnline ? 'toggle-circle-on' : 'toggle-circle-off'}`}></div>
            </div>
        </div>
    );
};
export default StatusToggle;