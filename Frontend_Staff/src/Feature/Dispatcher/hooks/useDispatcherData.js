import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

// Module-Level Singleton Socket Instance
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
});

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const toRad = (v) => (v * Math.PI) / 180;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export function useDispatcherData() {
  const queryClient = useQueryClient();

  // Selection & UI States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);
  const [batchRadius, setBatchRadius] = useState(2000);
  const [isAutoPilotOn, setIsAutoPilotOn] = useState(false);
  const [autoPilotMinutes, setAutoPilotMinutes] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState("");
  const [manualBatchedOrders, setManualBatchedOrders] = useState(null);

  const [mapViewState, setMapViewState] = useState({
    longitude: 74.3587,
    latitude: 31.5204, // Default Lahore
    zoom: 11.5,
    pitch: 0,
  });

  // 1. FETCH ORDERS via React Query
  const { data: rawOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ["dispatcher_orders"],
    queryFn: async () => {
      const orderRes = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=all`
      );
      const orderData = await orderRes.json();
      return Array.isArray(orderData) ? orderData : orderData.data || [];
    },
    refetchInterval: 10000,
    staleTime: 4000,
  });

  // 2. FETCH STAFF via React Query
  const { data: rawStaff = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ["dispatcher_staff"],
    queryFn: async () => {
      const staffRes = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_staff.php`
      );
      const staffJson = await staffRes.json();
      return staffJson.success && Array.isArray(staffJson.data)
        ? staffJson.data
        : [];
    },
    refetchInterval: 15000,
    staleTime: 5000,
  });

  // 3. SINGLETON SOCKET LISTENERS (Zero Memory Leaks)
  useEffect(() => {
    const handleJoin = () => {
      socket.emit("join_room", "dispatcher");
    };

    const invalidateQueries = () => {
      queryClient.invalidateQueries({ queryKey: ["dispatcher_orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    };

    if (socket.connected) {
      handleJoin();
    } else {
      socket.on("connect", handleJoin);
    }

    socket.on("refresh_kitchen", invalidateQueries);
    socket.on("refresh_rider", invalidateQueries);
    socket.on("refresh_rider_list", invalidateQueries);
    socket.on("new_order", invalidateQueries);
    socket.on("order_status_updated", invalidateQueries);

    return () => {
      socket.off("connect", handleJoin);
      socket.off("refresh_kitchen", invalidateQueries);
      socket.off("refresh_rider", invalidateQueries);
      socket.off("refresh_rider_list", invalidateQueries);
      socket.off("new_order", invalidateQueries);
      socket.off("order_status_updated", invalidateQueries);
    };
  }, [queryClient]);

  // 4. MEMOIZED DERIVED DATA SELECTORS
  const rawReadyOrders = useMemo(() => {
    if (!Array.isArray(rawOrders)) return [];
    return rawOrders
      .filter((o) => {
        const type = String(o.order_type || o.type || "").toLowerCase().trim();
        const status = String(o.status || "").toLowerCase().trim();
        return (
          type.includes("delivery") &&
          (status === "ready" || status === "ready to serve")
        );
      })
      .map((o) => {
        let rawItems = [];
        try {
          rawItems =
            typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
        } catch (e) {}

        return {
          id: o.id,
          customer: o.customer_name || "Unknown Customer",
          address: o.customer_address || "No Address Provided",
          targetLat:
            parseFloat(o.lat) || 31.5204 + (Math.random() - 0.5) * 0.05,
          targetLng:
            parseFloat(o.lng) || 74.3587 + (Math.random() - 0.5) * 0.05,
          items: `${rawItems?.length || 0} Items`,
          total: `Rs ${o.total}`,
          time: o.created_at
            ? new Date(o.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just Now",
          payment: "COD",
          isUrgent: false,
        };
      });
  }, [rawOrders]);

  // If manual batching is applied, use it; otherwise use rawReadyOrders
  const readyOrders = useMemo(() => {
    return manualBatchedOrders !== null ? manualBatchedOrders : rawReadyOrders;
  }, [manualBatchedOrders, rawReadyOrders]);

  const activeTrips = useMemo(() => {
    if (!Array.isArray(rawOrders)) return [];
    return rawOrders
      .filter((o) => {
        const status = String(o.status || "").toLowerCase().trim();
        const type = String(o.order_type || o.type || "").toLowerCase().trim();
        const isDelivery = type.includes("delivery");
        return (
          isDelivery &&
          (status === "dispatched" ||
            status === "out for delivery" ||
            status === "on the way") &&
          status !== "delivered" &&
          status !== "completed" &&
          status !== "cancelled"
        );
      })
      .map((o) => {
        let rawItems = [];
        try {
          rawItems =
            typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
        } catch (e) {}

        return {
          id: o.id,
          customer: o.customer_name || "Unknown Customer",
          address: o.customer_address || "No Address",
          items: `${rawItems?.length || 0} Items`,
          total: `Rs ${o.total}`,
          time: o.created_at
            ? new Date(o.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just Now",
          payment: "COD",
          assignedRider: {
            id: o.rider_id,
            name: o.rider_name || `Rider #${o.rider_id}`,
          },
        };
      });
  }, [rawOrders]);

  const completedCount = useMemo(() => {
    if (!Array.isArray(rawOrders)) return 0;
    return rawOrders.filter((o) => {
      const type = String(o.order_type || o.type || "").toLowerCase().trim();
      const status = String(o.status || "").toLowerCase().trim();
      return (
        type.includes("delivery") &&
        (status === "delivered" || status === "completed")
      );
    }).length;
  }, [rawOrders]);

  const riders = useMemo(() => {
    if (!Array.isArray(rawStaff)) return [];
    const riderStaff = rawStaff.filter((s) => {
      const role = s.role ? s.role.toLowerCase() : "";
      const designation = s.designation ? s.designation.toLowerCase() : "";
      return role === "rider" || designation === "rider";
    });

    return riderStaff.map((r) => ({
      id: r.id,
      name: r.name || "Unknown Rider",
      status: r.shift_status || r.status || "Offline",
      location: {
        lat: parseFloat(r.lat) || 31.5204 + (Math.random() - 0.5) * 0.03,
        lng: parseFloat(r.lng) || 74.3587 + (Math.random() - 0.5) * 0.03,
      },
      trips: parseInt(r.trips_completed) || 0,
      rating: 4.8,
      vehicle: r.vehicle || "Bike",
      phone: r.phone || "N/A",
      accuracy: "98%",
    }));
  }, [rawStaff]);

  const freeRidersCount = useMemo(() => {
    return riders.filter(
      (r) => String(r.status).toLowerCase() === "available"
    ).length;
  }, [riders]);

  // 5. ASSIGN RIDER MUTATION (Clean Singleton Socket Emit)
  const assignMutation = useMutation({
    mutationFn: async ({ orderId, riderId, batchDetails }) => {
      const ordersToAssign = batchDetails ? batchDetails.map((b) => b.id) : [orderId];

      for (const id of ordersToAssign) {
        await fetch(`${import.meta.env.VITE_API_BASE}/assign_rider.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: id,
            id: id,
            rider_id: riderId,
            status: "Dispatched",
          }),
        });
      }

      await fetch(`${import.meta.env.VITE_API_BASE}/update_rider_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: riderId, status: "Busy" }),
      });
    },
    onSuccess: () => {
      socket.emit("trigger_rider_assignment");
      socket.emit("rider_status_update");
      socket.emit("refresh_kitchen");

      queryClient.invalidateQueries({ queryKey: ["dispatcher_orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Rider assigned successfully!");
    },
    onError: (err) => {
      console.error("Assignment error:", err);
      toast.error("Failed to assign rider.");
    },
  });

  const handleAssign = useCallback(() => {
    if (!selectedOrder || !selectedRider) return;

    assignMutation.mutate({
      orderId: selectedOrder.id,
      riderId: selectedRider.id,
      batchDetails: selectedOrder.batchDetails,
    });

    setSelectedOrder(null);
    setSelectedRider(null);
    setManualBatchedOrders(null);
  }, [selectedOrder, selectedRider, assignMutation]);

  // 6. MARK DELIVERED MUTATION (Fixes stuck order in Active Trips)
  const markDeliveredMutation = useMutation({
    mutationFn: async ({ orderId, riderId }) => {
      // 1. Update order status to 'Delivered' in DB
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_order_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: orderId,
            order_id: orderId,
            status: "Delivered",
          }),
        }
      );
      const resJson = await res.json();

      // 2. Free rider status back to 'Available' in DB
      if (riderId) {
        await fetch(
          `${import.meta.env.VITE_API_BASE}/update_rider_status.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: riderId, status: "Available" }),
          }
        );
      }

      return resJson;
    },
    onSuccess: (_, variables) => {
      // Invalidate both orders and staff caches for immediate UI refresh
      queryClient.invalidateQueries({ queryKey: ["dispatcher_orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });

      // Broadcast real-time socket signals
      socket.emit("order_status_updated");
      socket.emit("rider_status_update");
      socket.emit("refresh_kitchen");
      socket.emit("refresh_rider");
      socket.emit("refresh_rider_list");

      toast.success(`Order #${variables.orderId} marked as delivered!`);
    },
    onError: (err) => {
      console.error("Delivery completion error:", err);
      toast.error("Failed to complete delivery.");
    },
  });

  const handleCompleteTrip = useCallback(
    (tripId, riderId) => {
      markDeliveredMutation.mutate({ orderId: tripId, riderId });
    },
    [markDeliveredMutation]
  );

  // 7. SMART MANUAL BATCHING
  const handleSmartBatching = useCallback(() => {
    if (readyOrders.length < 2) {
      toast.error("Need at least 2 orders to create a batch!");
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
            o.targetLng
          ) <= batchRadius
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

    setManualBatchedOrders(batchedList);
    toast.success(
      `Manual Batching Complete! Radius Set: ${(batchRadius / 1000).toFixed(1)} KM`
    );
  }, [readyOrders, batchRadius]);

  // 8. AUTO-PILOT INTERVAL ENGINE
  useEffect(() => {
    let interval;
    if (isAutoPilotOn) {
      interval = setInterval(() => {
        if (readyOrders.length === 0) {
          setIsAutoPilotOn(false);
          toast.success("Queue cleared! All orders dispatched.");
          return;
        }

        const freeRiders = riders.filter((r) => r.status === "Available");
        if (freeRiders.length === 0) {
          setIsAutoPilotOn(false);
          toast.error("All riders busy! Auto-Pilot paused.");
          return;
        }

        const targetOrder = readyOrders[0];
        const bestRider = [...freeRiders].sort((a, b) => a.trips - b.trips)[0];

        assignMutation.mutate({
          orderId: targetOrder.id,
          riderId: bestRider.id,
          batchDetails: targetOrder.batchDetails,
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoPilotOn, readyOrders, riders, assignMutation]);

  // 9. TIMED AUTO-PILOT COUNTDOWN
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
        toast("⏳ Auto-Pilot time expired. Switched to manual.");
        clearInterval(countdownInterval);
      }
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [isAutoPilotOn, autoPilotMinutes]);

  return {
    readyOrders,
    activeTrips,
    completedCount,
    riders,
    freeRidersCount,
    selectedOrder,
    setSelectedOrder,
    selectedRider,
    setSelectedRider,
    batchRadius,
    setBatchRadius,
    isAutoPilotOn,
    setIsAutoPilotOn,
    autoPilotMinutes,
    setAutoPilotMinutes,
    timerDisplay,
    mapViewState,
    setMapViewState,
    handleAssign,
    handleCompleteTrip,
    handleSmartBatching,
    isCompletingTrip: markDeliveredMutation.isPending,
    isLoading: isOrdersLoading || isStaffLoading,
  };
}
