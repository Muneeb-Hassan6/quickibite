import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Singleton socket instance across the entire staff app lifecycle
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
const socket = io(SOCKET_URL, {
  transports: ["polling", "websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  autoConnect: true,
});

// Singleton AudioContext reference for persistent, unlocked Web Audio playback
let globalAudioCtx = null;

export const playKitchenChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!globalAudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume().catch(() => {});
    }
    const ctx = globalAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Kitchen chime playback error:", e);
  }
};

export function useKitchenOrders() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [printOrder, setPrintOrder] = useState(null);

  // Auto-unlock Web Audio on first user interaction with the dashboard
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !globalAudioCtx) {
          globalAudioCtx = new AudioCtx();
        }
        if (globalAudioCtx && globalAudioCtx.state === "suspended") {
          globalAudioCtx.resume().catch(() => {});
        }
      } catch (e) {}
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // 1. FETCH LIVE ORDERS via React Query
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["kitchen_orders"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php`
      );
      const data = await response.json();

      const rawOrders = Array.isArray(data) ? data : data.data || [];
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
          table:
            dbOrder.table_number ||
            dbOrder.table ||
            (dbOrder.order_type?.toLowerCase().includes("delivery")
              ? "Delivery"
              : "Takeaway"),
          table_number: dbOrder.table_number || dbOrder.table,
          time: (() => {
            if (!dbOrder.created_at) return dbOrder.time || "N/A";
            const d = new Date(dbOrder.created_at);
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

          // Status Mapping (pending -> preparing -> ready -> completed)
          status:
            statusLower === "pending"
              ? "pending"
              : statusLower === "cooking" || statusLower === "preparing"
              ? "preparing"
              : statusLower === "ready"
              ? "ready"
              : statusLower === "completed"
              ? "completed"
              : statusLower,

          type: dbOrder.order_type
            ? dbOrder.order_type.toUpperCase().replace("_", " ")
            : "TAKEAWAY",

          items: rawItems.map((i) => ({
            name: i ? i.name || i.title || "" : "",
            qty: i ? i.qty || i.quantity || 1 : 1,
            size: i ? i.size || "" : "",
            note: i ? i.note || "" : "",
            description: i ? i.description || "" : "",
            spice_level: i ? i.spice_level || i.spiceLevel || "" : "",
            selected_addons_json: i ? i.selected_addons_json || i.selected_addons || null : null,
          })),

          originalStatus: dbOrder.status || "Pending",
        };
      });

      return formattedOrders;
    },
    refetchInterval: 10000,
    staleTime: 4000,
  });

  // 2. REAL-TIME SOCKET.IO LISTENER & CHIME (Singleton-safe subscription)
  useEffect(() => {
    const handleNewOrder = (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_orders"] });
      playKitchenChime();

      toast.success(`🔔 New Order #${newOrder?.id || ""} Received!`, {
        duration: 4000,
        style: {
          background: "#18181b",
          color: "#fbbf24",
          border: "1px solid #fbbf24",
        },
      });
    };

    const handleRefreshKitchen = () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_orders"] });
      playKitchenChime();
    };

    const handleStatusUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_orders"] });
    };

    // Listen to all relevant order triggers from socket server
    socket.on("new_order", handleNewOrder);
    socket.on("new_order_placed", handleNewOrder);
    socket.on("refresh_kitchen", handleRefreshKitchen);
    socket.on("order_status_updated", handleStatusUpdate);
    socket.on("order_status_changed", handleStatusUpdate);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("new_order_placed", handleNewOrder);
      socket.off("refresh_kitchen", handleRefreshKitchen);
      socket.off("order_status_updated", handleStatusUpdate);
      socket.off("order_status_changed", handleStatusUpdate);
    };
  }, [queryClient]);

  // 3. MUTATION FOR UPDATING ORDER STATUS WITH STATE PROGRESSION GUARD
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_order_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId, status: newStatus }),
        }
      );
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to update order status");
      }
      return result;
    },
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["kitchen_orders"] });
      const previousOrders = queryClient.getQueryData(["kitchen_orders"]);

      queryClient.setQueryData(["kitchen_orders"], (old) => {
        if (!old) return [];
        return old.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status:
                newStatus === "Ready"
                  ? "ready"
                  : newStatus === "Cooking"
                  ? "preparing"
                  : newStatus === "Completed"
                  ? "completed"
                  : newStatus,
            };
          }
          return order;
        });
      });

      return { previousOrders };
    },
    onSuccess: () => {
      // Broadcast to other staff displays immediately
      socket.emit("order_status_changed");
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["kitchen_orders"], context.previousOrders);
      }
      toast.error(err.message || "Failed to update status.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_orders"] });
    },
  });

  const updateStatus = (orderId, targetStatus) => {
    // 🛡️ Client-Side State Progression Guard
    const currentOrder = orders.find((o) => o.id === orderId);
    if (currentOrder) {
      const currentNorm = (currentOrder.status || "").toLowerCase();
      if (currentNorm === "pending" && targetStatus !== "preparing") {
        toast.error("State progression blocked: New order must be set to 'Cooking' first!");
        return;
      }
      if (currentNorm === "preparing" && targetStatus !== "ready") {
        toast.error("State progression blocked: Preparing order must be marked 'Ready' first!");
        return;
      }
      if (currentNorm === "ready" && targetStatus !== "completed") {
        toast.error("State progression blocked: Ready order can only be marked 'Completed'!");
        return;
      }
    }

    let dbStatus = "Cooking";
    if (targetStatus === "ready") dbStatus = "Ready";
    else if (targetStatus === "completed") dbStatus = "Completed";
    else if (targetStatus === "preparing") dbStatus = "Cooking";

    statusMutation.mutate({ orderId, newStatus: dbStatus });
  };

  // 4. SMART FILTERING & STAGE PARTITIONING
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const activeUpper = (activeFilter || "ALL").toUpperCase().replace(/[-_ ]/g, "");
    if (activeUpper === "ALL") return orders;

    return orders.filter((order) => {
      const orderTypeUpper = (order.type || order.order_type || "")
        .toUpperCase()
        .replace(/[-_ ]/g, "");
      return orderTypeUpper.includes(activeUpper);
    });
  }, [orders, activeFilter]);

  const newOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === "pending"),
    [filteredOrders]
  );
  const prepOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === "preparing"),
    [filteredOrders]
  );
  const readyOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === "ready"),
    [filteredOrders]
  );

  return {
    orders,
    filteredOrders,
    newOrders,
    prepOrders,
    readyOrders,
    activeFilter,
    setActiveFilter,
    updateStatus,
    printOrder,
    setPrintOrder,
    isLoading,
  };
}
