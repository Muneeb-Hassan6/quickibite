import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { riderSocket } from "./useRiderSocket";
import { calculateDistance } from "./useRiderLocation";

export function useRiderMutations({
  riderSession,
  isOnline,
  setIsOnline,
  riderLocation,
  currentOrder,
  setCurrentOrder,
  incomingOrderDetails,
  setIncomingOrderDetails,
  setDistance,
  setIsArrived,
  setRoutePath,
  setAiData,
  setDeliveryPhoto,
  setOrderStatus,
  fetchMapboxAI,
  history,
  setHistory,
  setStats,
  queryClient,
}) {
  // 1. TOGGLE DUTY STATUS MUTATION
  const toggleDutyStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      if (!riderSession?.id) return;
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
    },
    onSuccess: (_, newStatus) => {
      setIsOnline(newStatus);
      riderSocket.emit("rider_status_update");
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
      }
      toast.success(newStatus ? "You are now ONLINE!" : "You are now OFFLINE.");
    },
    onError: () => {
      toast.error("Failed to update duty status.");
    },
  });

  const handleToggleStatus = useCallback(() => {
    toggleDutyStatusMutation.mutate(!isOnline);
  }, [isOnline, toggleDutyStatusMutation]);

  // 2. ACCEPT ORDER
  const acceptOrder = useCallback(async () => {
    if (!incomingOrderDetails) return;
    const target = incomingOrderDetails;
    const customerPhone = target.phone;

    setCurrentOrder(target);
    setIncomingOrderDetails(null);
    setIsArrived(false);
    setDeliveryPhoto(null);
    setOrderStatus("heading_to_customer");
    setAiData({ eta: "...", roadDistance: "..." });
    setRoutePath([]);

    const dist = calculateDistance(
      riderLocation.lat,
      riderLocation.lng,
      target.targetLat,
      target.targetLng
    );
    setDistance(Math.round(dist));
    fetchMapboxAI(
      riderLocation.lat,
      riderLocation.lng,
      target.targetLat,
      target.targetLng
    );

    if (customerPhone && customerPhone !== "N/A" && customerPhone.trim() !== "") {
      let formattedPhone = customerPhone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "92" + formattedPhone.slice(1);
      } else if (formattedPhone.length === 10 && formattedPhone.startsWith("3")) {
        formattedPhone = "92" + formattedPhone;
      }
      const riderName = riderSession?.name || "Rider";
      const riderPhone = riderSession?.phone || "";
      const msg = `Hi! Your QuickBite order is accepted by our rider *${riderName}*. Contact: ${riderPhone}. They are on their way to deliver your order!`;
      const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(
        msg
      )}`;
      window.open(waUrl, "_blank");
    }

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
      riderSocket.emit("rider_status_update");
    } catch (err) {
      console.warn("Could not update rider status on accept:", err);
    }
  }, [
    incomingOrderDetails,
    riderLocation,
    riderSession,
    setCurrentOrder,
    setIncomingOrderDetails,
    setIsArrived,
    setDeliveryPhoto,
    setOrderStatus,
    setAiData,
    setRoutePath,
    setDistance,
    fetchMapboxAI,
  ]);

  // 3. COMPLETE DELIVERY MUTATION
  const completeDeliveryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/complete_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: currentOrder.id,
            rider_id: riderSession.id,
          }),
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to complete delivery");
      }
      return data;
    },
    onSuccess: () => {
      riderSocket.emit("order_delivered");
      riderSocket.emit("order_status_updated");
      riderSocket.emit("rider_status_update");
      riderSocket.emit("refresh_kitchen");

      const isCash = currentOrder?.paymentType === "Cash on Delivery";
      const orderAmount =
        parseInt(currentOrder?.total?.replace(/\D/g, "") || "0") || 0;

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
      if (riderSession?.id) {
        localStorage.setItem(
          `history_${riderSession.id}`,
          JSON.stringify(updatedHistory)
        );
      }

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
      setDeliveryPhoto(null);
      setOrderStatus("heading_to_customer");
      toast.success("Delivery marked as completed!");
    },
    onError: (err) => {
      toast.error(err.message || "Could not complete delivery.");
    },
  });

  // 4. DECLINE / CANCEL ORDER MUTATION
  const declineOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/decline_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            rider_id: riderSession.id,
          }),
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to cancel");
      return data;
    },
    onSuccess: () => {
      riderSocket.emit("rider_status_update");
      riderSocket.emit("refresh_kitchen");
      riderSocket.emit("order_status_updated");

      setCurrentOrder(null);
      setIncomingOrderDetails(null);
      setDistance(null);
      setIsArrived(false);
      setRoutePath([]);
      setDeliveryPhoto(null);
      setOrderStatus("heading_to_customer");
      toast.success("Order returned to dispatcher queue.");
    },
    onError: (err) => {
      toast.error(err.message || "Could not decline order.");
    },
  });

  return {
    handleToggleStatus,
    isTogglingStatus: toggleDutyStatusMutation.isPending,
    acceptOrder,
    completeDelivery: () => completeDeliveryMutation.mutate(),
    isCompletingDelivery: completeDeliveryMutation.isPending,
    declineOrder: (id) => declineOrderMutation.mutate(id),
  };
}
