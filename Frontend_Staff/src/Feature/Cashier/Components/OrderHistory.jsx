import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Atomic Subcomponents
import HistoryFilterBar from "./History/HistoryFilterBar";
import OrderHistoryTable from "./History/OrderHistoryTable";

export default function OrderHistory({
  orders: propOrders,
  onPrintReceipt,
  onViewOrder,
  onPrintClick,
  onViewClick,
  onTogglePaymentStatus,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const printHandler = onPrintReceipt || onPrintClick;
  const viewHandler = onViewOrder || onViewClick;

  // Live query from DB if prop is empty
  const { data: dbOrders = [] } = useQuery({
    queryKey: ["cashier_orders"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=cashier`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        return data
          .map((o) => ({
            id: o.id,
            customer_name: o.customer_name || "Walk-in",
            table_no: o.table_number || "",
            order_type:
              o.order_type ||
              (o.table_number?.includes("Takeaway")
                ? "Takeaway"
                : o.table_number?.includes("Delivery")
                ? "Delivery"
                : "Dine-In"),
            total_amount: parseFloat(o.total || o.total_amount || 0),
            payment_status: o.payment_status || o.status || "Pending",
            created_at: o.time || o.created_at || "Just now",
            items:
              typeof o.cart === "string"
                ? JSON.parse(o.cart || "[]")
                : o.cart || [],
          }))
          .sort((a, b) => b.id - a.id);
      }
      return [];
    },
    refetchInterval: 5000,
  });

  const orders = propOrders && propOrders.length > 0 ? propOrders : dbOrders;
  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = safeOrders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (order.id?.toString() || "").includes(term) ||
      (order.customer_name?.toLowerCase() || "").includes(term) ||
      (order.table_no?.toString() || "").includes(term);

    const matchesType =
      filterType === "ALL" ||
      order.order_type?.toUpperCase() === filterType ||
      (filterType === "DINE-IN" &&
        (order.order_type?.toUpperCase().includes("DINE") ||
          (!order.order_type?.toUpperCase().includes("TAKEAWAY") &&
            !order.order_type?.toUpperCase().includes("DELIVERY"))));

    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full min-h-screen p-3 sm:p-5 space-y-4 max-w-[1400px] mx-auto bg-transparent font-sans">
      {/* 1. Title Header */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block shrink-0" />
        <h1 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-900 dark:text-white uppercase font-mono m-0">
          TRANSACTION HISTORY
        </h1>
      </div>

      {/* 2. Filter Pills & Search Input */}
      <HistoryFilterBar
        filterType={filterType}
        setFilterType={setFilterType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* 3. Responsive Transaction Table */}
      <OrderHistoryTable
        filteredOrders={filteredOrders}
        printHandler={printHandler}
        viewHandler={viewHandler}
      />
    </div>
  );
}
