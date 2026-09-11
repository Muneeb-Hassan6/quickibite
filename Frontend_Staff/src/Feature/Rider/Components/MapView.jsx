import React, { useRef } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapView({
  viewState,
  setViewState,
  routePath = [],
  riderLocation,
  currentOrder,
  MAPBOX_TOKEN,
}) {
  const mapRef = useRef(null);

  const handleMapLoad = (e) => {
    if (e && e.target) {
      e.target.resize();
    }
  };

  return (
    <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden mb-4 border border-stone-200 dark:border-neutral-800 shadow-xs relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        onLoad={handleMapLoad}
        attributionControl={false}
      >
        {/* Turn-by-Turn Route Polyline */}
        {routePath.length > 0 && (
          <Source
            id="route-source"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: routePath },
            }}
          >
            <Layer
              id="route-layer"
              type="line"
              paint={{
                "line-color": "#3b82f6",
                "line-width": 5,
                "line-opacity": 0.85,
              }}
            />
          </Source>
        )}

        {/* Rider GPS Pin */}
        {riderLocation &&
          typeof riderLocation.lng === "number" &&
          typeof riderLocation.lat === "number" && (
            <Marker
              longitude={riderLocation.lng}
              latitude={riderLocation.lat}
              anchor="bottom"
            >
              <div className="w-9 h-9 rounded-full bg-white border-2 border-amber-500 shadow-md flex items-center justify-center p-1.5 transition-transform hover:scale-110">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3198/3198336.png"
                  className="w-full h-full object-contain"
                  alt="Rider Marker"
                />
              </div>
            </Marker>
          )}

        {/* Customer Target Pin */}
        {currentOrder && (() => {
          const dropLng =
            typeof currentOrder.targetLng === "number"
              ? currentOrder.targetLng
              : typeof currentOrder.customer_lng === "number"
              ? currentOrder.customer_lng
              : parseFloat(currentOrder.targetLng || currentOrder.customer_lng || currentOrder.longitude) || 74.3440;
          const dropLat =
            typeof currentOrder.targetLat === "number"
              ? currentOrder.targetLat
              : typeof currentOrder.customer_lat === "number"
              ? currentOrder.customer_lat
              : parseFloat(currentOrder.targetLat || currentOrder.customer_lat || currentOrder.latitude) || 31.5102;

          return (
            <Marker longitude={dropLng} latitude={dropLat} anchor="bottom">
              <div className="w-9 h-9 rounded-full bg-white border-2 border-red-500 shadow-md flex items-center justify-center p-1.5 transition-transform hover:scale-110">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2776/2776067.png"
                  className="w-full h-full object-contain"
                  alt="Customer Marker"
                />
              </div>
            </Marker>
          );
        })()}
      </Map>
    </div>
  );
}