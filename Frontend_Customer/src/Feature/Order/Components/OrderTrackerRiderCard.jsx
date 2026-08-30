import React, { useState, useEffect } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";
import { resolveCoordinatesToAddress } from "../../../Utils/geoHydrator";

export default function OrderTrackerRiderCard({ order, restaurantPhone }) {
  const [hydratedAddress, setHydratedAddress] = useState(null);

  const lat = order?.customer_lat || order?.latitude || order?.target_lat;
  const lng = order?.customer_lng || order?.longitude || order?.target_lng;

  useEffect(() => {
    if (lat && lng) {
      resolveCoordinatesToAddress(lat, lng, import.meta.env.VITE_MAPBOX_TOKEN).then(
        (res) => {
          if (res) setHydratedAddress(res);
        }
      );
    }
  }, [lat, lng]);

  const house = order?.house_info || order?.house_no || "";
  const displayAddress =
    hydratedAddress && house
      ? `${house}, ${hydratedAddress.street}, ${hydratedAddress.area}`
      : order?.customer_address || (hydratedAddress ? `${hydratedAddress.street}, ${hydratedAddress.area}` : "Delivery Location");

  return (
    <div className="md:col-span-5 space-y-4">
      <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-neutral-800">
          <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0">
            Delivery Coordinates
          </h3>
          {lat && lng && (
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <FaMapMarkerAlt className="text-[9px]" /> GPS PINNED
            </span>
          )}
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <span className="text-neutral-400 uppercase font-semibold">Recipient:</span>
            <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm m-0 mt-0.5">
              {order.customer_name || "Guest Customer"}
            </p>
          </div>

          <div>
            <span className="text-neutral-400 uppercase font-semibold">Contact:</span>
            <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm m-0 mt-0.5">
              {order.customer_mobile || "N/A"}
            </p>
          </div>

          <div>
            <span className="text-neutral-400 uppercase font-semibold">Fulfillment Type:</span>
            <p className="font-bold text-amber-500 dark:text-amber-400 uppercase text-xs sm:text-sm m-0 mt-0.5">
              {order.order_type || "Delivery"}
            </p>
          </div>

          <div>
            <span className="text-neutral-400 uppercase font-semibold">Delivery Destination:</span>
            <p className="font-medium text-neutral-700 dark:text-neutral-300 m-0 mt-0.5 leading-relaxed">
              {displayAddress}
            </p>
            {lat && lng && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 mt-1 font-mono no-underline"
              >
                <span>{parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}</span>
                <FaExternalLinkAlt className="text-[9px]" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Need Help Helpline Card */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
        <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
          Need Help With Your Order?
        </span>
        <a
          href={`tel:${restaurantPhone}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all no-underline shadow-xs active:scale-95"
        >
          <FaPhoneAlt className="text-[10px]" />
          <span>Call Support ({restaurantPhone})</span>
        </a>
      </div>
    </div>
  );
}
