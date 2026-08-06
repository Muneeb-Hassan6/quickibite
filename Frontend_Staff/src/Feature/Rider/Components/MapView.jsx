import React from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapView = ({ viewState, setViewState, routePath, riderLocation, currentOrder, MAPBOX_TOKEN }) => {
    return (
        <div className="map-wrapper">
            <Map {...viewState} onMove={evt => setViewState(evt.viewState)} mapStyle="mapbox://styles/mapbox/navigation-night-v1" mapboxAccessToken={MAPBOX_TOKEN} style={{ width: '100%', height: '100%' }}>
                {routePath.length > 0 && (
                    <Source id="route-source" type="geojson" data={{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routePath } }}>
                        <Layer id="route-layer" type="line" paint={{ "line-color": "#3b82f6", "line-width": 6, "line-opacity": 0.8 }} />
                    </Source>
                )}
                <Marker longitude={riderLocation.lng} latitude={riderLocation.lat} anchor="bottom">
                    <img src="https://cdn-icons-png.flaticon.com/512/3198/3198336.png" className="map-marker-img" alt="rider" />
                </Marker>
                {currentOrder && (
                    <Marker longitude={currentOrder.targetLng} latitude={currentOrder.targetLat} anchor="bottom">
                        <img src="https://cdn-icons-png.flaticon.com/512/2776/2776067.png" className="map-marker-img" alt="home" />
                    </Marker>
                )}
            </Map>
        </div>
    );
};
export default MapView;