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
      <div className="dashboard-banner">
        <div className="welcome-text">
          <h2>{getGreeting()}, Admin! 👋</h2>
          <p>Here's what's happening in your restaurant today.</p>
        </div>
        <div className="live-clock">
          <span className="time-display">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="date-display">
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </div>

      <div className="stats-grid animate-slide-up">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`stat-card-premium ${stat.colorClass}`}
            onClick={() => setActiveTab(stat.tabName)} // 🔥 Yahan activeTab update ho raha hai
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon-box">{stat.icon}</div>
            <div>
              <h3>{stat.value}</h3>
              <p style={{ color: "#888", margin: 0 }}>{stat.title}</p>
              <small>{stat.change}</small>
            </div>
            <div className="bg-icon-overlay">{stat.iconClass}</div>
          </div>
        ))}
      </div>

      <div className="recent-orders-section animate-slide-up">
        <div className="section-header">Recent Live Orders (Last 10)</div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="ID">
                      <b>{order.id}</b>
                    </td>
                    <td data-label="Customer">{order.customerName}</td>
                    <td
                      data-label="Items"
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                    </td>
                    <td
                      data-label="Total"
                      style={{
                        color: "var(--admin-orange)",
                        fontWeight: "bold",
                      }}
                    >
                      Rs. {order.total}
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td data-label="Action">
                      <button
                        className="btn-view"
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
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#888",
                    }}
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
