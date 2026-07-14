import React, { useState, useEffect } from 'react';
import { FaWifi } from 'react-icons/fa';

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }, []);

    if (isOnline) return null;
    return (
        <div className="bg-[var(--admin-orange)] text-white text-center p-[10px] absolute top-0 left-0 w-full z-[9999] font-bold text-[13px] flex justify-center items-center gap-[8px]">
            <FaWifi /> No Internet Connection. App is offline!
        </div>
    );
};
export default NetworkStatus;