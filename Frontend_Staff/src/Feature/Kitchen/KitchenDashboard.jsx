import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import KitchenHeader from "./Components/KitchenHeader.jsx";
import KitchenCard from "./Components/KitchenCard.jsx";

const KitchenDashboard = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("All");
  const socketRef = useRef(null);

  // 1. FETCH LIVE ORDERS via React Query
  const { data: orders = [] } = useQuery({
    queryKey: ['kitchen_orders'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_orders.php`);
      const data = await response.json();
      
      const rawOrders = Array.isArray(data) ? data : (data.data || []);
      if (!Array.isArray(rawOrders)) return [];

      const formattedOrders = rawOrders.map((dbOrder) => {
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
        } else if (dbOrder.cart && Array.isArray(dbOrder.cart)) {
          rawItems = dbOrder.cart;
        }

        const statusLower = (dbOrder.status || "").toLowerCase();

        return {
          id: dbOrder.id,
          table: dbOrder.table_number || dbOrder.customer_name || "Walk-in",
          time: (() => {
            if (!dbOrder.created_at) return dbOrder.time || "N/A";
            const dateStr = dbOrder.created_at.replace(" ", "T");
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) {
              const parts = dbOrder.created_at.split(" ");
              if (parts.length > 1) {
                return parts[1].substring(0, 5);
              }
              return dbOrder.time || "N/A";
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
              : statusLower === "cooking" || statusLower === "preparing"
                ? "preparing"
                : "ready",

          type: dbOrder.order_type
            ? dbOrder.order_type.toUpperCase().replace("_", " ")
            : "TAKEAWAY",

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
    refetchInterval: 10000,
    staleTime: 4000
  });

  // REAL-TIME SOCKET.IO
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on("new_order", (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
      toast.success(`🔔 New Order #${newOrder.id} Received!`, {
        duration: 4000,
        style: { background: "#141414", color: "#f59e0b", border: "1px solid #f59e0b" },
      });
    });

    socket.on("order_status_updated", () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  // MUTATION FOR UPDATING ORDER STATUS
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_order_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: orderId, status: newStatus }),
        }
      );
      return response.json();
    },
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['kitchen_orders'] });
      const previousOrders = queryClient.getQueryData(['kitchen_orders']);

      queryClient.setQueryData(['kitchen_orders'], (old) => {
        if (!old) return [];
        return old.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: newStatus === "ready" ? "ready" : newStatus === "cooking" ? "preparing" : newStatus,
            };
          }
          return order;
        });
      });

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['kitchen_orders'], context.previousOrders);
      }
      toast.error("Failed to update status.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
    },
  });

  const updateStatus = (orderId, targetStatus) => {
    let dbStatus = "Cooking";
    if (targetStatus === "ready") dbStatus = "Ready";
    else if (targetStatus === "completed") dbStatus = "Completed";
    else if (targetStatus === "preparing") dbStatus = "Cooking";

    statusMutation.mutate({ orderId, newStatus: dbStatus });
  };

  // SMART FILTERS
  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((o) => {
          const orderType = o.type.replace(/[-_ ]/g, "").toLowerCase();
          const filterType = activeFilter.replace(/[-_ ]/g, "").toLowerCase();
          return orderType.includes(filterType);
        });

  const newOrders = filteredOrders.filter((o) => o.status === "pending");
  const prepOrders = filteredOrders.filter((o) => o.status === "preparing");
  const readyOrders = filteredOrders.filter((o) => o.status === "ready");

  return (
    <div className="min-h-screen bg-[var(--k-bg,#0f0f11)] text-[var(--k-text,#fff)] flex flex-col font-sans animate-slide-up">
      <KitchenHeader
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 p-3 sm:p-5 overflow-y-auto">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="bg-[var(--k-panel,#18181b)] rounded-2xl flex flex-col h-full shadow-lg overflow-hidden border border-white/5 min-h-[420px]">
          <div className="p-3.5 sm:p-4 flex justify-between items-center font-['Oswald',sans-serif] font-black text-sm uppercase text-[var(--k-text,#fff)] border-t-4 border-t-amber-500 bg-amber-500/10">
            <span className="tracking-wide">New Orders</span>
            <span className="bg-black/40 text-amber-400 py-1 px-3 rounded-full text-xs font-black">
              {newOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {newOrders.length > 0 ? (
              newOrders.map((order) => (
                <KitchenCard
                  key={order.id}
                  order={order}
                  btnText="Start Prep"
                  btnClass="yellow"
                  onNext={() => updateStatus(order.id, "preparing")}
                />
              ))
            ) : (
              <div className="py-12 text-center text-xs text-neutral-500 font-semibold">
                No new pending orders
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="bg-[var(--k-panel,#18181b)] rounded-2xl flex flex-col h-full shadow-lg overflow-hidden border border-white/5 min-h-[420px]">
          <div className="p-3.5 sm:p-4 flex justify-between items-center font-['Oswald',sans-serif] font-black text-sm uppercase text-[var(--k-text,#fff)] border-t-4 border-t-orange-500 bg-orange-500/10">
            <span className="tracking-wide">Preparing & Cooking</span>
            <span className="bg-black/40 text-orange-400 py-1 px-3 rounded-full text-xs font-black">
              {prepOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {prepOrders.length > 0 ? (
              prepOrders.map((order) => (
                <KitchenCard
                  key={order.id}
                  order={order}
                  btnText="Mark Ready"
                  btnClass="red"
                  onNext={() => updateStatus(order.id, "ready")}
                />
              ))
            ) : (
              <div className="py-12 text-center text-xs text-neutral-500 font-semibold">
                No orders currently in prep
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: READY TO SERVE */}
        <div className="bg-[var(--k-panel,#18181b)] rounded-2xl flex flex-col h-full shadow-lg overflow-hidden border border-white/5 min-h-[420px] md:col-span-2 lg:col-span-1">
          <div className="p-3.5 sm:p-4 flex justify-between items-center font-['Oswald',sans-serif] font-black text-sm uppercase text-[var(--k-text,#fff)] border-t-4 border-t-emerald-500 bg-emerald-500/10">
            <span className="tracking-wide">Ready to Serve / Dispatch</span>
            <span className="bg-black/40 text-emerald-400 py-1 px-3 rounded-full text-xs font-black">
              {readyOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {readyOrders.length > 0 ? (
              readyOrders.map((order) => {
                const isDelivery = order.type.toLowerCase().includes("delivery");
                return (
                  <KitchenCard
                    key={order.id}
                    order={order}
                    isReady={true}
                    btnText={isDelivery ? "Awaiting Rider" : "Complete Order"}
                    btnClass={isDelivery ? "gray" : "green"}
                    onNext={isDelivery ? () => {} : () => updateStatus(order.id, "completed")}
                  />
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-neutral-500 font-semibold">
                No orders waiting for pickup
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;
