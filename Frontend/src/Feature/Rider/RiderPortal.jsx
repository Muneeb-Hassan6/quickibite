import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; // 🔥 SOCKET.IO IMPORT ADD KIYA HAI
import { FaMotorcycle, FaCommentDots } from "react-icons/fa";
import Swal from "sweetalert2";
import "./styles/index.css";
import "mapbox-gl/dist/mapbox-gl.css";

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
import CustomAlert from "./Components/CustomAlert";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const toRad = (v) => (v * Math.PI) / 180;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// ==========================================
// 🔥 MAIN RIDER PORTAL APP
// ==========================================
const RiderPortal = () => {
  const navigate = useNavigate();

  const [riderSession, setRiderSession] = useState(() => {
    // 🔥 FIX: localStorage aur sessionStorage DONO mein check karega!
    const saved =
      localStorage.getItem("staff_session") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("staff_session") ||
      sessionStorage.getItem("user");

    return saved ? JSON.parse(saved) : null;
  });

  const [isOnline, setIsOnline] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [stats, setStats] = useState({
    deliveries: 0,
    earnings: 0,
    cashInHand: 0,
    onlineCollected: 0,
  });
  const [history, setHistory] = useState([]);

  const [incomingOrderDetails, setIncomingOrderDetails] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("heading_to_customer");
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);

  const [riderLocation, setRiderLocation] = useState({
    lat: 31.5204,
    lng: 74.3587,
  });
  const [distance, setDistance] = useState(null);
  const [isArrived, setIsArrived] = useState(false);
  const [aiData, setAiData] = useState({ eta: "...", roadDistance: "..." });
  const [routePath, setRoutePath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [rawRouteData, setRawRouteData] = useState({
    distance: 0,
    duration: 0,
  });

  const [viewState, setViewState] = useState({
    longitude: 74.3587,
    latitude: 31.5204,
    zoom: 15,
    pitch: 45,
  });

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  // 🔥 NAYE STATES FOR SOCKET.IO
  const [socketInstance, setSocketInstance] = useState(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // ==========================================
  // 🔥 SOCKET.IO CONNECTION (Robust with auto-reconnect)
  // ==========================================
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const joinRider = () => {
      socket.emit("join_room", "rider");
      console.log("🔌 Rider socket connected & joined room");
    };

    socket.on("connect", joinRider);
    setSocketInstance(socket);

    // Dispatcher naya order assign kare toh check karo
    socket.on("refresh_rider", () => {
      console.log("🔔 New order assigned! Checking for orders...");
      setFetchTrigger((prev) => prev + 1);
    });

    // Also listen on trigger_rider_assignment (server emits this too)
    socket.on("trigger_rider_assignment", () => {
      console.log("📬 Rider assignment trigger received!");
      setFetchTrigger((prev) => prev + 1);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Rider socket disconnected:", reason);
    });

    return () => {
      socket.off("connect", joinRider);
      socket.off("refresh_rider");
      socket.off("trigger_rider_assignment");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem(`history_${riderSession?.id}`);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [riderSession]);

  // 🔥 1. LIVE STATUS UPDATE
  const handleToggleStatus = async () => {
    if (!riderSession) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/update_rider_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: riderSession.id,
          status: newStatus ? "Available" : "Offline",
          lat: riderLocation.lat,
          lng: riderLocation.lng,
        }),
      });

      // 🔥 SOCKET EMIT: Dispatcher ko foran batao ke rider Online/Offline ho gaya hai
      if (socketInstance) {
        socketInstance.emit("rider_status_update");
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  // 🔥 2. AUTO-FETCH ASSIGNED ORDERS (Now Triggered by Socket, Not Interval)
  useEffect(() => {
    const fetchAssignedOrder = async () => {
      if (isOnline && !currentOrder && !incomingOrderDetails && riderSession) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_assigned_order.php?rider_id=${riderSession.id}`,
          );
          const data = await res.json();

          if (data.success && data.order) {
            const o = data.order;
            setIncomingOrderDetails({
              id: o.id,
              customer: o.customer_name || "Customer",
              phone: o.customer_mobile || "N/A",
              address: o.customer_address || "No Address Provided",
              items: o.cart ? `${o.cart.length} Items` : "Items Details in DB",
              total: `Rs ${o.total}`,
              paymentType: o.payment_method || "COD",
              time: "Just Now",
              targetLat: parseFloat(o.latitude) || 31.525,
              targetLng: parseFloat(o.longitude) || 74.36,
            });
            const audio = new Audio(
              "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
            );
            // audio.play().catch((e) => console.log("Audio blocked"));
          }
        } catch (error) {
          console.error("Order polling error:", error);
        }
      }
    };

    fetchAssignedOrder();
  }, [
    fetchTrigger,
    isOnline,
    currentOrder,
    incomingOrderDetails,
    riderSession,
  ]);
  // Pura setInterval nikal diya, ab yeh sirf tab chalega jab socket signal dega!

  // Mapbox Path Finding
  const fetchMapboxAI = async (startLat, startLng, endLat, endLng) => {
    if (!MAPBOX_TOKEN) return;
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`,
      );
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setAiData({
          eta: Math.round(route.duration / 60) + " mins",
          roadDistance: (route.distance / 1000).toFixed(1) + " km",
        });
        setRawRouteData({ distance: route.distance, duration: route.duration });
        setRoutePath(route.geometry.coordinates);
        setCurrentStep(0);
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  // 🔥 LIVE LOCATION TRACKER (With Socket Emit)
  useEffect(() => {
    let watchId;
    if (isOnline && riderSession) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          async (pos) => {
            if (orderStatus === "arrived" || orderStatus === "photo_captured")
              return;
            const { latitude, longitude } = pos.coords;
            setRiderLocation({ lat: latitude, lng: longitude });
            setViewState((prev) => ({ ...prev, latitude, longitude }));

            // 1. Send live location to DB
            try {
              fetch(
                `${import.meta.env.VITE_API_BASE}/update_rider_location.php`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: riderSession.id,
                    lat: latitude,
                    lng: longitude,
                  }),
                },
              );
            } catch (e) {}

            // 🔥 2. SOCKET EMIT: Node Server ko batao taake wo Dispatcher ka map foran update kare
            if (socketInstance) {
              socketInstance.emit("rider_location_update");
            }

            if (currentOrder) {
              const dist = calculateDistance(
                latitude,
                longitude,
                currentOrder.targetLat,
                currentOrder.targetLng,
              );
              setDistance(Math.round(dist));
              if (dist < 50 && !isArrived) triggerArrival();
            }
          },
          (err) => console.error(err),
          { enableHighAccuracy: true },
        );
      }
    } else {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      setDistance(null);
      setIsArrived(false);
      setDeliveryPhoto(null);
      setOrderStatus("heading_to_customer");
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [
    isOnline,
    currentOrder,
    isArrived,
    orderStatus,
    riderSession,
    socketInstance,
  ]);

  const acceptOrder = async () => {
    const customerPhone = incomingOrderDetails?.phone;

    // 1. Update local state immediately (fast UI)
    setCurrentOrder(incomingOrderDetails);
    setIncomingOrderDetails(null);
    setIsArrived(false);
    setDeliveryPhoto(null);
    setOrderStatus("heading_to_customer");
    setAiData({ eta: "...", roadDistance: "..." });
    setRoutePath([]);
    setViewState((prev) => ({
      ...prev,
      latitude: riderLocation.lat,
      longitude: riderLocation.lng,
    }));
    const dist = calculateDistance(
      riderLocation.lat,
      riderLocation.lng,
      incomingOrderDetails.targetLat,
      incomingOrderDetails.targetLng,
    );
    setDistance(Math.round(dist));
    fetchMapboxAI(
      riderLocation.lat,
      riderLocation.lng,
      incomingOrderDetails.targetLat,
      incomingOrderDetails.targetLng,
    );

    // 🔥 WhatsApp Trigger: Open link with details
    if (customerPhone && customerPhone !== "N/A" && customerPhone.trim() !== "") {
      let formattedPhone = customerPhone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "92" + formattedPhone.slice(1);
      } else if (formattedPhone.length === 10 && formattedPhone.startsWith("3")) {
        formattedPhone = "92" + formattedPhone;
      }
      
      const riderName = riderSession?.name || "Rider";
      const riderPhone = riderSession?.phone || "";
      const msg = `Hi! Your QuickBite order is accepted by our rider *${riderName}*. Rider Contact Number: ${riderPhone}. They are on their way to deliver your order!`;
      
      const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
    }

    // 2. 🔥 Mark rider as Busy in DB so dispatcher can't reassign
    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/update_rider_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: riderSession.id,
          status: "Busy",
          lat: riderLocation.lat,
          lng: riderLocation.lng,
        }),
      });

      // 3. 🔥 Notify dispatcher instantly via socket
      if (socketInstance && socketInstance.connected) {
        socketInstance.emit("rider_status_update");
      }
    } catch (err) {
      console.warn("Could not update rider status on accept:", err);
    }
  };

  const showAlert = (message, type = "info") => {
    setAlertConfig({ isOpen: true, message, type });
  };

  const triggerArrival = () => {
    setIsArrived(true);
    setOrderStatus("arrived");
    showAlert(
      "GEOFENCE BREACH: You have arrived! Please take a Proof of Delivery photo.",
      "warning",
    );
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files[0]) {
      setDeliveryPhoto(URL.createObjectURL(e.target.files[0]));
      setOrderStatus("photo_captured");
    }
  };

  // 🔥 3. LIVE DELIVERY COMPLETE
  // 🔥 3. LIVE DELIVERY COMPLETE (UPDATED WITH STRICT CHECKS)
  const completeDelivery = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/complete_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: currentOrder.id,
            rider_id: riderSession.id,
          }),
        },
      );

      const data = await response.json();

      // 🔥 AGAR DB MEIN FAIL HUA TOH ERROR DIKHAYEGA AUR ROKEGA
      if (!data.success) {
        Swal.fire({ icon: "error", title: "Error", text: data.message });
        return;
      }

      // 🔥 SOCKET EMIT: Dispatcher ko foran batao delivery complete hua
      // 'order_delivered' → server broadcasts refresh_kitchen (removes trip) + refresh_rider_list (rider Available)
      if (socketInstance && socketInstance.connected) {
        socketInstance.emit("order_delivered");
      }

      // Baki ka code same rahega
      const isCash = currentOrder.paymentType === "Cash on Delivery";
      const orderAmount = parseInt(currentOrder.total.replace(/\D/g, "")) || 0;

      const newDelivery = {
        id: currentOrder.id,
        customer: currentOrder.customer,
        earnings: 150,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updatedHistory = [newDelivery, ...history];
      setHistory(updatedHistory);
      localStorage.setItem(
        `history_${riderSession.id}`,
        JSON.stringify(updatedHistory),
      );

      setStats((prev) => ({
        deliveries: prev.deliveries + 1,
        earnings: prev.earnings + 150,
        cashInHand: isCash ? prev.cashInHand + orderAmount : prev.cashInHand,
        onlineCollected: !isCash
          ? prev.onlineCollected + orderAmount
          : prev.onlineCollected,
      }));

      setCurrentOrder(null);
      setDistance(null);
      setIsArrived(false);
      setRoutePath([]);
      setCurrentStep(0);
      setDeliveryPhoto(null);
      setOrderStatus("heading_to_customer");
    } catch (error) {
      console.error("Failed to complete order:", error);
      Swal.fire({
        icon: "error",
        title: "System Error",
        text: "Could not connect to server.",
      });
    }
  };

  // 🔥 4. CANCEL ORDER (Return to Dispatcher)
  const cancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel and return this order to the dispatcher?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Cancel it"
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/decline_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          rider_id: riderSession.id,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        Swal.fire({ icon: "error", title: "Error", text: data.message });
        return;
      }

      // 🔥 SOCKET EMIT: Dispatcher ko foran batao k rider available hai aur order wapis aagaya
      if (socketInstance && socketInstance.connected) {
        socketInstance.emit("rider_status_update");
        socketInstance.emit("refresh_kitchen"); // Dispatcher panel refreshes order list
        socketInstance.emit("order_status_changed"); 
      }

      // Reset UI state
      setCurrentOrder(null);
      setIncomingOrderDetails(null);
      setDistance(null);
      setIsArrived(false);
      setRoutePath([]);
      setCurrentStep(0);
      setDeliveryPhoto(null);
      setOrderStatus("heading_to_customer");

      Swal.fire({ icon: "success", title: "Cancelled", text: "Order has been returned to the dispatcher." });
    } catch (error) {
      console.error("Failed to cancel order:", error);
      Swal.fire({ icon: "error", title: "System Error", text: "Could not connect to server." });
    }
  };

  const handleLogout = async () => {
    if (isOnline) {
      await handleToggleStatus();
    }
    // 🔥 FIX: localStorage aur sessionStorage DONO clear kar dein taake koi masla hi na rahay!
    localStorage.removeItem("staff_session");
    localStorage.removeItem("user");
    sessionStorage.removeItem("staff_session");
    sessionStorage.removeItem("user");

    setRiderSession(null);
    navigate("/login");
  };

  if (!riderSession) {
    return null;
  }

  return (
    <div className="rider-mobile-wrapper">
      <div className="rider-app-container">
        <NetworkStatus />
        <RiderHeader riderName={riderSession.name} onLogout={handleLogout} />
        <StatusToggle isOnline={isOnline} onToggle={handleToggleStatus} />

        <div className="rider-workspace">
          {!isOnline && (
            <div className="empty-state">
              <FaMotorcycle
                size={50}
                style={{ opacity: 0.3, marginBottom: "15px" }}
              />
              <h2>Offline</h2>
              <p>Toggle status to online to start your shift.</p>
            </div>
          )}

          {isOnline && !currentOrder && (
            <div className="empty-state">
              <div className="radar-animation">
                <FaMotorcycle size={40} className="text-green" />
              </div>
              <h2>Searching...</h2>
              <p>Listening for incoming orders...</p>
            </div>
          )}

          {isOnline && currentOrder && (
            <div>
              <div className="map-and-chat-wrapper">
                <button
                  className="floating-chat-btn"
                  onClick={() => setIsChatOpen(true)}
                >
                  <FaCommentDots size={20} />
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
              <DeliveryActions
                isArrived={isArrived}
                aiData={aiData}
                distance={distance}
                orderStatus={orderStatus}
                simulateDriving={() => {}}
                handlePhotoUpload={handlePhotoUpload}
                deliveryPhoto={deliveryPhoto}
                completeDelivery={completeDelivery}
              />
              <ActiveOrderCard
                order={currentOrder}
                onComplete={completeDelivery}
                onCancel={() => cancelOrder(currentOrder.id)}
              />
            </div>
          )}

          {!currentOrder && isOnline && (
            <>
              <ShiftSummary stats={stats} />
              <DeliveryHistory history={history} />
            </>
          )}
        </div>

        <BottomStats stats={stats} />

        {incomingOrderDetails && (
          <IncomingOrderModal
            order={incomingOrderDetails}
            onAccept={acceptOrder}
            onDecline={() => cancelOrder(incomingOrderDetails.id)}
          />
        )}

        {currentOrder && isChatOpen && (
          <ChatDrawer
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            customerName={currentOrder.customer}
            showAlert={showAlert}
          />
        )}

        {alertConfig.isOpen && (
          <CustomAlert
            isOpen={alertConfig.isOpen}
            message={alertConfig.message}
            type={alertConfig.type}
            onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
          />
        )}
      </div>
    </div>
  );
};

export default RiderPortal;
