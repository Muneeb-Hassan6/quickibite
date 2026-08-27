import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import OrderReceiptModal from "./Components/Orders/Components/OrderReceiptModal";
import DashboardWelcomeHero from "./Components/DashboardHome/DashboardWelcomeHero";
import DashboardKpiCards from "./Components/DashboardHome/DashboardKpiCards";
import DashboardLiveOrdersFeed from "./Components/DashboardHome/DashboardLiveOrdersFeed";

const DashboardHome = ({ setActiveTab }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: allOrders = [] } = useQuery({
    queryKey: ["admin_orders", "all"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=all`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((dbOrder) => ({
          id: `#${dbOrder.id}`,
          rawId: dbOrder.id,
          customerName: dbOrder.customer_name || "Guest",
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
                  name: i ? i.name || i.title || "" : "",
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
    refetchInterval: 5000,
  });

  const { data: menuData = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: profitData = { revenue: 0, cogs: 0, gross_profit: 0 } } =
    useQuery({
      queryKey: ["profit_stats", "today"],
      queryFn: async () => {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_profit_stats.php?range=today`
        );
        const profitJson = await response.json();
        return profitJson.success && profitJson.data
          ? profitJson.data
          : { revenue: 0, cogs: 0, gross_profit: 0 };
      },
      refetchInterval: 5000,
    });

  const sortedOrders = useMemo(() => {
    return [...allOrders].sort((a, b) => b.rawId - a.rawId);
  }, [allOrders]);

  const recentOrders = sortedOrders.slice(0, 10);
  const totalCustomers = useMemo(
    () =>
      new Set(allOrders.map((o) => o.customerName.toLowerCase().trim())).size,
    [allOrders]
  );
  const menuItemsCount = menuData.length;

  const handleViewOrder = (order) => {
    setSelectedOrderToView(order);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* 1. Modern Welcome Hero Card */}
      <DashboardWelcomeHero currentTime={currentTime} />

      {/* 2. Key Metric Cards */}
      <DashboardKpiCards
        profitData={profitData}
        totalOrdersCount={allOrders.length}
        menuItemsCount={menuItemsCount}
        totalCustomers={totalCustomers}
        setActiveTab={setActiveTab}
      />

      {/* 3. Recent Live Orders Table */}
      <DashboardLiveOrdersFeed
        recentOrders={recentOrders}
        onViewOrder={handleViewOrder}
      />

      {/* Order Receipt Modal */}
      <OrderReceiptModal
        isOpen={isReceiptModalOpen}
        order={selectedOrderToView}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};

export default DashboardHome;
