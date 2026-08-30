import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMotorcycle, FaCommentDots } from "react-icons/fa";
import { useRiderData } from "./hooks/useRiderData";

import NetworkStatus from "./Components/NetworkStatus";
import RiderHeader from "./Components/RiderHeader";
import StatusToggle from "./Components/StatusToggle";
import IncomingOrderModal from "./Components/IncomingOrderModal";
import ChatDrawer from "./Components/ChatDrawer";
import MapView from "./Components/MapView";
import DeliveryActions from "./Components/DeliveryActions";
import ActiveOrderCard from "./Components/ActiveOrderCard";
import ShiftSummary from "./Components/ShiftSummary";
import DeliveryHistory from "./Components/DeliveryHistory";
import BottomStats from "./Components/BottomStats";
import RiderGpsSimulator from "./Components/RiderGpsSimulator";

export default function RiderPortal() {
  const navigate = useNavigate();
  const {
    riderSession,
    isOnline,
    handleToggleStatus,
    isTogglingStatus,
    currentOrder,
    incomingOrderDetails,
    acceptOrder,
    declineOrder,
    completeDelivery,
    isCompletingDelivery,
    stats,
    history,
    isChatOpen,
    setIsChatOpen,
    orderStatus,
    deliveryPhoto,
    handlePhotoUpload,
    riderLocation,
    setManualRiderLocation,
    distance,
    isArrived,
    aiData,
    routePath,
    viewState,
    setViewState,
    MAPBOX_TOKEN,
  } = useRiderData();

  const handleLogout = async () => {
    if (isOnline) {
      handleToggleStatus();
    }
    localStorage.removeItem("staff_session");
    localStorage.removeItem("user");
    sessionStorage.removeItem("staff_session");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  if (!riderSession) return null;

  return (
    <div className="flex justify-center bg-stone-100 dark:bg-neutral-950 min-h-screen text-stone-900 dark:text-neutral-100 font-sans transition-colors">
      {/* Mobile Frame Container (Max 480px) */}
      <div className="w-full max-w-[480px] bg-white dark:bg-neutral-900 border-x border-stone-200 dark:border-neutral-800 flex flex-col relative overflow-hidden h-screen shadow-xl">
        {/* 1. Network Status Banner */}
        <NetworkStatus />

        {/* 2. Top Navigation Bar */}
        <RiderHeader
          riderName={riderSession.name}
          onLogout={handleLogout}
        />

        {/* 3. On-Duty Status Switcher */}
        <StatusToggle
          isOnline={isOnline}
          onToggle={handleToggleStatus}
          isToggling={isTogglingStatus}
        />

        {/* 4. Main Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 overscroll-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-0">
          {/* OFFLINE EMPTY STATE */}
          {!isOnline && (
            <div className="h-[55vh] flex flex-col items-center justify-center text-center text-stone-400 dark:text-neutral-500">
              <FaMotorcycle className="text-5xl opacity-30 mb-3 text-stone-400" />
              <h2 className="text-xl font-bold font-['Oswald',sans-serif] uppercase tracking-wide text-stone-700 dark:text-neutral-300 m-0 mb-1">
                You are Offline
              </h2>
              <p className="text-xs max-w-xs m-0">
                Toggle your duty status to Online to start receiving delivery orders.
              </p>
            </div>
          )}

          {/* ONLINE & SEARCHING STATE */}
          {isOnline && !currentOrder && (
            <div className="space-y-4">
              <div className="py-8 flex flex-col items-center justify-center text-center bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xs">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-2xl mb-3 animate-pulse border border-emerald-500/30">
                  <FaMotorcycle />
                </div>
                <h2 className="text-lg font-bold font-['Oswald',sans-serif] uppercase tracking-wide text-stone-900 dark:text-white m-0 mb-1">
                  Searching for Orders...
                </h2>
                <p className="text-xs text-stone-500 dark:text-neutral-400 m-0">
                  Listening for dispatch assignments in your area
                </p>
              </div>

              {/* Shift Summary & Delivery Logs */}
              <ShiftSummary stats={stats} />
              <DeliveryHistory history={history} />
            </div>
          )}

          {/* ACTIVE DELIVERY VIEW */}
          {isOnline && currentOrder && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Map View & Chat Overlay Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="absolute top-3 right-3 z-30 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform border-none cursor-pointer text-sm"
                  title="Chat with customer"
                >
                  <FaCommentDots />
                </button>
                <MapView
                  viewState={viewState}
                  setViewState={setViewState}
                  routePath={routePath}
                  riderLocation={riderLocation}
                  currentOrder={currentOrder}
                  MAPBOX_TOKEN={MAPBOX_TOKEN}
                />
              </div>

              {/* Delivery Actions (AI ETA & Proof of Delivery) */}
              <DeliveryActions
                isArrived={isArrived}
                aiData={aiData}
                distance={distance}
                orderStatus={orderStatus}
                handlePhotoUpload={handlePhotoUpload}
                deliveryPhoto={deliveryPhoto}
                completeDelivery={completeDelivery}
              />

              {/* Active Order Card */}
              <ActiveOrderCard
                order={currentOrder}
                onComplete={completeDelivery}
                onCancel={() => declineOrder(currentOrder.id)}
                isCompleting={isCompletingDelivery}
              />
            </div>
          )}
        </main>

        {/* 5. Sticky Bottom Stats Bar */}
        <BottomStats stats={stats} />

        {/* 6. Modals & Drawers */}
        {incomingOrderDetails && (
          <IncomingOrderModal
            order={incomingOrderDetails}
            onAccept={acceptOrder}
            onDecline={() => declineOrder(incomingOrderDetails.id)}
          />
        )}

        {currentOrder && isChatOpen && (
          <ChatDrawer
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            customerName={currentOrder.customer}
          />
        )}
      </div>

      {/* 7. Developer GPS Simulator Widget (Easily Removable) */}
      <RiderGpsSimulator
        currentLocation={riderLocation}
        destination={
          currentOrder
            ? {
                lat:
                  currentOrder.targetLat ||
                  currentOrder.customer_lat ||
                  31.4826,
                lng:
                  currentOrder.targetLng ||
                  currentOrder.customer_lng ||
                  74.3256,
              }
            : { lat: 31.4826, lng: 74.3256 }
        }
        onLocationUpdate={setManualRiderLocation}
      />
    </div>
  );
}
