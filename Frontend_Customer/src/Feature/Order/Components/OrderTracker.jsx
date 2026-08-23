import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaClock,
  FaUtensils,
  FaMotorcycle,
  FaBoxOpen,
  FaSearch,
  FaSync,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaTimes,
  FaShoppingBag,
} from "react-icons/fa";
import { resolveImageUrl } from "../../../utils/imageOptimizer";

const OrderTracker = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get("orderId") || searchParams.get("id") || "";
  const storedActiveId = localStorage.getItem("activeOrderId") || "";

  const [searchId, setSearchId] = useState(queryOrderId || storedActiveId);
  const [inputSearchId, setInputSearchId] = useState(queryOrderId || storedActiveId);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch store contact details for helpline
  const { data: storeSettings = {} } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  const restaurantPhone = storeSettings.contact_phone || storeSettings.restaurant_phone || "+92 300 1234567";

  // Fetch live order status from backend
  const fetchOrderDetails = async (id, isManual = false) => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    if (isManual) setIsRefreshing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_order_details.php?id=${id}`
      );
      const data = await response.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        // Fallback check in track_public_orders.php
        const publicRes = await fetch(
          `${import.meta.env.VITE_API_BASE}/track_public_orders.php`
        );
        const publicList = await publicRes.json();
        if (Array.isArray(publicList)) {
          const found = publicList.find((o) => String(o.id) === String(id));
          if (found) {
            setOrder(found);
          }
        }
      }
    } catch (err) {
      console.error("Order tracking error:", err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (queryOrderId) {
      setSearchId(queryOrderId);
      setInputSearchId(queryOrderId);
    }
  }, [queryOrderId]);

  useEffect(() => {
    if (searchId) {
      fetchOrderDetails(searchId);

      // Auto-poll every 5 seconds for live status updates
      const interval = setInterval(() => {
        fetchOrderDetails(searchId);
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [searchId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputSearchId.trim()) {
      setSearchId(inputSearchId.trim());
      navigate(`/track-order?orderId=${inputSearchId.trim()}`);
    }
  };

  // ═════════════════════════════════════════════════════════
  // 4-STEP PROGRESS CALCULATION
  // ═════════════════════════════════════════════════════════
  const getStepIndex = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("delivered") || s.includes("completed")) return 4;
    if (s.includes("dispatch") || s.includes("way") || s.includes("ready") || s.includes("pickup")) return 3;
    if (s.includes("prepar") || s.includes("cook") || s.includes("kitchen")) return 2;
    if (s.includes("decline") || s.includes("cancel")) return -1;
    return 1; // Default Confirmed / Pending
  };

  const currentStep = order ? getStepIndex(order.status) : 1;

  const steps = [
    { num: 1, title: "Order Confirmed", icon: <FaCheckCircle />, desc: "Received by kitchen" },
    { num: 2, title: "Preparing in Kitchen", icon: <FaUtensils />, desc: "Freshly cooked to order" },
    {
      num: 3,
      title: order?.order_type === "Takeaway" ? "Ready for Pickup" : "Out for Delivery",
      icon: <FaMotorcycle />,
      desc: order?.order_type === "Takeaway" ? "Waiting at store counter" : "Rider en route to you",
    },
    { num: 4, title: "Delivered & Enjoy!", icon: <FaShoppingBag />, desc: "Order completed" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white transition-colors duration-300 pb-20">
      {/* ── Page Header ── */}
      <section className="relative overflow-hidden pt-6 pb-6 sm:pt-10 sm:pb-8 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1.5">
            <FaClock className="text-[10px]" />
            <span>REAL-TIME STATUS</span>
          </div>
          <h1 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-neutral-950 dark:text-white m-0">
            TRACK YOUR{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              FEAST
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-lg">
            Monitor preparation progress and live delivery dispatch in real time.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-4 sm:mt-5 max-w-md">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputSearchId}
                onChange={(e) => setInputSearchId(e.target.value)}
                placeholder="Enter Order ID (e.g. 1042)..."
                className="w-full pl-9 pr-24 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs transition-all font-mono font-bold"
              />
              <FaSearch className="absolute left-3.5 text-neutral-400 text-xs pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer active:scale-95"
              >
                Track
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Main Tracker Canvas ── */}
      <main className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-['Oswald',sans-serif] font-bold text-sm uppercase tracking-wider text-neutral-500">
              Connecting to Kitchen Dispatch...
            </span>
          </div>
        ) : !order ? (
          /* Empty / Not Found State */
          <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <FaBoxOpen className="text-2xl" />
            </div>
            <h3 className="font-['Oswald',sans-serif] font-black text-xl uppercase text-neutral-900 dark:text-white mb-1">
              No Active Order Found
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
              {searchId
                ? `We couldn't find an active order with ID #${searchId}. Please verify your order number and try again.`
                : "Enter your Order ID above or browse our menu to place your first hot order."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 border-none cursor-pointer"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          /* ════ ACTIVE LIVE ORDER DISPLAY ════ */
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* ════ 1. TIMELINE PIPELINE CARD ════ */}
            <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-gray-100 dark:border-neutral-800">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Tracking Reference</span>
                  <h2 className="font-['Oswald',sans-serif] font-black text-xl sm:text-2xl uppercase text-neutral-900 dark:text-white m-0 mt-0.5">
                    Order #{order.id}
                  </h2>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider">
                    Status: {order.status || "Pending"}
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchOrderDetails(searchId, true)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-amber-500 transition-all border-none cursor-pointer"
                    title="Refresh Status"
                    aria-label="Refresh Status"
                  >
                    <FaSync className={`text-xs ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Step Timeline Graphic: Vertical on Mobile (<640px), Horizontal on Desktop (sm+) */}
              <div className="pt-6 sm:pt-8 pb-3">
                {/* Mobile Vertical Stepper (< 640px) */}
                <div className="sm:hidden space-y-4 relative pl-2">
                  <div className="absolute left-[26px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-neutral-800 pointer-events-none" />
                  {steps.map((step) => {
                    const isCompleted = currentStep >= step.num;
                    const isCurrent = currentStep === step.num;

                    return (
                      <div
                        key={step.num}
                        className={`flex items-start gap-3.5 relative z-10 transition-all ${
                          isCompleted ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all shrink-0 shadow-xs ${
                            isCurrent
                              ? "bg-amber-400 text-neutral-950 ring-4 ring-amber-400/25 shadow-md scale-105"
                              : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-100 dark:bg-neutral-800 text-neutral-400 border border-gray-200 dark:border-neutral-700"
                          }`}
                        >
                          {step.icon}
                        </div>

                        <div className="flex-1 pt-0.5">
                          <h4 className="font-['Oswald',sans-serif] font-bold text-sm uppercase text-neutral-900 dark:text-white m-0">
                            {step.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 m-0 leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Horizontal Stepper (>= 640px) */}
                <div className="hidden sm:grid sm:grid-cols-4 gap-4 md:gap-6 relative">
                  {steps.map((step) => {
                    const isCompleted = currentStep >= step.num;
                    const isCurrent = currentStep === step.num;

                    return (
                      <div
                        key={step.num}
                        className={`flex flex-col items-center text-center gap-2.5 transition-all ${
                          isCompleted ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        <div
                          className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-base md:text-lg transition-all shrink-0 ${
                            isCurrent
                              ? "bg-amber-400 text-neutral-950 ring-4 ring-amber-400/25 shadow-lg scale-110"
                              : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-100 dark:bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {step.icon}
                        </div>

                        <div>
                          <h4 className="font-['Oswald',sans-serif] font-bold text-sm md:text-base uppercase text-neutral-900 dark:text-white m-0">
                            {step.title}
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 m-0 leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ════ 2. ORDER DETAILS & RECEIPT SUMMARY ════ */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* Order Items Breakdown (7 Cols) */}
              <div className="md:col-span-7 bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3.5">
                <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 pb-2.5 border-b border-gray-100 dark:border-neutral-800">
                  Itemized Order Receipt
                </h3>

                <div className="space-y-2.5">
                  {(order.cart || []).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 flex justify-between items-start gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm font-['Oswald',sans-serif] block truncate">
                          {item.qty || 1}x {item.name || item.title}
                        </span>
                        {item.size && item.size !== "Regular" && (
                          <span className="block text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                            Size: {item.size}
                          </span>
                        )}
                        {item.note && (
                          <span className="block text-amber-600 dark:text-amber-400 text-[11px]">
                            Note: "{item.note}"
                          </span>
                        )}
                      </div>

                      <span className="font-bold font-['Oswald',sans-serif] text-neutral-900 dark:text-white text-xs sm:text-sm shrink-0">
                        Rs {(parseFloat(item.price || 0) * (item.qty || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
                  <span className="font-['Oswald',sans-serif] font-bold text-sm sm:text-base uppercase text-neutral-900 dark:text-white">
                    Grand Total
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] text-amber-500 dark:text-amber-400">
                    Rs {parseFloat(order.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Delivery & Customer Info Card (5 Cols) */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3.5">
                  <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 pb-2.5 border-b border-gray-100 dark:border-neutral-800">
                    Delivery Coordinates
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-neutral-400 uppercase font-semibold">Recipient:</span>
                      <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm m-0 mt-0.5">
                        {order.customer_name || "Guest Customer"}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-400 uppercase font-semibold">Contact:</span>
                      <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm m-0 mt-0.5">
                        {order.customer_mobile || "N/A"}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-400 uppercase font-semibold">Fulfillment Type:</span>
                      <p className="font-bold text-amber-500 dark:text-amber-400 uppercase text-xs sm:text-sm m-0 mt-0.5">
                        {order.order_type || "Delivery"}
                      </p>
                    </div>

                    {order.customer_address && (
                      <div>
                        <span className="text-neutral-400 uppercase font-semibold">Address / Notes:</span>
                        <p className="font-medium text-neutral-700 dark:text-neutral-300 m-0 mt-0.5 leading-relaxed">
                          {order.customer_address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Need Help Helpline Card */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                  <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
                    Need Help With Your Order?
                  </span>
                  <a
                    href={`tel:${restaurantPhone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all no-underline shadow-xs active:scale-95"
                  >
                    <FaPhoneAlt className="text-[10px]" />
                    <span>Call Support ({restaurantPhone})</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTracker;