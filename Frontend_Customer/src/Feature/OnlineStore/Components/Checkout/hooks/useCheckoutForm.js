import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCart } from "../../../../../Context/CartContext";
import { useAuth } from "../../../../../Context/AuthContext";
import { useOrderSession } from "../../../../../Hooks/useOrderSession";
import { useCheckoutValidation } from "./useCheckoutValidation";
import { resolveAddressCoordinates } from "../../../../../Utils/geocode";
import {
  getAccuratePosition,
  resolveCoordinatesToAddress,
} from "../../../../../Utils/geoHydrator";
import { API_BASE } from "../../../../../config/api";

export function useCheckoutForm() {
  const navigate = useNavigate();
  const { cartItems, placeOrder } = useCart();
  const { customer, isAuthenticated, savedAddresses } = useAuth();
  const { session, switchMode, clearDineIn } = useOrderSession();

  const [orderType, setOrderTypeState] = useState(session.mode || "delivery");
  const [customerName, setCustomerName] = useState(customer?.full_name || customer?.name || "");
  const [customerMobile, setCustomerMobile] = useState(customer?.phone || customer?.mobile || "");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [tableNumber, setTableNumber] = useState(session.tableNumber || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  // Enterprise Promo & Rider Tip State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [riderTip, setRiderTip] = useState(0);

  // Auto-fill from auth profile if customer logs in or changes
  useEffect(() => {
    if (customer) {
      if (!customerName && (customer.full_name || customer.name)) {
        setCustomerName(customer.full_name || customer.name);
      }
      if (!customerMobile && (customer.phone || customer.mobile)) {
        setCustomerMobile(customer.phone || customer.mobile);
      }
    }
  }, [customer]);

  // Auto-fill default saved address if fields are empty
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !houseNo && !street && !area) {
      const defaultAddr = savedAddresses.find((a) => a.is_default == 1) || savedAddresses[0];
      if (defaultAddr) {
        if (defaultAddr.house_no) setHouseNo(defaultAddr.house_no);
        if (defaultAddr.street) setStreet(defaultAddr.street);
        if (defaultAddr.area) setArea(defaultAddr.area);
        if (defaultAddr.lat && defaultAddr.lng) {
          setMapCoords({ lat: parseFloat(defaultAddr.lat), lng: parseFloat(defaultAddr.lng) });
        }
      }
    }
  }, [savedAddresses]);

  // Sync state when session changes
  useEffect(() => {
    setOrderTypeState(session.mode);
    if (session.tableNumber) {
      setTableNumber(session.tableNumber);
    }
  }, [session.mode, session.tableNumber]);

  const setOrderType = (newMode) => {
    setOrderTypeState(newMode);
    switchMode(newMode);
  };

  // GPS Auto-Detection State
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [exactGpsCoords, setExactGpsCoords] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [sandboxMethod, setSandboxMethod] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxInput1, setSandboxInput1] = useState("");
  const [sandboxInput2, setSandboxInput2] = useState("");

  const {
    handleNameChange: nameHandler,
    handleMobileChange: mobileHandler,
    validateForm: formValidator,
  } = useCheckoutValidation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: storeSettings = {} } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE}/get_settings.php`
        );
        const result = await response.json();
        return result && result.success ? result.data : {};
      } catch (err) {
        console.warn("Could not fetch store settings, using defaults:", err);
        return {};
      }
    },
    staleTime: 60000,
  });

  const { data: availableTables = [] } = useQuery({
    queryKey: ["available_tables"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE}/get_tables.php`
        );
        if (!response.ok) return [];
        const result = await response.json();
        return result.data || [];
      } catch (err) {
        console.warn("Could not fetch available tables, using defaults:", err);
        return [];
      }
    },
    staleTime: 60000,
  });

  const baseDeliveryFee = Number(storeSettings.default_delivery_fee || storeSettings.delivery_fee) || 150;
  const freeThreshold = Number(storeSettings.free_delivery_threshold) || 1500;
  const subTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );
  const isFreeDelivery = subTotal >= freeThreshold && subTotal > 0;
  const deliveryFee = orderType === "delivery" ? (isFreeDelivery ? 0 : baseDeliveryFee) : 0;
  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount || 0) : 0;
  const effectiveTip = orderType === "delivery" ? (Number(riderTip) || 0) : 0;
  const total = Math.max(0, subTotal - discountAmount) + deliveryFee + effectiveTip;

  const estimatedPrepMinutes = 20;
  const estimatedDeliveryMinutes = 15;
  const deliveryTimeMinutes =
    orderType === "delivery"
      ? estimatedPrepMinutes + estimatedDeliveryMinutes
      : estimatedPrepMinutes;

  const expectedTimeStr = new Date(
    Date.now() + deliveryTimeMinutes * 60000
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleNameChange = (val) => {
    nameHandler(val, setCustomerName, setErrors);
  };

  const handleMobileChange = (val) => {
    mobileHandler(val, setCustomerMobile, setErrors);
  };

  const [mapCoords, setMapCoords] = useState({
    lat: 31.5204,
    lng: 74.3587,
  });

  const handleMapCoordinatesChange = ({
    lat,
    lng,
    street: detectedStreet,
    area: detectedArea,
    placeName,
  }) => {
    setMapCoords({ lat, lng });
    setExactGpsCoords({ lat, lng });

    if (detectedArea) {
      setArea(detectedArea);
      setErrors((prev) => ({ ...prev, area: "" }));
    }
    if (detectedStreet) {
      setStreet(detectedStreet);
      setErrors((prev) => ({ ...prev, street: "" }));
    } else if (placeName) {
      const parts = placeName.split(",").map((p) => p.trim());
      const areaCandidate = parts[0] || "";
      if (
        areaCandidate &&
        !["lahore", "pakistan", "punjab"].includes(areaCandidate.toLowerCase())
      ) {
        setArea(areaCandidate);
        setErrors((prev) => ({ ...prev, area: "" }));
      }
      if (
        parts[1] &&
        !["lahore", "pakistan", "punjab"].includes(parts[1].toLowerCase())
      ) {
        setStreet((prev) => prev || parts[1]);
        setErrors((prev) => ({ ...prev, street: "" }));
      }
    }
  };

  // ─── 📍 ONE-CLICK GPS LOCATION DETECTOR ───
  const handleUseCurrentLocation = () => {
    setIsDetectingGps(true);
    getAccuratePosition(
      async (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        setExactGpsCoords({ lat: latitude, lng: longitude });
        setMapCoords({ lat: latitude, lng: longitude });
        toast.success("📍 Exact GPS Coordinates Locked!", { duration: 3500 });

        // Reverse-geocode to auto-populate area and street
        const hydrated = await resolveCoordinatesToAddress(
          latitude,
          longitude,
          import.meta.env.VITE_MAPBOX_TOKEN
        );
        if (hydrated) {
          if (hydrated.area && hydrated.area !== "Lahore") {
            setArea(hydrated.area);
            setErrors((prev) => ({ ...prev, area: "" }));
          }
          if (hydrated.street && hydrated.street !== "Main Road") {
            setStreet(hydrated.street);
            setErrors((prev) => ({ ...prev, street: "" }));
          }
        }
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn("GPS Geolocation notice:", err?.message || err);
        // Graceful fallback to QuickBite Lahore HQ
        setMapCoords({ lat: 31.5204, lng: 74.3587 });
        toast("Could not detect exact GPS, please pick your location on the map.", {
          icon: "📍",
          duration: 4000,
        });
      }
    );
  };

  const handleProceedOrder = async () => {
    const isValid = formValidator({
      customerName,
      customerMobile,
      orderType,
      houseNo,
      street,
      area,
      tableNumber,
      setErrors,
    });

    if (!isValid) {
      const firstError = Object.values(errors)[0] || "Please fill all required fields.";
      toast.error(firstError);
      return;
    }

    if (
      paymentMethod === "JazzCash" ||
      paymentMethod === "EasyPaisa" ||
      paymentMethod === "Credit / Debit Card"
    ) {
      setSandboxMethod(paymentMethod);
      setSandboxInput1("");
      setSandboxInput2("");
      setSandboxModalOpen(true);
      return;
    }

    await submitFinalOrder("Cash on Delivery", "Unpaid");
  };

  const submitFinalOrder = async (
    paymentMethodUsed,
    paymentStatus = "Unpaid"
  ) => {
    setIsSubmitting(true);
    try {
      let fullAddress = "";
      if (orderType === "delivery") {
        fullAddress = `${houseNo}, ${street}, ${area}`.trim();
      } else if (orderType === "dine_in") {
        fullAddress = `Dine-In: Table ${tableNumber}`;
      } else {
        fullAddress = "Takeaway - Store Counter Pickup";
      }

      let customerLat = 31.5204;
      let customerLng = 74.3587;

      if (orderType === "delivery") {
        if (exactGpsCoords?.lat && exactGpsCoords?.lng) {
          customerLat = exactGpsCoords.lat;
          customerLng = exactGpsCoords.lng;
          console.log("📍 Using Exact Device GPS Coordinates:", exactGpsCoords);
        } else if (fullAddress) {
          const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
          const resolvedGeo = await resolveAddressCoordinates(
            fullAddress,
            area,
            street,
            MAPBOX_TOKEN
          );
          if (resolvedGeo?.lat && resolvedGeo?.lng) {
            customerLat = resolvedGeo.lat;
            customerLng = resolvedGeo.lng;
          }
        }
      }

      const mappedItems = cartItems.map((i) => ({
        id: i.id,
        name: i.name || i.title,
        title: i.name || i.title,
        price: i.price,
        qty: i.qty || 1,
        size: i.size || "Regular",
        note: i.note || "",
        selectedAddons: i.selectedAddons || [],
        removedIngredients: i.removedIngredients || [],
        dealSelections: i.dealSelections || [],
      }));

      const orderPayload = {
        customer_id: customer?.id || null,
        customerId: customer?.id || null,
        customer_email: customer?.email || "",
        customerEmail: customer?.email || "",
        email: customer?.email || "",
        name: customerName.trim(),
        customer_name: customerName.trim(),
        customerName: customerName.trim(),
        mobile: customerMobile.trim(),
        customer_mobile: customerMobile.trim(),
        customerMobile: customerMobile.trim(),
        phone: customerMobile.trim(),
        address: fullAddress,
        customer_address: fullAddress,
        customerAddress: fullAddress,
        customer_lat: customerLat,
        customer_lng: customerLng,
        target_lat: customerLat,
        target_lng: customerLng,
        latitude: customerLat,
        longitude: customerLng,
        lat: customerLat,
        lng: customerLng,
        house_no: houseNo.trim(),
        street: street.trim(),
        area: area.trim(),
        deliveryFee: deliveryFee,
        delivery_fee: deliveryFee,
        rider_tip: effectiveTip,
        riderTip: effectiveTip,
        coupon_code: appliedCoupon?.code || null,
        couponCode: appliedCoupon?.code || null,
        discount_amount: discountAmount,
        order_mode: orderType,
        orderMode: orderType,
        total: total,
        paymentMethod: paymentMethodUsed,
        payment_method: paymentMethodUsed,
        paymentStatus: paymentStatus,
        payment_status: paymentStatus,
        orderType: orderType,
        order_type: orderType,
        tableNumber: orderType === "dine_in" ? tableNumber : null,
        table_number: orderType === "dine_in" ? tableNumber : null,
        items: mappedItems,
        cart: mappedItems,
      };

      const result = await placeOrder(orderPayload);

      if (result && (result.success || result.id || result.orderId || result.order_id)) {
        sessionStorage.removeItem("orderMode");
        sessionStorage.removeItem("tableNumber");
        clearDineIn();
        const orderId = result.orderId || result.order_id || result.id || "";
        if (orderId) {
          localStorage.setItem("activeOrderId", orderId.toString());
          navigate(`/track-order?orderId=${orderId}`);
        } else {
          navigate("/track-order");
        }
      } else if (!result) {
        // Handled in CartContext (toast/modal already displayed)
      } else {
        toast.error(result?.message || "Failed to place order. Try again.");
      }
    } catch (err) {
      toast.error("Network error while submitting order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxSuccess = async () => {
    setSandboxLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSandboxLoading(false);
    setSandboxModalOpen(false);
    await submitFinalOrder(paymentMethod, "Paid Online (Sandbox)");
  };

  return {
    cartItems,
    orderType,
    setOrderType,
    session,
    clearDineIn,
    appliedCoupon,
    setAppliedCoupon,
    discountAmount,
    riderTip,
    setRiderTip,
    effectiveTip,
    customerName,
    customerMobile,
    houseNo,
    setHouseNo,
    street,
    setStreet,
    area,
    setArea,
    tableNumber,
    setTableNumber,
    paymentMethod,
    setPaymentMethod,
    errors,
    setErrors,
    isSubmitting,
    availableTables,
    baseDeliveryFee,
    deliveryFee,
    subTotal,
    total,
    expectedTimeStr,
    deliveryTimeMinutes,
    handleNameChange,
    handleMobileChange,
    handleProceedOrder,
    handleUseCurrentLocation,
    isDetectingGps,
    hasExactGps: Boolean(exactGpsCoords),
    mapCoords,
    setMapCoords,
    handleMapCoordinatesChange,
    sandboxModalOpen,
    setSandboxModalOpen,
    sandboxMethod,
    sandboxLoading,
    sandboxInput1,
    setSandboxInput1,
    sandboxInput2,
    setSandboxInput2,
    handleSandboxPay: handleSandboxSuccess,
  };
}
