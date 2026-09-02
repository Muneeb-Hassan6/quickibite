import { useState, useEffect, useMemo } from "react";
import { API_BASE } from "../../../utils/apiHelper";
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

export function useKitchenOrders() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [printOrder, setPrintOrder] = useState(null);

  // 1. FETCH LIVE ORDERS via React Query
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["kitchen_orders"],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/get_orders.php`
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

      // Optional audio notification chime
      try {
        const audio = new Audio("/audio/order-chime.mp3");
        audio.play().catch(() => { });
      } catch (e) {
        // audio playback ignored if unavailable
      }

      toast.success(`🔔 New Order #${newOrder?.id || ""} Received!`, {
        duration: 4000,
        style: {
          background: "#18181b",
          color: "#fbbf24",
          border: "1px solid #fbbf24",
        },
      });
    };

    const handleStatusUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_orders"] });
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, [queryClient]);

  // 3. MUTATION FOR UPDATING ORDER STATUS
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const response = await fetch(
        `${API_BASE}/update_order_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId, status: newStatus }),
        }
      );
      return await response.json();
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
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["kitchen_orders"], context.previousOrders);
      }
      toast.error("Failed to update status.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_orders"] });
    },
  });

  const updateStatus = (orderId, targetStatus) => {
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
