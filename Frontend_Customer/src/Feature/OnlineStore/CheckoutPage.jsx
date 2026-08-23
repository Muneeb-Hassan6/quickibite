import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  LuBike,
  LuShoppingBag,
  LuUtensilsCrossed,
  LuBanknote,
  LuSmartphone,
  LuCreditCard,
  LuQrCode,
  LuShieldCheck,
  LuLock,
  LuClock,
  LuArrowRight,
  LuX,
  LuCheck,
  LuMapPin,
  LuCircleAlert,
} from "react-icons/lu";
import { useCart } from "../../Context/CartContext";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, placeOrder } = useCart();

  // Read Session Storage (QR Dine-in)
  const sessionMode = sessionStorage.getItem("orderMode");
  const sessionTable = sessionStorage.getItem("tableNumber");

  // Form State
  const [orderType, setOrderType] = useState(sessionMode === "Dine-In" ? "dine_in" : "delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [tableNumber, setTableNumber] = useState(sessionTable || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  // Validation State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Digital Payment Sandbox Modal State
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [sandboxMethod, setSandboxMethod] = useState(null); // 'jazzcash', 'easypaisa', 'card'
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxInput1, setSandboxInput1] = useState("");
  const [sandboxInput2, setSandboxInput2] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch store settings (delivery fee, delivery time)
  const { data: storeSettings = {} } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  // Fetch active tables for Dine-in dropdown
  const { data: availableTables = [] } = useQuery({
    queryKey: ["available_tables"],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`);
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
    if (!sessionTable && availableTables.length > 0 && orderType === "dine_in" && !tableNumber) {
      setTableNumber(availableTables[0].table_name || availableTables[0].id.toString());
    }
  }, [availableTables, orderType]);

  const baseDeliveryFee = storeSettings.delivery_fee ? parseFloat(storeSettings.delivery_fee) : 150;
  const deliveryTimeMinutes = storeSettings.delivery_time
    ? parseInt(storeSettings.delivery_time)
    : storeSettings.estimated_delivery_time
    ? parseInt(storeSettings.estimated_delivery_time)
    : 30;

  const subTotal = cartItems
    ? cartItems.reduce((acc, item) => acc + parseFloat(item.price || 0) * (item.qty || 1), 0)
    : 0;

  const deliveryFee = orderType === "delivery" ? baseDeliveryFee : 0;
  const total = subTotal + deliveryFee;

  // Expected Delivery Time
  const expectedDate = new Date(new Date().getTime() + (deliveryTimeMinutes || 30) * 60000);
  const expectedTimeStr = expectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ═════════════════════════════════════════════════════════
  // 1. STRICT REAL-TIME INPUT RESTRICTION HANDLERS
  // ═════════════════════════════════════════════════════════
  const handleNameChange = (e) => {
    // Only allow alphabetic characters and spaces (blocks numbers and symbols)
    const cleanVal = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setCustomerName(cleanVal);

    if (cleanVal.trim().length > 0 && cleanVal.trim().length < 3) {
      setErrors((prev) => ({ ...prev, name: "Name must be at least 3 letters long." }));
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleMobileChange = (e) => {
    // Strictly allow only digits and max 11 characters
    const cleanDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setCustomerMobile(cleanDigits);

    if (cleanDigits.length > 0) {
      if (!cleanDigits.startsWith("03")) {
        setErrors((prev) => ({
          ...prev,
          mobile: "Mobile number must start with 03 (e.g. 03001234567).",
        }));
      } else if (cleanDigits.length < 11) {
        setErrors((prev) => ({
          ...prev,
          mobile: `Please enter full 11 digits (${cleanDigits.length}/11 entered).`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, mobile: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, mobile: "" }));
    }
  };

  // ═════════════════════════════════════════════════════════
  // 2. SUBMISSION VALIDATION GUARD
  // ═════════════════════════════════════════════════════════
  const validateForm = () => {
    const errs = {};

    if (!customerName.trim() || customerName.trim().length < 3) {
      errs.name = "Full name is required (minimum 3 letters).";
    }

    const cleanMobile = customerMobile.replace(/\D/g, "");
    if (!cleanMobile) {
      errs.mobile = "Mobile number is required.";
    } else if (!/^03\d{9}$/.test(cleanMobile)) {
      errs.mobile = "Enter a valid 11-digit Pakistani mobile number starting with 03 (e.g. 03001234567).";
    }

    if (orderType === "delivery") {
      if (!houseNo.trim()) errs.houseNo = "House / Flat / Building No. is required.";
      if (!street.trim()) errs.street = "Street or Block name is required.";
      if (!area.trim()) errs.area = "Area or Landmark is required.";
    }

    if (orderType === "dine_in" && !tableNumber.trim()) {
      errs.tableNumber = "Table selection is required for Dine-in orders.";
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstErrMsg = Object.values(errs)[0];
      toast.error(firstErrMsg, { id: "validation-toast", duration: 3000 });
      return false;
    }

    return true;
  };

  // ═════════════════════════════════════════════════════════
  // 3. ORDER SUBMISSION HANDLER
  // ═════════════════════════════════════════════════════════
  const handleProceedOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty! Please add delicious meals first.");
      navigate("/menu");
      return;
    }

    if (!validateForm()) return;

    // Digital Payment Sandbox trigger
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

    // Direct COD Placement
    await executeOrderPlacement("Pending");
  };

  const executeOrderPlacement = async (paymentStatus = "Pending") => {
    setIsSubmitting(true);

    const fullAddress =
      orderType === "delivery"
        ? `House/Apt: ${houseNo}, Street: ${street}, Area: ${area}`
        : orderType === "dine_in"
        ? `Dine-In Table #${tableNumber}`
        : "Takeaway / Self-Pickup";

    const orderPayload = {
      orderType: orderType === "delivery" ? "Delivery" : orderType === "dine_in" ? "Dine-In" : "Takeaway",
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      customerAddress: fullAddress,
      house_no: houseNo,
      street: street,
      area: area,
      tableNumber: tableNumber,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      deliveryFee: deliveryFee,
      total: total,
    };

    try {
      const placed = await placeOrder(orderPayload);

      if (placed && placed.id) {
        sessionStorage.removeItem("orderMode");
        sessionStorage.removeItem("tableNumber");

        // Clean redirect to live tracking page
        navigate(`/track-order?orderId=${placed.id}`);
      }
    } catch (err) {
      console.error("Order submit exception:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
      setSandboxModalOpen(false);
    }
  };

  const handleSandboxPay = () => {
    setSandboxLoading(true);
    setTimeout(async () => {
      setSandboxLoading(false);
      toast.success("Payment Authorized Successfully!");
      await executeOrderPlacement("Paid");
    }, 1200);
  };

  // ═════════════════════════════════════════════════════════
  // 4. EMPTY CART GUARD
  // ═════════════════════════════════════════════════════════
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white px-4 py-16">
        <div className="text-center max-w-md w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <LuShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-['Oswald',sans-serif] font-black text-2xl uppercase text-neutral-900 dark:text-white">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
            You don't have any meals in your bucket to checkout.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-bold uppercase text-xs tracking-wider shadow-md transition-all no-underline"
          >
            <span>Browse Delicious Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white transition-colors duration-300 pb-20">
      {/* ── Page Header ── */}
      <section className="relative overflow-hidden pt-8 pb-8 sm:pt-12 sm:pb-10 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                <LuLock className="w-3.5 h-3.5 text-amber-500" />
                <span>SECURE ENCRYPTED CHECKOUT</span>
              </div>
              <h1 className="font-['Oswald',sans-serif] font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-neutral-950 dark:text-white m-0">
                FINALIZE YOUR{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  ORDER
                </span>
              </h1>
            </div>

            <div className="text-xs sm:text-sm font-bold text-neutral-500 dark:text-neutral-400 font-['Oswald',sans-serif] uppercase tracking-wider">
              Est. Arrival: <span className="text-amber-500 font-black">{expectedTimeStr}</span> (~{deliveryTimeMinutes} mins)
            </div>
          </div>
        </div>
      </section>

      {/* ── 2-Column Main Layout ── */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* ════ LEFT COLUMN: CUSTOMER & ORDER CONFIGURATION (7 Cols) ════ */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* 1. Order Type Selection */}
            <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                1. Order Fulfillment Method
              </h3>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                {[
                  {
                    id: "delivery",
                    label: "Delivery",
                    icon: <LuBike className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
                    sub: `+Rs ${baseDeliveryFee}`,
                  },
                  {
                    id: "takeaway",
                    label: "Takeaway",
                    icon: <LuShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
                    sub: "Free Pickup",
                  },
                  {
                    id: "dine_in",
                    label: "Dine-In",
                    icon: <LuUtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
                    sub: "Table Service",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOrderType(opt.id)}
                    className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 sm:gap-2 ${
                      orderType === opt.id
                        ? "bg-amber-400/10 dark:bg-amber-400/15 border-amber-500 text-neutral-950 dark:text-white font-bold ring-2 ring-amber-400/30 shadow-xs"
                        : "bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-amber-400"
                    }`}
                  >
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-xs">
                      {opt.icon}
                    </div>
                    <span className="font-['Oswald',sans-serif] text-xs sm:text-sm uppercase tracking-wide truncate w-full">
                      {opt.label}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 truncate w-full">
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Customer Contact Details */}
            <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                2. Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={handleNameChange}
                    placeholder="e.g. Faiz Ul Hassan"
                    className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
                      errors.name ? "border-red-500 bg-red-50/10 ring-1 ring-red-500" : "border-gray-200 dark:border-neutral-700"
                    }`}
                  />
                  {errors.name ? (
                    <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                      <LuCircleAlert className="w-3 h-3 shrink-0" />
                      {errors.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400">Letters and spaces only</span>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Phone Number (11 Digits) *
                  </label>
                  <input
                    type="tel"
                    maxLength={11}
                    value={customerMobile}
                    onChange={handleMobileChange}
                    placeholder="e.g. 0300 1234567"
                    className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors font-mono ${
                      errors.mobile ? "border-red-500 bg-red-50/10 ring-1 ring-red-500" : "border-gray-200 dark:border-neutral-700"
                    }`}
                  />
                  {errors.mobile ? (
                    <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                      <LuCircleAlert className="w-3 h-3 shrink-0" />
                      {errors.mobile}
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400">Format: 03XXXXXXXXX (11 digits)</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Address Details / Dine-in Table */}
            {orderType === "delivery" && (
              <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
                <h3 className="font-['Oswald',sans-serif] font-bold text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  3. Delivery Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      House / Flat / Building No. *
                    </label>
                    <input
                      type="text"
                      value={houseNo}
                      onChange={(e) => {
                        setHouseNo(e.target.value);
                        if (errors.houseNo) setErrors({ ...errors, houseNo: "" });
                      }}
                      placeholder="e.g. House 42, Floor 2"
                      className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
                        errors.houseNo ? "border-red-500" : "border-gray-200 dark:border-neutral-700"
                      }`}
                    />
                    {errors.houseNo && <span className="text-xs text-red-500">{errors.houseNo}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Street / Block *
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => {
                        setStreet(e.target.value);
                        if (errors.street) setErrors({ ...errors, street: "" });
                      }}
                      placeholder="e.g. Street 9, Block B"
                      className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
                        errors.street ? "border-red-500" : "border-gray-200 dark:border-neutral-700"
                      }`}
                    />
                    {errors.street && <span className="text-xs text-red-500">{errors.street}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Area / Landmark *
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      if (errors.area) setErrors({ ...errors, area: "" });
                    }}
                    placeholder="e.g. Gulberg III near City Mall"
                    className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
                      errors.area ? "border-red-500" : "border-gray-200 dark:border-neutral-700"
                    }`}
                  />
                  {errors.area && <span className="text-xs text-red-500">{errors.area}</span>}
                </div>
              </div>
            )}

            {orderType === "dine_in" && (
              <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
                <h3 className="font-['Oswald',sans-serif] font-bold text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  3. Select Dine-In Table
                </h3>

                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LuQrCode className="w-4 h-4 text-amber-500" />
                    <span>Table Number / QR Code *</span>
                  </label>

                  {availableTables.length > 0 ? (
                    <select
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(e.target.value);
                        if (errors.tableNumber) setErrors({ ...errors, tableNumber: "" });
                      }}
                      className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                    >
                      {availableTables.map((t) => (
                        <option key={t.id} value={t.table_name || t.id}>
                          {t.table_name || `Table #${t.id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(e.target.value);
                        if (errors.tableNumber) setErrors({ ...errors, tableNumber: "" });
                      }}
                      placeholder="e.g. Table 4 or T-02"
                      className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 ${
                        errors.tableNumber ? "border-red-500" : "border-gray-200 dark:border-neutral-700"
                      }`}
                    />
                  )}
                  {errors.tableNumber && <span className="text-xs text-red-500">{errors.tableNumber}</span>}
                </div>
              </div>
            )}

            {/* 4. Payment Method Selection */}
            <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-['Oswald',sans-serif] font-bold text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                4. Select Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: "Cash on Delivery",
                    name: "Cash on Delivery",
                    desc: "Pay in cash when rider arrives at your doorstep",
                    icon: <LuBanknote className="w-5 h-5 text-emerald-500" />,
                  },
                  {
                    id: "JazzCash",
                    name: "JazzCash (Sandbox)",
                    desc: "Instant digital payment with JazzCash mobile wallet",
                    icon: <LuSmartphone className="w-5 h-5 text-red-500" />,
                  },
                  {
                    id: "EasyPaisa",
                    name: "EasyPaisa (Sandbox)",
                    desc: "Direct payment with EasyPaisa mobile account",
                    icon: <LuSmartphone className="w-5 h-5 text-emerald-500" />,
                  },
                  {
                    id: "Credit / Debit Card",
                    name: "Debit / Credit Card (Sandbox)",
                    desc: "Visa / Mastercard 256-bit encrypted transaction",
                    icon: <LuCreditCard className="w-5 h-5 text-blue-500" />,
                  },
                ].map((pm) => (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      paymentMethod === pm.id
                        ? "bg-amber-400/10 dark:bg-amber-400/15 border-amber-500 ring-2 ring-amber-400/30"
                        : "bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-neutral-800 hover:border-amber-400"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-xs">
                      {pm.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-['Oswald',sans-serif] font-bold text-sm uppercase text-neutral-900 dark:text-white">
                          {pm.name}
                        </span>
                        {paymentMethod === pm.id && (
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center">
                            <LuCheck className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed m-0">
                        {pm.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════ RIGHT COLUMN: ORDER SUMMARY CARD (5 Cols) ════ */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-sm backdrop-blur-md space-y-6">
              <h2 className="font-['Oswald',sans-serif] font-black text-xl uppercase tracking-wider text-neutral-900 dark:text-white m-0 pb-3 border-b border-gray-100 dark:border-neutral-800">
                Order Items ({cartItems.length})
              </h2>

              {/* Items Mini List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-sidebar-scroll">
                {cartItems.map((item) => (
                  <div key={item.cartId || item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-bold text-amber-500 font-['Oswald',sans-serif] shrink-0">
                        {item.qty || 1}x
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {item.name || item.title}
                        {item.size && item.size !== "Regular" && ` (${item.size})`}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white font-['Oswald',sans-serif] shrink-0">
                      Rs {(parseFloat(item.price || 0) * (item.qty || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    Rs {subTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {deliveryFee > 0 ? `Rs ${deliveryFee}` : "FREE"}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
                  <span className="font-['Oswald',sans-serif] font-bold text-base uppercase text-neutral-900 dark:text-white">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black font-['Oswald',sans-serif] text-amber-500">
                    Rs {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProceedOrder}
                className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-[0.98] disabled:opacity-50 text-neutral-950 font-['Oswald',sans-serif] font-black text-base uppercase tracking-wider shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span>{isSubmitting ? "Placing Order..." : `Place Order (Rs ${total.toLocaleString()})`}</span>
                <LuArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                <LuShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Live Kitchen Dispatch & SMS Notification</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ═════════════════════════════════════════════════════════
          5. NATIVE DIGITAL PAYMENT SANDBOX MODAL (With Lucide Icons)
      ═════════════════════════════════════════════════════════ */}
      {sandboxModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSandboxModalOpen(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-white border-none bg-transparent cursor-pointer p-1"
            >
              <LuX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="p-3 rounded-2xl bg-amber-400/15 text-amber-500">
                <LuSmartphone className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-['Oswald',sans-serif] font-bold text-xl uppercase text-neutral-900 dark:text-white m-0">
                  {sandboxMethod === "jazzcash"
                    ? "JazzCash Sandbox"
                    : sandboxMethod === "easypaisa"
                    ? "EasyPaisa Sandbox"
                    : "Card Gateway Sandbox"}
                </h3>
                <span className="text-xs text-amber-500 font-semibold">Test Mode Active</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-neutral-800 border border-amber-200 dark:border-neutral-700 mb-5 text-center">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">Amount to Authorize</span>
              <div className="text-2xl font-black font-['Oswald',sans-serif] text-neutral-900 dark:text-white">
                Rs {total.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  {sandboxMethod === "card" ? "Card Number" : "Mobile Wallet Account"}
                </label>
                <input
                  type="text"
                  value={sandboxInput1}
                  onChange={(e) => setSandboxInput1(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm mt-1 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  {sandboxMethod === "card" ? "CVV / Expiry" : "Mock MPIN"}
                </label>
                <input
                  type="password"
                  value={sandboxInput2}
                  onChange={(e) => setSandboxInput2(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm mt-1 text-neutral-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={sandboxLoading}
              onClick={handleSandboxPay}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black uppercase text-sm tracking-wider shadow-md active:scale-95 transition-all border-none cursor-pointer"
            >
              {sandboxLoading ? "Authorizing Payment..." : `Authorize Rs ${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;