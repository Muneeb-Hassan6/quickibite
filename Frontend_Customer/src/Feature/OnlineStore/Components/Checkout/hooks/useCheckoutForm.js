import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCart } from "../../../../../Context/CartContext";
import { useCheckoutValidation } from "./useCheckoutValidation";

export function useCheckoutForm() {
  const navigate = useNavigate();
  const { cartItems, placeOrder } = useCart();

  const sessionMode = sessionStorage.getItem("orderMode");
  const sessionTable = sessionStorage.getItem("tableNumber");

  const [orderType, setOrderType] = useState(
    sessionMode === "Dine-In" ? "dine_in" : "delivery"
  );
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [tableNumber, setTableNumber] = useState(sessionTable || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

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
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_settings.php`
      );
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  const { data: availableTables = [] } = useQuery({
    queryKey: ["available_tables"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`
        );
        const result = await response.json();
        return result.success && Array.isArray(result.data)
          ? result.data.filter((t) => t.status == 1)
          : [];
      } catch {
        return [];
      }
    },
  });

  useEffect(() => {
    if (
      !sessionTable &&
      availableTables.length > 0 &&
      orderType === "dine_in" &&
      !tableNumber
    ) {
      setTableNumber(
        availableTables[0].table_name || availableTables[0].id.toString()
      );
    }
  }, [availableTables, orderType, sessionTable, tableNumber]);

  const baseDeliveryFee = storeSettings.delivery_fee
    ? parseFloat(storeSettings.delivery_fee)
    : 150;
  const deliveryTimeMinutes = storeSettings.delivery_time
    ? parseInt(storeSettings.delivery_time)
    : storeSettings.estimated_delivery_time
      ? parseInt(storeSettings.estimated_delivery_time)
      : 30;

  const subTotal = cartItems
    ? cartItems.reduce(
        (acc, item) => acc + parseFloat(item.price || 0) * (item.qty || 1),
        0
      )
    : 0;

  const deliveryFee = orderType === "delivery" ? baseDeliveryFee : 0;
  const total = subTotal + deliveryFee;

  const expectedDate = new Date(
    new Date().getTime() + (deliveryTimeMinutes || 30) * 60000
  );
  const expectedTimeStr = expectedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleNameChange = (e) =>
    nameHandler(e, setCustomerName, setErrors);

  const handleMobileChange = (e) =>
    mobileHandler(e, setCustomerMobile, setErrors);

  const validateForm = () =>
    formValidator({
      customerName,
      customerMobile,
      orderType,
      houseNo,
      street,
      area,
      tableNumber,
      setErrors,
    });

  const handleProceedOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty! Please add delicious meals first.");
      navigate("/menu");
      return;
    }

    if (!validateForm()) return;

    if (paymentMethod !== "Cash on Delivery") {
      if (paymentMethod.includes("JazzCash")) {
        setSandboxMethod("jazzcash");
      } else if (paymentMethod.includes("EasyPaisa")) {
        setSandboxMethod("easypaisa");
      } else {
        setSandboxMethod("card");
      }
      setSandboxInput1("03001234567");
      setSandboxInput2("1234");
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

      const orderPayload = {
        name: customerName.trim(),
        mobile: customerMobile.trim(),
        address: fullAddress,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: paymentMethodUsed,
        paymentStatus: paymentStatus,
        orderType: orderType,
        tableNumber: orderType === "dine_in" ? tableNumber : null,
        items: cartItems.map((i) => ({
          id: i.id,
          name: i.name || i.title,
          price: i.price,
          qty: i.qty || 1,
          size: i.size || "Regular",
          note: i.note || "",
          selectedAddons: i.selectedAddons || [],
          removedIngredients: i.removedIngredients || [],
          dealSelections: i.dealSelections || [],
        })),
      };

      const result = await placeOrder(orderPayload);

      if (result && result.success) {
        toast.success("Order placed successfully! 🍕", { duration: 4000 });
        sessionStorage.removeItem("orderMode");
        sessionStorage.removeItem("tableNumber");
        const orderId = result.orderId || result.id || "";
        if (orderId) {
          localStorage.setItem("activeOrderId", orderId);
          navigate(`/track-order?orderId=${orderId}`);
        } else {
          navigate("/track-order");
        }
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
    handleNameChange,
    handleMobileChange,
    handleProceedOrder,
    sandboxModalOpen,
    setSandboxModalOpen,
    sandboxMethod,
    sandboxLoading,
    sandboxInput1,
    setSandboxInput1,
    sandboxInput2,
    setSandboxInput2,
    handleSandboxSuccess,
  };
}
