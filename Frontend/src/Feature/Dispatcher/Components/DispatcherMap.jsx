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
        <div className="dispatcher-map-section animate-slide-up">
            <div className="panel-header" style={{ marginBottom: "15px" }}>
                <h3 style={{ border: 'none', margin: 0, padding: 0 }}>📍 Real-time Rider Tracking</h3>
            </div>

            <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2d2d2d', position: 'relative' }}>
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
                    // DispatcherMap.jsx mein Marker ka hissa is tarah update karein:

                    {/* DispatcherMap.jsx mein Marker ka block replace karein */}
                    {riders.map(rider => (
                        <Marker
                            key={rider.id}
                            longitude={rider.location.lng}
                            latitude={rider.location.lat}
                            anchor="bottom"
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                                {/* 🔥 Motorbike Icon setup */}
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/3198/3198336.png"
                                    style={{
                                        width: '45px',
                                        filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.4))',
                                        backgroundColor: '#fff',
                                        padding: '5px',
                                        borderRadius: '50%',
                                        border: '2px solid #ef4444'
                                    }}
                                    alt="Delivery Motorbike"
                                />
                                <div className="rider-marker-label">
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