import React, { useState, useEffect, useMemo } from "react";
import {
  FaDollarSign,
  FaShoppingBag,
  FaUtensils,
  FaUsers,
  FaEye,
  FaClock,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import OrderReceiptModal from "./Components/Orders/Components/OrderReceiptModal";

const getStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "completed":
    case "delivered":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "pending":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case "cooking":
    case "preparing":
      return "bg-orange-500/15 text-orange-400 border border-orange-500/30";
    case "ready":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    case "cancelled":
    case "declined":
      return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
    default:
      return "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30";
  }
};

const DashboardHome = ({ setActiveTab }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: allOrders = [] } = useQuery({
    queryKey: ['admin_orders', 'all'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_orders.php?type=all`);
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
                } catch (e) { }
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
    refetchInterval: 5000,
  });

  const { data: menuData = [] } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: profitData = { revenue: 0, cogs: 0, gross_profit: 0 } } = useQuery({
    queryKey: ['profit_stats', 'today'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_profit_stats.php?range=today`);
      const profitJson = await response.json();
      return profitJson.success && profitJson.data ? profitJson.data : { revenue: 0, cogs: 0, gross_profit: 0 };
    },
    refetchInterval: 5000,
  });

  const sortedOrders = useMemo(() => {
    return [...allOrders].sort((a, b) => b.rawId - a.rawId);
  }, [allOrders]);

  const recentOrders = sortedOrders.slice(0, 10);
  const totalCustomers = useMemo(() => new Set(allOrders.map(o => o.customerName.toLowerCase().trim())).size, [allOrders]);
  const menuItemsCount = menuData.length;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const statsData = [
    {
      title: "Today's Profit",
      value: `Rs. ${profitData.gross_profit.toLocaleString()}`,
      icon: <FaDollarSign />,
      change: `Revenue: Rs. ${profitData.revenue.toLocaleString()}`,
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      tabName: "profit",
    },
    {
      title: "Total Orders",
      value: allOrders.length.toLocaleString(),
      icon: <FaShoppingBag />,
      change: "All-time volume",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      tabName: "orders",
    },
    {
      title: "Active Products",
      value: menuItemsCount,
      icon: <FaUtensils />,
      change: "Menu catalog",
      accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      tabName: "menu",
    },
    {
      title: "Unique Customers",
      value: totalCustomers.toLocaleString(),
      icon: <FaUsers />,
      change: "Direct buyers",
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      tabName: "staff",
    },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      {/* 1. Modern Welcome Hero Card */}
      <div className="bg-[var(--panel-bg)] border border-[var(--border-subtle)] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mb-2 border border-amber-500/20">
            BigBite Restaurant Operations
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-primary)] m-0 font-['Oswald',sans-serif] tracking-wide">
            {getGreeting()}, Admin! 👋
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 mb-0 font-sans">
            Here's the live overview and operational activity for today.
          </p>
        </div>

        <div className="text-left md:text-right relative z-10 p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
          <div className="text-amber-500 font-black text-base sm:text-lg font-mono flex items-center md:justify-end gap-1.5">
            <FaClock className="text-xs" />
            <span>
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] block font-semibold mt-0.5">
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-[var(--panel-bg)] border border-[var(--border-subtle)] p-4 sm:p-5 rounded-2xl flex items-center gap-4 transition-all duration-200 hover:border-amber-500/40 hover:-translate-y-0.5 shadow-sm group cursor-pointer"
            onClick={() => setActiveTab(stat.tabName)}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 border ${stat.accent}`}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block truncate">
                {stat.title}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] m-0 mt-0.5 font-mono truncate">
                {stat.value}
              </h3>
              <span className="text-[10px] text-[var(--text-secondary)] block font-semibold mt-0.5 truncate">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Recent Live Orders Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
          <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] font-['Oswald',sans-serif] uppercase tracking-wide m-0">
            Recent Live Orders (Last 10)
          </h3>
        </div>

        <div className="bg-[var(--panel-bg)] border border-[var(--border-subtle)] rounded-2xl p-3 sm:p-4 overflow-x-auto shadow-sm">
          <table className="w-full border-collapse min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--table-header-bg)]">
                <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                  Order ID
                </th>
                <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                  Customer
                </th>
                <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                  Items Summary
                </th>
                <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                  Total
                </th>
                <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                  Status
                </th>
                <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[var(--table-row-hover)] transition-colors"
                  >
                    <td className="p-3 text-xs font-black text-amber-500 align-middle font-mono">
                      {order.id}
                    </td>
                    <td className="p-3 text-xs text-[var(--text-primary)] align-middle">
                      <span className="font-extrabold block truncate max-w-[130px]">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">
                        {order.type}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-[var(--text-secondary)] align-middle max-w-[200px]">
                      <span className="line-clamp-1">
                        {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-black text-[var(--text-primary)] align-middle font-mono">
                      Rs. {order.total.toLocaleString()}
                    </td>
                    <td className="p-3 align-middle">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-right">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-[var(--input-bg)] hover:bg-amber-500 hover:text-neutral-950 text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                        onClick={() => {
                          setSelectedOrderToView(order);
                          setIsReceiptModalOpen(true);
                        }}
                      >
                        <FaEye className="text-[11px]" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider"
                  >
                    No recent orders found today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderReceiptModal
        isOpen={isReceiptModalOpen}
        order={selectedOrderToView}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};

export default DashboardHome;
