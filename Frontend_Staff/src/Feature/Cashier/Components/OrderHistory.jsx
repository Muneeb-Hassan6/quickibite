import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import {
  FaMoneyBillWave,
  FaMotorcycle,
  FaCheckDouble,
  FaExclamationCircle,
} from "react-icons/fa";

// Atomic Subcomponents
import HistoryFilterBar from "./History/HistoryFilterBar";
import OrderHistoryTable from "./History/OrderHistoryTable";
import RiderReconciliationModal from "./History/RiderReconciliationModal";

export default function OrderHistory({
  orders: propOrders,
  onPrintReceipt,
  onViewOrder,
  onPrintClick,
  onViewClick,
  onTogglePaymentStatus,
}) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);

  const printHandler = onPrintReceipt || onPrintClick;
  const viewHandler = onViewOrder || onViewClick;

  // Real-time socket listener for payment and order updates
  useEffect(() => {
    let socket;
    try {
      socket = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ["websocket", "polling"],
      });

      const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["cashier_orders"] });
      };

      socket.on("payment_status_updated", handleRefresh);
      socket.on("refresh_kitchen", handleRefresh);
      socket.on("refresh_orders", handleRefresh);
    } catch (err) {
      console.warn("Socket connection failed in OrderHistory:", err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [queryClient]);

  // Live query from DB if prop is empty
  const { data: dbOrders = [], isLoading } = useQuery({
    queryKey: ["cashier_orders"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=cashier`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        return data
          .map((o) => {
            const rawItems =
              Array.isArray(o.items) && o.items.length > 0
                ? o.items
                : typeof o.cart === "string"
                ? JSON.parse(o.cart || "[]")
                : o.cart || [];

            const parsedItems = Array.isArray(rawItems)
              ? rawItems.map((it) => ({
                  ...it,
                  name: it.title || it.name || "Item",
                  title: it.title || it.name || "Item",
                  qty: parseInt(it.qty || it.quantity || 1, 10),
                  price: parseFloat(it.price || 0),
                }))
              : [];

            const resolvedType =
              o.order_mode ||
              o.order_type ||
              (o.table_number?.toLowerCase().includes("takeaway")
                ? "Takeaway"
                : o.table_number?.toLowerCase().includes("delivery")
                ? "Delivery"
                : "Dine-In");

            const resolvedCustomer =
              o.customer_name ||
              o.customer ||
              o.guest_name ||
              "Walk-In Customer";

            return {
              ...o,
              id: o.id,
              customer_name: resolvedCustomer,
              customerName: resolvedCustomer,
              customer_mobile: o.customer_mobile || "",
              customer_address: o.customer_address || "",
              table_no: o.table_number || "",
              table_number: o.table_number || "",
              table: o.table_number || "",
              order_type: resolvedType,
              order_mode: resolvedType,
              type: resolvedType,
              subtotal: parseFloat(o.subtotal || 0),
              tax_amount: parseFloat(o.tax_amount || 0),
              delivery_fee: parseFloat(o.delivery_fee || 0),
              rider_tip: parseFloat(o.rider_tip || 0),
              discount_amount: parseFloat(o.discount_amount || 0),
              coupon_code: o.coupon_code || "",
              total_amount: parseFloat(o.total || o.total_amount || 0),
              total: parseFloat(o.total || o.total_amount || 0),
              payment_status: o.payment_status || "Pending",
              payment_method: o.payment_method || "Cash",
              rider_id: o.rider_id || null,
              rider_name: o.rider_name || "",
              rider_phone: o.rider_phone || "",
              time: o.time || o.created_at || "Just now",
              date: o.date || "",
              created_at: o.time || o.created_at || "Just now",
              items: parsedItems,
              cart: parsedItems,
            };
          })
          .sort((a, b) => b.id - a.id);
      }
      return [];
    },
    refetchInterval: 5000,
  });

  const orders = propOrders && propOrders.length > 0 ? propOrders : dbOrders;
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Calculate Rider COD pending totals
  const codStats = useMemo(() => {
    let pendingAmount = 0;
    let pendingCount = 0;
    const riderSet = new Set();

    safeOrders.forEach((order) => {
      const isDelivery =
        order.order_type?.toLowerCase().includes("delivery") ||
        order.type?.toLowerCase().includes("delivery") ||
        order.order_mode?.toLowerCase().includes("delivery");

      const pMethod = (order.payment_method || "").toLowerCase();
      const isCod =
        pMethod === "cod" ||
        pMethod.includes("delivery") ||
        pMethod === "cash" ||
        pMethod === "";

      const pStatus = (order.payment_status || "").toLowerCase();
      const isPending = pStatus !== "paid" && pStatus !== "completed";

      if (isDelivery && isCod && isPending) {
        pendingCount += 1;
        pendingAmount += parseFloat(order.total || order.total_amount || 0);
        if (order.rider_id) riderSet.add(order.rider_id);
      }
    });

    return {
      pendingAmount,
      pendingCount,
      riderCount: riderSet.size,
    };
  }, [safeOrders]);

  // Handle single order payment status update
  const handleUpdatePaymentStatus = async (orderId, newStatus, order) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_payment_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: orderId, status: newStatus }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Invalidate react queries so UI reloads fresh state
        queryClient.invalidateQueries({ queryKey: ["cashier_orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin_orders"] });

        // Emit socket notification
        try {
          const socket = io(import.meta.env.VITE_SOCKET_URL, {
            transports: ["websocket"],
            reconnection: false,
          });
          socket.on("connect", () => {
            socket.emit("payment_status_updated", { id: orderId, status: newStatus });
            setTimeout(() => socket.disconnect(), 1000);
          });
        } catch (socketErr) {
          console.warn("Socket broadcast failed:", socketErr);
        }

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: document.documentElement.classList.contains("dark") ? "#18181b" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f4f4f5" : "#18181b",
        });

        Toast.fire({
          icon: newStatus === "Paid" ? "success" : "info",
          title: `Order #${orderId} marked as ${newStatus}`,
        });

        if (onTogglePaymentStatus) {
          onTogglePaymentStatus(orderId, newStatus);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: result.message || "Could not update payment status.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Could not reach server to update payment status.",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle batch reconciliation for a rider
  const handleBatchReconcile = async (orderIds, status, riderName, totalAmount) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_payment_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_ids: orderIds, status }),
        }
      );

      const result = await response.json();

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["cashier_orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin_orders"] });

        // Emit socket notification
        try {
          const socket = io(import.meta.env.VITE_SOCKET_URL, {
            transports: ["websocket"],
            reconnection: false,
          });
          socket.on("connect", () => {
            socket.emit("payment_status_updated", { order_ids: orderIds, status });
            setTimeout(() => socket.disconnect(), 1000);
          });
        } catch (socketErr) {
          console.warn("Socket broadcast failed:", socketErr);
        }

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: document.documentElement.classList.contains("dark") ? "#18181b" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f4f4f5" : "#18181b",
        });

        Toast.fire({
          icon: "success",
          title: `Reconciled Rs. ${totalAmount.toFixed(2)} from ${riderName}!`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Reconciliation Failed",
          text: result.message || "Failed to reconcile orders.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Could not complete rider reconciliation.",
      });
    }
  };

  // Filter logic
  const filteredOrders = safeOrders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (order.id?.toString() || "").includes(term) ||
      (order.customer_name?.toLowerCase() || "").includes(term) ||
      (order.table_no?.toString() || "").includes(term) ||
      (order.rider_name?.toLowerCase() || "").includes(term);

    const matchesType =
      filterType === "ALL" ||
      order.order_type?.toUpperCase() === filterType ||
      (filterType === "DINE-IN" &&
        (order.order_type?.toUpperCase().includes("DINE") ||
          (!order.order_type?.toUpperCase().includes("TAKEAWAY") &&
            !order.order_type?.toUpperCase().includes("DELIVERY"))));

    const pStatus = (order.payment_status || "").toLowerCase();
    const isPaid = pStatus === "paid" || pStatus === "completed";

    const isDelivery =
      order.order_type?.toLowerCase().includes("delivery") ||
      order.type?.toLowerCase().includes("delivery") ||
      order.order_mode?.toLowerCase().includes("delivery");

    const pMethod = (order.payment_method || "").toLowerCase();
    const isCod =
      pMethod === "cod" ||
      pMethod.includes("delivery") ||
      pMethod === "cash" ||
      pMethod === "";

    let matchesPayment = true;
    if (paymentFilter === "PAID") {
      matchesPayment = isPaid;
    } else if (paymentFilter === "PENDING") {
      matchesPayment = !isPaid;
    } else if (paymentFilter === "COD_PENDING") {
      matchesPayment = isDelivery && isCod && !isPaid;
    }

    return matchesSearch && matchesType && matchesPayment;
  });

  return (
    <div className="w-full min-h-screen p-3 sm:p-5 space-y-4 max-w-[1400px] mx-auto bg-transparent font-sans">
      {/* 1. Title Header & Rider Reconciliation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block shrink-0" />
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-900 dark:text-white uppercase font-mono m-0">
            TRANSACTION HISTORY
          </h1>
        </div>

        {/* Rider COD Reconciliation Trigger Button */}
        <button
          type="button"
          onClick={() => setIsReconciliationModalOpen(true)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border shadow-sm active:scale-95 ${
            codStats.pendingAmount > 0
              ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 shadow-amber-500/20"
              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40"
          }`}
        >
          <FaMotorcycle className="w-4 h-4" />
          <span>Rider COD Reconciliation</span>
          {codStats.pendingCount > 0 && (
            <span className="min-w-[20px] h-5 px-1 rounded-full bg-zinc-950 text-amber-400 text-[10px] font-black inline-flex items-center justify-center font-mono ml-0.5">
              {codStats.pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Rider Pending COD Alert Banner (if pending cash exists) */}
      {codStats.pendingAmount > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <FaMoneyBillWave className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Rider Cash Collection Pending</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                  {codStats.pendingCount} delivery order{codStats.pendingCount > 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Total cash waiting with dispatch riders:{" "}
                <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                  Rs. {codStats.pendingAmount.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReconciliationModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all border-none cursor-pointer shadow-xs active:scale-95"
          >
            <FaCheckDouble className="w-3.5 h-3.5" />
            <span>Reconcile Cash</span>
          </button>
        </div>
      )}

      {/* 3. Filter Pills & Search Input */}
      <HistoryFilterBar
        filterType={filterType}
        setFilterType={setFilterType}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* 4. Responsive Transaction Table */}
      <OrderHistoryTable
        filteredOrders={filteredOrders}
        printHandler={printHandler}
        viewHandler={viewHandler}
        onUpdateStatus={handleUpdatePaymentStatus}
        updatingOrderId={updatingOrderId}
      />

      {/* 5. Rider COD Reconciliation Modal */}
      <RiderReconciliationModal
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        orders={safeOrders}
        onUpdateStatus={handleUpdatePaymentStatus}
        onBatchReconcile={handleBatchReconcile}
      />
    </div>
  );
}
