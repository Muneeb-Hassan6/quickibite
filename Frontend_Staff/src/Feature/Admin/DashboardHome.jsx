import React, { useState, useEffect } from "react";
import {
  FaDollarSign,
  FaShoppingBag,
  FaUtensils,
  FaUsers,
  FaEye,
} from "react-icons/fa";

import OrderReceiptModal from "./Components/Orders/Components/OrderReceiptModal";

// 🔥 Yahan humne setActiveTab ko receive kar liya hai
const DashboardHome = ({ setActiveTab }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);

  const [allOrders, setAllOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [profitData, setProfitData] = useState({ revenue: 0, cogs: 0, gross_profit: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const ordersResponse = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=all`,
        { headers }
      );
      const ordersData = await ordersResponse.json();

      if (Array.isArray(ordersData)) {
        let sales = 0;
        let uniqueCustomers = new Set();

        const formattedOrders = ordersData.map((dbOrder) => {
          sales += parseFloat(dbOrder.total || 0);
          if (dbOrder.customer_name) {
            uniqueCustomers.add(dbOrder.customer_name.toLowerCase().trim());
          }
          return {
            id: `#${dbOrder.id}`,
            rawId: dbOrder.id,
            customerName: dbOrder.customer_name || "Guest",
            type: dbOrder.order_type
              ? dbOrder.order_type.replace("_", " ").toUpperCase()
              : "DELIVERY",

            // 🔥 FIX: 'cart' ki jagah 'items' kar diya gaya hy jo DB bhej raha hy
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
          };
        });

        const sortedOrders = formattedOrders.sort((a, b) => b.rawId - a.rawId);
        setAllOrders(sortedOrders);
        setRecentOrders(sortedOrders.slice(0, 10));
        setTotalSales(sales);
        setTotalCustomers(uniqueCustomers.size);
      }

      const menuResponse = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`,
        { headers }
      );
      const menuData = await menuResponse.json();
      if (Array.isArray(menuData)) {
        setMenuItemsCount(menuData.length);
      }

      // 🔥 Fetch Profit Data
      const profitResponse = await fetch(`${import.meta.env.VITE_API_BASE}/get_profit_stats.php?range=today`, { headers });
      const profitJson = await profitResponse.json();
      if (profitJson.success && profitJson.data) {
        setProfitData(profitJson.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // 🔥 Yahan string tab ka naam de diya hai jo aapke switch statement mein hai
  const statsData = [
    {
      title: "Today's Profit",
      value: `Rs ${profitData.gross_profit.toLocaleString()}`,
      icon: <FaDollarSign />,
      change: `Revenue: Rs ${profitData.revenue.toLocaleString()}`,
      colorClass: "card-green",
      iconClass: <FaDollarSign />,
      tabName: "analytics",
    },
    {
      title: "Total Orders",
      value: allOrders.length.toLocaleString(),
      icon: <FaShoppingBag />,
      change: "All time",
      colorClass: "card-blue",
      iconClass: <FaShoppingBag />,
      tabName: "orders", // 👈 AdminDashboard ke switch case ka naam
    },
    {
      title: "Active Items",
      value: menuItemsCount,
      icon: <FaUtensils />,
      change: "Menu Products",
      colorClass: "card-red",
      iconClass: <FaUtensils />,
      tabName: "menu", // 👈 AdminDashboard ke switch case ka naam
    },
    {
      title: "Customers",
      value: totalCustomers.toLocaleString(),
      icon: <FaUsers />,
      change: "Unique buyers",
      colorClass: "card-green",
      iconClass: <FaUsers />,
      tabName: "analytics", // 👈 AdminDashboard ke switch case ka naam
    },
  ];

  return (
    <>
      <div className="bg-gradient-to-r from-red-500 to-[#b71c1c] border border-[var(--admin-border)] p-[1.563rem] rounded-[1rem] flex flex-col md:flex-row justify-between items-start md:items-center mb-[1.875rem] relative overflow-hidden gap-[0.938rem] md:gap-0 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[0.375rem] before:h-full before:bg-[var(--admin-yellow)]">
        <div className="pl-[0.375rem]">
          <h2 className="text-white m-0 text-[1.625rem]">{getGreeting()}, Admin! 👋</h2>
          <p className="text-[#e0e0e0] mt-[0.313rem] mb-0">Here's what's happening in your restaurant today.</p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-[var(--admin-yellow)] font-bold text-[1.25rem] block">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-white block">
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1.25rem] mb-[1.875rem] animate-slide-up">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-[var(--admin-panel)] border border-[var(--admin-border)] p-[1.25rem] rounded-[1rem] flex items-center gap-[1.25rem] transition-all duration-300 relative overflow-hidden shadow-[var(--shadow-glow)] hover:-translate-y-[5px] hover:border-[var(--admin-orange)] hover:shadow-[0_10px_25px_rgba(239,68,68,0.15)] group cursor-pointer"
            onClick={() => setActiveTab(stat.tabName)} // 🔥 Yahan activeTab update ho raha hai
          >
            <div className="w-[3.75rem] h-[3.75rem] bg-[rgba(239,68,68,0.1)] text-[var(--admin-orange)] rounded-[0.75rem] flex items-center justify-center text-[1.75rem] z-[2] shrink-0">{stat.icon}</div>
            <div className="z-[2] relative">
              <h3 className="m-0 mb-[0.313rem] text-[1.625rem] font-extrabold text-[var(--admin-text)] relative">{stat.value}</h3>
              <p className="m-0 text-[#888] text-[0.875rem] font-semibold uppercase relative">{stat.title}</p>
              <small className="text-[var(--admin-muted)] text-[0.75rem]">{stat.change}</small>
            </div>
            <div className="absolute -right-[1.25rem] -bottom-[1.25rem] text-[6.25rem] opacity-5 text-[var(--admin-text)] -rotate-12 pointer-events-none z-[1]">{stat.iconClass}</div>
          </div>
        ))}
      </div>

      <div className="animate-slide-up">
        <div className="text-[1.25rem] font-bold mb-[0.938rem] border-l-4 border-red-500 pl-[0.625rem] text-[var(--admin-text)]">Recent Live Orders (Last 10)</div>
        <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-[1rem] p-[1.25rem] overflow-x-auto shadow-[var(--shadow-glow)]">
          <table className="w-full border-collapse min-w-[37.5rem] text-left">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.05)] text-[var(--admin-text)] border-b border-[var(--admin-border)] uppercase text-[0.875rem] tracking-[1px]">
                <th className="p-[0.938rem]">ID</th>
                <th className="p-[0.938rem]">Customer</th>
                <th className="p-[0.938rem]">Items</th>
                <th className="p-[0.938rem]">Total</th>
                <th className="p-[0.938rem]">Status</th>
                <th className="p-[0.938rem]">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[var(--admin-border)] transition-colors duration-300 hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="p-[0.938rem]">
                      <b className="text-[var(--admin-text)]">{order.id}</b>
                    </td>
                    <td className="p-[0.938rem] text-[var(--admin-text)]">{order.customerName}</td>
                    <td
                      className="p-[0.938rem] text-[var(--admin-muted)] max-w-[12.5rem] whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                    </td>
                    <td
                      className="p-[0.938rem] text-[var(--admin-orange)] font-bold"
                    >
                      Rs. {order.total}
                    </td>
                    <td className="p-[0.938rem]">
                      <span className={`inline-block px-[0.625rem] py-[0.25rem] rounded-[1.25rem] text-[0.75rem] font-bold uppercase tracking-[1px] ${order.status === 'completed' ? 'bg-[rgba(34,197,94,0.15)] text-green-500' : order.status === 'pending' ? 'bg-[rgba(234,179,8,0.15)] text-yellow-500' : 'bg-[rgba(59,130,246,0.15)] text-blue-500'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-[0.938rem]">
                      <button
                        className="bg-transparent text-[var(--admin-text)] border border-[var(--admin-border)] px-[0.938rem] py-[0.375rem] rounded-[0.313rem] cursor-pointer transition-all duration-300 flex items-center gap-[0.313rem] text-[0.875rem] hover:bg-white hover:text-black"
                        onClick={() => {
                          setSelectedOrderToView(order);
                          setIsReceiptModalOpen(true);
                        }}
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center p-[1.25rem] text-[#888]"
                  >
                    No orders found.
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
    </>
  );
};

export default DashboardHome;
