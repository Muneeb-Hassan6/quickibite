import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components Import
import OrderFilterBar from "./Components/OrderFilterBar";
import OrdersTable from "./Components/OrdersTable";
import UpdateStatusModal from "./Components/UpdateStatusModal";
import OrderReceiptModal from "./Components/OrderReceiptModal";

const OrdersManager = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrderToEdit, setSelectedOrderToEdit] = useState(null);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);

  // 🔥 2. FETCH LIVE ORDERS FROM DATABASE (React Query)
  const { data: orders = [] } = useQuery({
    queryKey: ['admin_orders', 'all'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=all`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        return data.map((dbOrder) => ({
          id: `#${dbOrder.id}`,
          rawId: dbOrder.id,
          customerName: dbOrder.customer_name || "N/A",
          type: dbOrder.order_type
            ? dbOrder.order_type.replace("_", " ").toUpperCase()
            : "DELIVERY",

          items: (() => {
            let itemsArray = [];
            if (dbOrder.items) {
              if (typeof dbOrder.items === "string") {
                try {
                  itemsArray = JSON.parse(dbOrder.items);
                } catch (e) {}
              } else if (Array.isArray(dbOrder.items)) {
                itemsArray = dbOrder.items;
              }
            }
            return Array.isArray(itemsArray)
              ? itemsArray.map((i) => ({
                  name: i ? (i.name || i.title || "") : "",
                  qty: i ? parseInt(i.qty || 0) : 0,
                  price: i ? parseFloat(i.price || 0) : 0,
                }))
              : [];
          })(),

          total: parseFloat(dbOrder.total || 0),
          status: (dbOrder.status || "").toLowerCase(),
          time: dbOrder.time,
          date: dbOrder.date,
        }));
      }
      return [];
    },
    refetchInterval: 5000, // Automatically refetch every 5 seconds
  });

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  const handleSaveStatus = async (orderId, newStatus) => {
    const numericId = orderId.toString().replace("#", "");
    const backendStatus =
      newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    // Optimistic Update
    queryClient.setQueryData(['admin_orders', 'all'], (old) =>
      old ? old.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)) : old
    );
    setSelectedOrderToEdit(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_order_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: numericId, status: backendStatus }),
        }
      );

      if (response.ok) {
        toast.success(`Order ${orderId} Status Updated!`, {
          style: { background: "#333", color: "#fff" },
        });
      } else {
        toast.error("Failed to update status in Database!");
        queryClient.invalidateQueries({ queryKey: ['admin_orders', 'all'] });
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      queryClient.invalidateQueries({ queryKey: ['admin_orders', 'all'] });
    }
  };

  return (
    <div className="bg-transparent p-0 border-none w-full animate-slide-up">
      <div className="text-[1.25rem] font-bold mb-[0.938rem] border-l-4 border-red-500 pl-[0.625rem] text-[var(--admin-text)]">Orders Management</div>

      <OrderFilterBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <OrdersTable
        orders={filteredOrders}
        onEditClick={(order) => setSelectedOrderToEdit(order)}
        onViewClick={(order) => setSelectedOrderToView(order)}
      />

      <UpdateStatusModal
        order={selectedOrderToEdit}
        onClose={() => setSelectedOrderToEdit(null)}
        onSave={handleSaveStatus}
      />

      <OrderReceiptModal
        isOpen={selectedOrderToView !== null}
        order={selectedOrderToView}
        onClose={() => setSelectedOrderToView(null)}
      />
    </div>
  );
};

export default OrdersManager;
