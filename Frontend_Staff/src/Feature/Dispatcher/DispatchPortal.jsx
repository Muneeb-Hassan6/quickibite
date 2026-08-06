import React, { useState, useEffect } from "react";
import "./styles/index.css";
import { io } from "socket.io-client"; // 🔥 SOCKET.IO IMPORT ADD KIYA HAI
import {
  FaRobot,
  FaLayerGroup,
  FaStopCircle,
  FaSlidersH,
  FaClock,
} from "react-icons/fa";

import DispatchHeader from "./Components/DispatchHeader";
import DispatchStats from "./Components/DispatchStats";
import ReadyOrdersList from "./Components/ReadyOrdersList";
import ActiveRidersList from "./Components/ActiveRidersList";
import AssignmentBar from "./Components/AssignmentBar";
import ActiveDeliveries from "./Components/ActiveDeliveries";
import CustomAlert from "../Rider/Components/CustomAlert";
import DispatcherMap from "./Components/DispatcherMap";

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

const DispatchPortal = () => {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  // 🔥 DYNAMIC STATES
  const [readyOrders, setReadyOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [avgDeliveryTime, setAvgDeliveryTime] = useState(24);
  const [mapViewState, setMapViewState] = useState({
    longitude: 74.3587,
    latitude: 31.5204, // Default Lahore
    zoom: 11.5,
    pitch: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showAlert = (message, type = "info") =>
    setAlertConfig({ isOpen: true, message, type });

  const [batchRadius, setBatchRadius] = useState(2000);
  const [isAutoPilotOn, setIsAutoPilotOn] = useState(false);
  const [autoPilotMinutes, setAutoPilotMinutes] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState("");

  // ==========================================
  // 🔥 FETCH DATA FROM BACKEND & SOCKET.IO
  // ==========================================
  useEffect(() => {
    // 1. Initial load
    fetchLiveData();

    // 2. Robust socket with auto-reconnect
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const joinDispatcher = () => {
      socket.emit("join_room", "dispatcher");
      console.log("🔌 Dispatcher socket connected & joined room");
    };

    socket.on("connect", joinDispatcher);

    // Refresh on any order or rider update signal
    socket.on("refresh_kitchen", () => {
      console.log("🔔 New order signal in Dispatcher! Refreshing...");
      fetchLiveData();
    });

    socket.on("refresh_rider", () => {
      console.log("🏄 Rider assignment update! Refreshing...");
      fetchLiveData();
    });

    socket.on("refresh_rider_list", () => {
      console.log("🚴 Rider status changed! Refreshing...");
      fetchLiveData();
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Dispatcher socket disconnected:", reason);
    });

    // 3. Polling fallback every 30 seconds
    const pollInterval = setInterval(() => {
      fetchLiveData();
    }, 30000);

    return () => {
      socket.off("connect", joinDispatcher);
      socket.off("refresh_kitchen");
      socket.off("refresh_rider");
      socket.off("refresh_rider_list");
      socket.disconnect();
      clearInterval(pollInterval);
    };
  }, []);
  const fetchLiveData = async () => {
    try {
      // 1. Fetch ALL orders (active + dispatched) using type=all
      const orderRes = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=all`,
      );
      const orderData = await orderRes.json();

      let ordersArray = Array.isArray(orderData)
        ? orderData
        : orderData.data || [];

      if (ordersArray.length > 0) {
        // A. Ready delivery orders awaiting rider assignment
        const deliveryOrders = ordersArray.filter((o) => {
          const type   = String(o.order_type || "").toLowerCase().trim();
          const status = String(o.status || "").toLowerCase().trim();
          return (
            type.includes("delivery") &&
            (status === "ready" || status === "ready to serve")
          );
        });

        const mappedOrders = deliveryOrders.map((o) => {
          let rawItems = [];
          if (o.items) {
            try {
              rawItems = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
            } catch (e) {}
          }
          return {
            id: o.id,
            customer: o.customer_name || "Unknown Customer",
            address: o.customer_address || "No Address Provided",
            targetLat: parseFloat(o.lat) || 31.5204 + (Math.random() - 0.5) * 0.05,
            targetLng: parseFloat(o.lng) || 74.3587 + (Math.random() - 0.5) * 0.05,
            items: `${rawItems.length} Items`,
            total: `Rs ${o.total}`,
            time: o.created_at
              ? new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just Now",
            payment: "COD",
            isUrgent: false,
          };
        });
        setReadyOrders(mappedOrders);

        // B. 🔥 Sync Active Trips from DB (Dispatched orders)
        //    This ensures delivery completion is reflected instantly when socket fires
        const dispatchedOrders = ordersArray.filter((o) => {
          const status = String(o.status || "").toLowerCase().trim();
          return status === "dispatched";
        });

        const mappedTrips = dispatchedOrders.map((o) => {
          let rawItems = [];
          if (o.items) {
            try { rawItems = typeof o.items === "string" ? JSON.parse(o.items) : o.items; } catch (e) {}
          }
          return {
            id: o.id,
            customer: o.customer_name || "Unknown Customer",
            address: o.customer_address || "No Address",
            items: `${rawItems.length} Items`,
            total: `Rs ${o.total}`,
            time: o.created_at
              ? new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just Now",
            payment: "COD",
            assignedRider: { id: o.rider_id, name: "Rider #" + o.rider_id },
          };
        });
        setActiveTrips(mappedTrips);  // 🔥 DB-synced — updates instantly on socket signal

        // C. Completed deliveries count
        const deliveredOrders = ordersArray.filter((o) => {
          const type   = String(o.order_type || "").toLowerCase().trim();
          const status = String(o.status || "").toLowerCase().trim();
          return type.includes("delivery") && status === "delivered";
        });
        setCompletedCount(deliveredOrders.length);

      } else {
        setReadyOrders([]);
        setActiveTrips([]);
        setCompletedCount(0);
      }

      // 2. Fetch Staff / Riders
      const staffRes  = await fetch(`${import.meta.env.VITE_API_BASE}/get_staff.php`);
      const staffJson = await staffRes.json();

      if (staffJson.success && Array.isArray(staffJson.data)) {
        const riderStaff = staffJson.data.filter((s) => {
          const role        = s.role        ? s.role.toLowerCase()        : "";
          const designation = s.designation ? s.designation.toLowerCase() : "";
          return role === "rider" || designation === "rider";
        });

        const mappedRiders = riderStaff.map((r) => ({
          id: r.id,
          name: r.name || "Unknown Rider",
          status: r.shift_status || r.status || "Offline",
          location: {
            lat: parseFloat(r.lat) || 31.5204 + (Math.random() - 0.5) * 0.03,
            lng: parseFloat(r.lng) || 74.3587 + (Math.random() - 0.5) * 0.03,
          },
          trips:    parseInt(r.trips_completed) || 0,
          rating:   4.8,
          vehicle:  r.vehicle || "Bike",
          phone:    r.phone   || "N/A",
          accuracy: "98%",
        }));
        setRiders(mappedRiders);
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  // 🔥 SEND ASSIGNMENT TO DATABASE & NOTIFY RIDER VIA SOCKET
  const updateOrderInDatabase = async (orderId, riderId) => {
    try {
      // 1. Order ko Dispatched mark karo aur rider assign karo
      await fetch(`${import.meta.env.VITE_API_BASE}/assign_rider.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          rider_id: riderId,
          status: "Dispatched",
        }),
      });

      // 2. Rider ko Busy set karo taake dobara assign na ho
      await fetch(`${import.meta.env.VITE_API_BASE}/update_rider_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: riderId, status: "Busy" }),
      });

      // 3. 🔥 Socket: Rider app ko foran signal bhejo (connect event ke baad emit)
      const tempSocket = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: false,
      });
      tempSocket.on("connect", () => {
        tempSocket.emit("trigger_rider_assignment");
        // Also tell dispatcher to refresh its own rider list
        tempSocket.emit("rider_status_update");
        // 🔥 Tell Kitchen to refresh so the assigned order disappears instantly
        tempSocket.emit("refresh_kitchen");
        setTimeout(() => tempSocket.disconnect(), 1000);
      });
    } catch (error) {
      console.error("Failed to assign order in DB", error);
    }
  };

  // ==========================================
  // TRUE AUTOMATION (RADIUS & BATCHING TICK)
  // ==========================================
  useEffect(() => {
    let automationInterval;
    if (isAutoPilotOn) {
      automationInterval = setInterval(() => {
        runAutomationTick();
      }, 3000);
    }
    return () => clearInterval(automationInterval);
  }, [isAutoPilotOn, readyOrders, riders, batchRadius]);

  const runAutomationTick = () => {
    if (readyOrders.length === 0) {
      setIsAutoPilotOn(false);
      showAlert("Queue cleared! All orders have been dispatched.", "info");
      return;
    }

    const freeRiders = riders.filter((r) => r.status === "Available");

    if (freeRiders.length === 0) {
      setIsAutoPilotOn(false);
      showAlert("All riders are busy! Auto-Pilot paused.", "warning");
      return;
    }

    const targetOrder = readyOrders[0];
    const matchingOrders = readyOrders.filter(
      (o) =>
        o.id !== targetOrder.id &&
        calculateDistance(
          targetOrder.targetLat,
          targetOrder.targetLng,
          o.targetLat,
          o.targetLng,
        ) <= batchRadius,
    );

    let finalOrderToAssign = targetOrder;
    let newReadyOrders = readyOrders.slice(1);

    if (matchingOrders.length > 0) {
      const batchOrdersList = [targetOrder, ...matchingOrders];
      finalOrderToAssign = {
        id: `BATCH-${targetOrder.id}`,
        customer: `📦 Batch of ${batchOrdersList.length} Orders`,
        address: `Area: ${targetOrder.address}`,
        items: "Multiple Items (Check App)",
        total: "Mixed",
        time: "Auto Batched",
        payment: "Mixed",
        isUrgent: true,
        targetLat: targetOrder.targetLat,
        targetLng: targetOrder.targetLng,
        batchDetails: batchOrdersList,
      };
      const matchingIds = matchingOrders.map((m) => m.id);
      newReadyOrders = newReadyOrders.filter(
        (o) => !matchingIds.includes(o.id),
      );
    }

    const sortedRiders = [...freeRiders].sort((a, b) => a.trips - b.trips);
    const bestRider = sortedRiders[0];
    const newTrip = { ...finalOrderToAssign, assignedRider: bestRider };

    // 🔥 DB Update Call
    if (finalOrderToAssign.batchDetails) {
      finalOrderToAssign.batchDetails.forEach((o) =>
        updateOrderInDatabase(o.id, bestRider.id),
      );
    } else {
      updateOrderInDatabase(finalOrderToAssign.id, bestRider.id);
    }

    setActiveTrips([...activeTrips, newTrip]);
    setReadyOrders(newReadyOrders);
    setRiders(
      riders.map((r) =>
        r.id === bestRider.id
          ? {
              ...r,
              status: "On Delivery",
              currentOrderId: finalOrderToAssign.id,
            }
          : r,
      ),
    );
  };

  // ==========================================
  // TIMED AUTO-PILOT COUNTDOWN
  // ==========================================
  useEffect(() => {
    if (!isAutoPilotOn || autoPilotMinutes === 0) {
      setTimerDisplay("");
      return;
    }
    let timeLeft = autoPilotMinutes * 60;
    const updateDisplay = (time) => {
      const m = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
      const s = (time % 60).toString().padStart(2, "0");
      setTimerDisplay(`${m}:${s}`);
    };
    updateDisplay(timeLeft);

    const countdownInterval = setInterval(() => {
      timeLeft -= 1;
      updateDisplay(timeLeft);
      if (timeLeft <= 0) {
        setIsAutoPilotOn(false);
        showAlert(
          "⏳ Auto-Pilot time limit has expired. Switched to manual mode.",
          "warning",
        );
        clearInterval(countdownInterval);
      }
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [isAutoPilotOn, autoPilotMinutes]);

  // ==========================================
  // MANUAL RADIUS BATCHING
  // ==========================================
  const handleSmartBatching = () => {
    if (readyOrders.length < 2) {
      showAlert("Need at least 2 orders to create a batch!", "warning");
      return;
    }
    const batchedList = [];
    const usedIds = new Set();

    readyOrders.forEach((order, index) => {
      if (usedIds.has(order.id)) return;
      const matches = readyOrders.filter(
        (o, i) =>
          i > index &&
          !usedIds.has(o.id) &&
          calculateDistance(
            order.targetLat,
            order.targetLng,
            o.targetLat,
            o.targetLng,
          ) <= batchRadius,
      );

      if (matches.length > 0) {
        const batchOrders = [order, ...matches];
        batchOrders.forEach((o) => usedIds.add(o.id));
        batchedList.push({
          id: `BATCH-${order.id}`,
          customer: `📦 Batch of ${batchOrders.length} Orders`,
          address: `Area: ${order.address}`,
          items: "Multiple Items (Check Rider App)",
          total: "Mixed",
          time: "Just Batched",
          payment: "Mixed",
          isUrgent: true,
          targetLat: order.targetLat,
          targetLng: order.targetLng,
          batchDetails: batchOrders,
        });
      } else {
        batchedList.push(order);
        usedIds.add(order.id);
      }
    });
    setReadyOrders(batchedList);
    showAlert(
      `Manual Batching Complete! Radius Set: ${(batchRadius / 1000).toFixed(1)} KM`,
      "info",
    );
  };

  const handleAssign = () => {
    if (!selectedOrder || !selectedRider) return;
    const newTrip = { ...selectedOrder, assignedRider: selectedRider };

    // 🔥 DB Update Call
    if (selectedOrder.batchDetails) {
      selectedOrder.batchDetails.forEach((o) =>
        updateOrderInDatabase(o.id, selectedRider.id),
      );
    } else {
      updateOrderInDatabase(selectedOrder.id, selectedRider.id);
    }

    setActiveTrips([newTrip, ...activeTrips]);
    setReadyOrders(readyOrders.filter((o) => o.id !== selectedOrder.id));
    setRiders(
      riders.map((r) =>
        r.id === selectedRider.id
          ? { ...r, status: "On Delivery", currentOrderId: selectedOrder.id }
          : r,
      ),
    );
    setSelectedOrder(null);
    setSelectedRider(null);

    // Naya data refresh karein taake portal update ho jaye
    fetchLiveData();
  };

  const handleCompleteTrip = (tripId, riderId) => {
    setActiveTrips(activeTrips.filter((t) => t.id !== tripId));
    setRiders(
      riders.map((r) =>
        r.id === riderId
          ? {
              ...r,
              status: "Available",
              currentOrderId: null,
              trips: r.trips + 1,
            }
          : r,
      ),
    );
  };

  return (
    <div className="dispatch-container">
      <DispatchHeader />
      <DispatchStats
        readyCount={readyOrders.length}
        freeRiders={
          riders.filter((r) => String(r.status).toLowerCase() === "available")
            .length
        }
        avgDeliveryTime={avgDeliveryTime}
        completedToday={completedCount} // 🔥 Ab yeh database se length utha raha hai!
      />
      <div className="dispatch-map-top-row">
        <DispatcherMap
          riders={riders}
          MAPBOX_TOKEN={MAPBOX_TOKEN}
          viewState={mapViewState}
          setViewState={setMapViewState}
        />
      </div>

      <div className="ai-controls-wrapper">
        <div className="radius-control-box">
          <FaSlidersH className="text-muted" />
          <div className="radius-text">
            Radius: {(batchRadius / 1000).toFixed(1)} KM
          </div>
          <input
            type="range"
            min="1000"
            max="5000"
            step="500"
            value={batchRadius}
            onChange={(e) => setBatchRadius(e.target.value)}
            disabled={isAutoPilotOn}
            className="custom-range"
          />
        </div>

        <button
          onClick={handleSmartBatching}
          className="btn-ai-batch"
          disabled={isAutoPilotOn}
        >
          <FaLayerGroup /> Manual Batch
        </button>

        <div className="timer-select-box">
          <FaClock className="text-orange" />
          <select
            value={autoPilotMinutes}
            onChange={(e) => setAutoPilotMinutes(Number(e.target.value))}
            disabled={isAutoPilotOn}
            className="custom-timer-select"
          >
            <option value={0}>Endless (No Limit)</option>
            <option value={15}>15 Minutes</option>
            <option value={30}>30 Minutes</option>
            <option value={60}>1 Hour</option>
          </select>
        </div>

        <button
          onClick={() => setIsAutoPilotOn(!isAutoPilotOn)}
          className={`btn-ai-auto ${isAutoPilotOn ? "active-pulse auto-stop" : "auto-start"}`}
        >
          {isAutoPilotOn ? (
            <>
              <FaStopCircle /> STOP AUTO-PILOT{" "}
              {timerDisplay && (
                <span className="timer-display ml-5">({timerDisplay})</span>
              )}
            </>
          ) : (
            <>
              <FaRobot /> ACTIVATE AUTO-PILOT
            </>
          )}
        </button>
      </div>

      <div className="dispatch-workspace-grid animate-slide-up">
        <ReadyOrdersList
          orders={readyOrders}
          selectedId={selectedOrder?.id}
          onSelect={setSelectedOrder}
        />
        <ActiveRidersList
          riders={riders}
          selectedId={selectedRider?.id}
          onSelect={setSelectedRider}
        />
        <ActiveDeliveries
          activeTrips={activeTrips}
          onComplete={handleCompleteTrip}
        />
      </div>

      <AssignmentBar
        order={selectedOrder}
        rider={selectedRider}
        onConfirm={handleAssign}
      />
      <CustomAlert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />
    </div>
  );
};

export default DispatchPortal;
