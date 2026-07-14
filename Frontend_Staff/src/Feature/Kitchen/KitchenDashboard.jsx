import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import KitchenHeader from "./Components/KitchenHeader.jsx";
import KitchenCard from "./Components/KitchenCard.jsx";

const KitchenDashboard = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("All");
  const socketRef = useRef(null); // 🔥 Persistent socket reference

  // 🔥 1. FETCH LIVE ORDERS via React Query
  const { data: orders = [] } = useQuery({
    queryKey: ['kitchen_orders'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_orders.php`);
      const data = await response.json();
      
      if (!Array.isArray(data)) return [];
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

      return formattedOrders;
    },
    refetchInterval: 15000, // Background polling fallback
    staleTime: 5000
  });

  // 🔥 REAL-TIME SOCKET.IO
  useEffect(() => {
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
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Kitchen socket disconnected:", reason);
    });

    return () => {
      socket.off("connect", joinKitchen);
      socket.off("refresh_kitchen");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // 🔥 UPDATE ORDER STATUS
  const updateStatus = async (id, newFrontendStatus) => {
    let backendStatus = "";
    if (newFrontendStatus === "preparing") backendStatus = "Cooking";
    else if (newFrontendStatus === "ready")   backendStatus = "Ready";
    else if (newFrontendStatus === "completed") backendStatus = "Delivered";

    // Optimistic UI update
    queryClient.setQueryData(['kitchen_orders'], (oldOrders = []) => {
      let updated = oldOrders.map((o) =>
        o.id === id ? { ...o, status: newFrontendStatus } : o
      );
      if (newFrontendStatus === "completed") {
        setTimeout(() => {
          queryClient.setQueryData(['kitchen_orders'], (prev) => prev.filter((o) => o.id !== id));
        }, 800);
      }
      return updated;
    });

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
        queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
      }
    } catch (error) {
      console.error("Server error:", error);
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
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
    <div className="h-screen overflow-hidden bg-[var(--k-bg)] text-[var(--k-text)] flex flex-col font-sans max-[900px]:overflow-y-auto max-[900px]:h-auto animate-slide-up">
      <KitchenHeader
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <div className="flex-1 grid grid-cols-3 gap-[20px] px-[20px] pb-[20px] overflow-hidden max-[900px]:grid-cols-1 max-[900px]:px-[15px] max-[900px]:overflow-visible">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="bg-[var(--k-panel)] rounded-[12px] flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden max-[900px]:h-[500px] max-[900px]:mb-[20px]">
          <div className="p-[15px_20px] flex justify-between items-center font-oswald font-extrabold text-[18px] uppercase text-[var(--k-text)] border-t-[4px] border-t-[var(--status-yellow)] bg-[rgba(245,158,11,0.05)]">
            <span>New Orders</span>
            <span className="bg-[var(--k-bg)] text-[var(--k-text)] py-[4px] px-[12px] rounded-[20px] text-[14px] font-black">{newOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-[15px] flex flex-col gap-[15px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-[5px] [&::-webkit-scrollbar-thumb]:bg-[#444] [&::-webkit-scrollbar-thumb]:rounded-[10px] hover:[&::-webkit-scrollbar-thumb]:bg-[#666]">
            {newOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                btnText="Start Prep"
                btnClass="yellow"
                onNext={() => updateStatus(order.id, "preparing")}
              />
            ))}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="bg-[var(--k-panel)] rounded-[12px] flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden max-[900px]:h-[500px] max-[900px]:mb-[20px]">
          <div className="p-[15px_20px] flex justify-between items-center font-oswald font-extrabold text-[18px] uppercase text-[var(--k-text)] border-t-[4px] border-t-[var(--brand-red)] bg-[rgba(239,68,68,0.05)]">
            <span>Preparing</span>
            <span className="bg-[var(--k-bg)] text-[var(--k-text)] py-[4px] px-[12px] rounded-[20px] text-[14px] font-black">{prepOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-[15px] flex flex-col gap-[15px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-[5px] [&::-webkit-scrollbar-thumb]:bg-[#444] [&::-webkit-scrollbar-thumb]:rounded-[10px] hover:[&::-webkit-scrollbar-thumb]:bg-[#666]">
            {prepOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                btnText="Mark Ready"
                btnClass="red"
                onNext={() => updateStatus(order.id, "ready")}
              />
            ))}
          </div>
        </div>

        {/* COLUMN 3: READY TO SERVE */}
        <div className="bg-[var(--k-panel)] rounded-[12px] flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden max-[900px]:h-[500px] max-[900px]:mb-[20px]">
          <div className="p-[15px_20px] flex justify-between items-center font-oswald font-extrabold text-[18px] uppercase text-[var(--k-text)] border-t-[4px] border-t-[var(--status-green)] bg-[rgba(16,185,129,0.05)]">
            <span>Ready to Serve</span>
            <span className="bg-[var(--k-bg)] text-[var(--k-text)] py-[4px] px-[12px] rounded-[20px] text-[14px] font-black">{readyOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-[15px] flex flex-col gap-[15px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-[5px] [&::-webkit-scrollbar-thumb]:bg-[#444] [&::-webkit-scrollbar-thumb]:rounded-[10px] hover:[&::-webkit-scrollbar-thumb]:bg-[#666]">
            {readyOrders.map((order) => {
              const isDelivery = order.type.toLowerCase().includes("delivery");
              return (
                <KitchenCard
                  key={order.id}
                  order={order}
                  isReady={true}
                  btnText={isDelivery ? "Awaiting Rider" : "Complete"}
                  btnClass={isDelivery ? "gray" : "green"}
                  onNext={isDelivery ? () => {} : () => updateStatus(order.id, "completed")}
                />
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default KitchenDashboard;
