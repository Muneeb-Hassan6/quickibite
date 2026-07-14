import React, { useRef } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const DispatcherMap = ({ riders, MAPBOX_TOKEN, viewState, setViewState }) => {
    const mapRef = useRef(null);

    const handleMapLoad = (e) => {
        if (e && e.target) {
            e.target.resize();
        }
    };

    return (
        <div className="bg-[var(--admin-panel)] rounded-[12px] p-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] animate-slide-up">
            <div className="mb-[15px] border-b border-[var(--admin-border)] pb-[10px]">
                <h3 className="m-0 border-none p-0 flex items-center gap-[8px] text-[var(--admin-text)] font-oswald uppercase text-[1.17em] font-bold">📍 Real-time Rider Tracking</h3>
            </div>

            <div className="h-[350px] w-full rounded-[8px] overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] relative">
                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    /* 🔥 STYLE CHANGED TO LIGHT (DAY) MODE */
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    onLoad={handleMapLoad}
                >
                    {riders.map(rider => (
                        <Marker
                            key={rider.id}
                            longitude={rider.location.lng}
                            latitude={rider.location.lat}
                            anchor="bottom"
                        >
                            <div className="flex flex-col items-center cursor-pointer">
                                {/* 🔥 Motorbike Icon setup */}
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/3198/3198336.png"
                                    className="w-[45px] drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] bg-white p-[5px] rounded-full border-[2px] border-[#ef4444]"
                                    alt="Delivery Motorbike"
                                />
                                <div className="bg-[var(--bg-body)] text-[var(--text-main,#ffffff)] p-[2px_8px] rounded-[4px] text-[11px] font-bold mt-[-5px] shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-[var(--admin-border)]">
                                    {rider.name}
                                </div>
                            </div>
                        </Marker>
                    ))}
                </Map>
            </div>
        </div>
    );
};

export default DispatcherMap;