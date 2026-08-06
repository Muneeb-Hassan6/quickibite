import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import "./styles/index.css";
import KitchenHeader from "./Components/KitchenHeader.jsx";
import KitchenCard from "./Components/KitchenCard.jsx";
import PrintModal from "./Components/PrintModal.jsx";

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [printOrder, setPrintOrder] = useState(null);
  const socketRef = useRef(null); // 🔥 Persistent socket reference

  // 🔥 1. FETCH LIVE ORDERS (Updated for Two-Table Structure)
  const fetchLiveOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php`,
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        // Data Formatting: PHP se aane wale data ko frontend ke mutabiq dhalna
        const formattedOrders = data.map((dbOrder) => {
          // Items Handling: Agar items string mein hain toh parse karo, warna direct array use karo
          let rawItems = [];
          if (dbOrder.items) {
            if (typeof dbOrder.items === "string") {
              try {
                rawItems = JSON.parse(dbOrder.items);
              } catch (e) {
                console.error("Failed to parse items JSON", e);
              }
            } else if (Array.isArray(dbOrder.items)) {
              rawItems = dbOrder.items;
            }
          }
          if (!Array.isArray(rawItems)) {
            rawItems = [];
          }

          const statusLower = (dbOrder.status || "").toLowerCase();

          return {
            id: dbOrder.id,
            // Table number na ho toh customer name dikhao, warna N/A
            table: dbOrder.table_number || dbOrder.customer_name || "Walk-in",
            time: (() => {
              if (!dbOrder.created_at) return "N/A";
              const dateStr = dbOrder.created_at.replace(" ", "T");
              const d = new Date(dateStr);
              if (isNaN(d.getTime())) {
                const parts = dbOrder.created_at.split(" ");
                if (parts.length > 1) {
                  return parts[1].substring(0, 5);
                }
                return "N/A";
              }
              return d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
            })(),

            // Status Mapping
            status:
              statusLower === "pending"
                ? "pending"
                : statusLower === "cooking"
                  ? "preparing"
                  : "ready",

            type: dbOrder.order_type
              ? dbOrder.order_type.toUpperCase().replace("_", " ")
              : "TAKEAWAY",

            // Items Mapping (Jo KitchenCard.jsx display karega)
            items: rawItems.map((i) => ({
              name: i ? (i.name || i.title || "") : "",
              qty: i ? (i.qty || 1) : 1,
              size: i ? (i.size || "") : "",
              note: i ? (i.note || "") : "",
              description: i ? (i.description || "") : "",
            })),

            originalStatus: dbOrder.status || "Pending",
          };
        });

        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Failed to fetch kitchen orders", error);
    }
  };

  // 🔥 REAL-TIME SOCKET.IO + POLLING FALLBACK
  useEffect(() => {
    // 1. Initial load
    fetchLiveOrders();

    // 2. Connect with auto-reconnect enabled
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Store in ref so updateStatus can emit events
    socketRef.current = socket;

    const joinKitchen = () => {
      socket.emit("join_room", "kitchen");
      console.log("🔌 Kitchen socket connected & joined room");
    };

    socket.on("connect", joinKitchen);

    socket.on("refresh_kitchen", () => {
      console.log("🔔 New order signal received! Refreshing kitchen...");
      fetchLiveOrders();
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Kitchen socket disconnected:", reason);
    });

    // Polling fallback every 30 seconds
    const pollInterval = setInterval(() => {
      fetchLiveOrders();
    }, 30000);

    return () => {
      socket.off("connect", joinKitchen);
      socket.off("refresh_kitchen");
      socket.disconnect();
      socketRef.current = null;
      clearInterval(pollInterval);
    };
  }, []);


  // 🔥 UPDATE ORDER STATUS — emits socket so dispatcher refreshes instantly
  const updateStatus = async (id, newFrontendStatus) => {
    let backendStatus = "";
    if (newFrontendStatus === "preparing") backendStatus = "Cooking";
    else if (newFrontendStatus === "ready")   backendStatus = "Ready";
    else if (newFrontendStatus === "completed") backendStatus = "Delivered";

    // Optimistic UI update
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === id ? { ...o, status: newFrontendStatus } : o,
      ),
    );

    if (newFrontendStatus === "completed") {
      setTimeout(() => {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }, 800);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_order_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id, status: backendStatus }),
        },
      );

      if (response.ok) {
        toast.success(`Order #${id} is now ${backendStatus}!`, {
          duration: 2000,
          style: { background: "#333", color: "#fff" },
        });

        // 🔥 SOCKET EMIT: Dispatcher + Admin ko foran batao order status change hua
        // Especially critical when status becomes "Ready" — dispatcher needs to assign a rider
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("order_status_changed");
        }
      } else {
        toast.error("Database update failed!");
        fetchLiveOrders();
      }
    } catch (error) {
      console.error("Server error:", error);
      fetchLiveOrders();
    }
  };

  // 🔥 3. SMART FILTERS
  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((o) => {
          const orderType = o.type.replace(/[-_ ]/g, "").toLowerCase();
          const filterType = activeFilter.replace(/[-_ ]/g, "").toLowerCase();
          return orderType.includes(filterType);
        });

  // Columns Separation
  const newOrders = filteredOrders.filter((o) => o.status === "pending");
  const prepOrders = filteredOrders.filter((o) => o.status === "preparing");
  const readyOrders = filteredOrders.filter((o) => o.status === "ready");

  return (
    <div className="k-container animate-slide-up">
      <KitchenHeader
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <div className="k-board">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="k-column">
          <div className="k-col-header yellow">
            <span>New Orders</span>
            <span className="k-count">{newOrders.length}</span>
          </div>
          <div className="k-col-body">
            {newOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                btnText="Start Prep"
                btnClass="yellow"
                onNext={() => updateStatus(order.id, "preparing")}
                onPrint={() => setPrintOrder(order)}
              />
            ))}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="k-column">
          <div className="k-col-header red">
            <span>Preparing</span>
            <span className="k-count">{prepOrders.length}</span>
          </div>
          <div className="k-col-body">
            {prepOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                btnText="Mark Ready"
                btnClass="red"
                onNext={() => updateStatus(order.id, "ready")}
                onPrint={() => setPrintOrder(order)}
              />
            ))}
          </div>
        </div>

        {/* COLUMN 3: READY TO SERVE */}
        <div className="k-column">
          <div className="k-col-header green">
            <span>Ready to Serve</span>
            <span className="k-count">{readyOrders.length}</span>
          </div>
          <div className="k-col-body">
            {readyOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                isReady={true}
                btnText="Complete"
                btnClass="green"
                onNext={() => updateStatus(order.id, "completed")}
                onPrint={() => setPrintOrder(order)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Print Modal for KOT */}
      <PrintModal printOrder={printOrder} onClose={() => setPrintOrder(null)} />
    </div>
  );
};

export default KitchenDashboard;
