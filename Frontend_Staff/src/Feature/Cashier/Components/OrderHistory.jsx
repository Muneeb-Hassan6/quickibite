import { API_BASE } from '../../../utils/apiHelper';
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
        `${API_BASE}/get_orders.php?type=cashier`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        return data
          .map((o) => {
            const rawItems = Array.isArray(o.items) && o.items.length > 0
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
              payment_status: o.payment_status || o.status || "Pending",
              payment_method: o.payment_method || "Cash",
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
