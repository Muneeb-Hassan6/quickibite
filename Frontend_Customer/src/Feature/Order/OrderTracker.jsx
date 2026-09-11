import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaUtensils,
  FaMotorcycle,
  FaShoppingBag,
  FaBoxOpen,
} from "react-icons/fa";
import OrderTrackerHeader from "./Components/OrderTrackerHeader";
import OrderTrackerTimeline from "./Components/OrderTrackerTimeline";
import OrderTrackerReceiptSummary from "./Components/OrderTrackerReceiptSummary";
import OrderTrackerRiderCard from "./Components/OrderTrackerRiderCard";
import { API_BASE } from "../../config/api";

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
      try {
        const response = await fetch(`${API_BASE}/get_settings.php`);
        const result = await response.json();
        return result && result.success ? result.data : {};
      } catch (err) {
        console.warn("Could not fetch store settings in OrderTracker, using defaults:", err);
        return {};
      }
    },
    staleTime: 60000,
  });

  const restaurantPhone =
    storeSettings.contact_phone || storeSettings.restaurant_phone || "+92 300 1234567";

  // Fetch live order status from backend
  const fetchOrderDetails = async (id, isManual = false) => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    if (isManual) setIsRefreshing(true);

    try {
      const response = await fetch(
        `${API_BASE}/get_order_details.php?id=${id}`
      );
      const data = await response.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        // Fallback check in track_public_orders.php
        const publicRes = await fetch(
          `${API_BASE}/track_public_orders.php`
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
      {/* 1. Page Header & Quick Search */}
      <OrderTrackerHeader
        inputSearchId={inputSearchId}
        setInputSearchId={setInputSearchId}
        handleSearchSubmit={handleSearchSubmit}
      />

      {/* 2. Main Tracker Canvas */}
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
          /* Active Live Order Display */
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Timeline Pipeline Card */}
            <OrderTrackerTimeline
              order={order}
              searchId={searchId}
              currentStep={currentStep}
              steps={steps}
              isRefreshing={isRefreshing}
              fetchOrderDetails={fetchOrderDetails}
            />

            {/* Order Details & Receipt Summary */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
              <OrderTrackerReceiptSummary order={order} />
              <OrderTrackerRiderCard
                order={order}
                restaurantPhone={restaurantPhone}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTracker;