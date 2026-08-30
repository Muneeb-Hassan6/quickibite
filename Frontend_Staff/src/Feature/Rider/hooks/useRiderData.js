import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRiderSocket } from "./useRiderSocket";
import { useRiderLocation } from "./useRiderLocation";
import { useRiderMutations } from "./useRiderMutations";
import { resolveAddressCoordinates } from "../utils/geocode";
import { resolveCoordinatesToAddress } from "../../../Utils/geoHydrator";

export function useRiderData() {
  const queryClient = useQueryClient();

  // 1. RIDER AUTH SESSION
  const [riderSession, setRiderSession] = useState(() => {
    const saved =
      localStorage.getItem("staff_session") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("staff_session") ||
      sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. DUTY & ACTIVE DELIVERY STATES
  const [isOnline, setIsOnline] = useState(
    riderSession?.status === "Available" ||
      riderSession?.shift_status === "Available"
  );
  const [currentOrder, setCurrentOrder] = useState(null);
  const [incomingOrderDetails, setIncomingOrderDetails] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("heading_to_customer");
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);

  // 3. STATS & HISTORY
  const [stats, setStats] = useState({
    deliveries: 0,
    earnings: 0,
    cashInHand: 0,
    onlineCollected: 0,
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (riderSession?.id) {
      const savedHistory = localStorage.getItem(`history_${riderSession.id}`);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  }, [riderSession?.id]);

  // 4. SUB-HOOK: SOCKET MANAGEMENT
  useRiderSocket({ riderId: riderSession?.id, queryClient });

  // 5. SUB-HOOK: LOCATION & MAPBOX NAVIGATION
  const {
    riderLocation,
    setManualRiderLocation,
    distance,
    setDistance,
    isArrived,
    setIsArrived,
    aiData,
    setAiData,
    routePath,
    setRoutePath,
    viewState,
    setViewState,
    fetchMapboxAI,
    MAPBOX_TOKEN,
  } = useRiderLocation({
    riderId: riderSession?.id,
    isOnline,
    currentOrder,
    orderStatus,
    setOrderStatus,
  });

  // 6. REACT QUERY: ASSIGNED ORDER POLLING
  const { data: assignedOrderData } = useQuery({
    queryKey: ["rider_assigned_order", riderSession?.id],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_assigned_order.php?rider_id=${
          riderSession.id
        }`
      );
      return await res.json();
    },
    enabled: Boolean(
      isOnline && !currentOrder && !incomingOrderDetails && riderSession?.id
    ),
    refetchInterval: 10000,
    staleTime: 3000,
  });

  useEffect(() => {
    if (
      assignedOrderData &&
      assignedOrderData.success &&
      assignedOrderData.order
    ) {
      const o = assignedOrderData.order;
      const addr =
        o.customer_address || o.address || o.full_address || "No Address Provided";
      const rawTargetLat = parseFloat(
        o.customer_lat || o.latitude || o.target_lat || o.lat
      );
      const rawTargetLng = parseFloat(
        o.customer_lng || o.longitude || o.target_lng || o.lng
      );

      const applyIncomingOrder = async (finalLat, finalLng) => {
        let finalAddr = addr;
        if (!finalAddr || finalAddr === "No Address Provided" || finalAddr === "Walk-in") {
          const hydrated = await resolveCoordinatesToAddress(finalLat, finalLng, MAPBOX_TOKEN);
          if (hydrated) {
            const house = o.house_info || o.house_no || "";
            finalAddr = house ? `${house}, ${hydrated.street}, ${hydrated.area}` : hydrated.fullAddress;
          }
        }

        setIncomingOrderDetails({
          id: o.id,
          customer: o.customer_name || o.customer || o.name || "Customer",
          phone: o.customer_mobile || o.mobile || o.phone || o.contact || "N/A",
          address: finalAddr,
          items: o.cart ? `${o.cart.length} Items` : "Items Details in DB",
          total: `Rs ${o.total}`,
          paymentType: o.payment_method || o.paymentMethod || "Cash on Delivery",
          time: "Just Now",
          targetLat: finalLat,
          targetLng: finalLng,
          customer_lat: finalLat,
          customer_lng: finalLng,
        });
      };

      if (
        rawTargetLat >= 23 &&
        rawTargetLat <= 37 &&
        rawTargetLng >= 60 &&
        rawTargetLng <= 78 &&
        Math.abs(rawTargetLat - 31.5102) > 0.0001
      ) {
        applyIncomingOrder(rawTargetLat, rawTargetLng);
      } else {
        // Run dynamic hybrid address resolver
        resolveAddressCoordinates(addr, "", "", MAPBOX_TOKEN).then((res) => {
          applyIncomingOrder(res.lat, res.lng);
        });
      }
    }
  }, [assignedOrderData, MAPBOX_TOKEN]);

  // 7. SUB-HOOK: MUTATIONS
  const {
    handleToggleStatus,
    isTogglingStatus,
    acceptOrder,
    completeDelivery,
    isCompletingDelivery,
    declineOrder,
  } = useRiderMutations({
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
  });

  // 8. PHOTO OF DELIVERY HANDLER (Explicit & Safe)
  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeliveryPhoto(reader.result);
        setOrderStatus("photo_captured");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return {
    riderSession,
    setRiderSession,
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
    setDeliveryPhoto,
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
  };
}
