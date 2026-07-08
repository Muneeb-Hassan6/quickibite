import React, { useState, useEffect } from "react";
import "./styles/index.css";
import {
  FaDollarSign,
  FaShoppingBag,
  FaChartLine,
  FaBan,
} from "react-icons/fa";

// Import Components
import SummaryCards from "./Components/SummaryCards";
import SalesChart from "./Components/SalesChart";
import TopCategories from "./Components/TopCategories";
import { FaFire, FaClock, FaCalendarAlt } from "react-icons/fa";

const AnalyticsPanel = () => {
  const [statsFilter, setStatsFilter] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [allOrders, setAllOrders] = useState([]);
  const [menuMap, setMenuMap] = useState({});

  // 🔥 DYNAMIC STATES
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    cancelledOrders: 0,
    mostSoldItem: { name: "N/A", qty: 0 },
    peakHour: "N/A",
  });
  
  const [topCategoriesData, setTopCategoriesData] = useState([]);

  const [chartData, setChartData] = useState([
    { day: "Mon", value: 0, amount: "Rs 0" },
    { day: "Tue", value: 0, amount: "Rs 0" },
    { day: "Wed", value: 0, amount: "Rs 0" },
    { day: "Thu", value: 0, amount: "Rs 0" },
    { day: "Fri", value: 0, amount: "Rs 0" },
    { day: "Sat", value: 0, amount: "Rs 0" },
    { day: "Sun", value: 0, amount: "Rs 0" },
  ]);

  // 🔥 FETCH DATA FROM DATABASE ONCE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("auth_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [ordersRes, menuRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE}/get_orders.php?type=all`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`, { headers })
        ]);
        const data = await ordersRes.json();
        const menuData = await menuRes.json();

        let itemToCategory = {};
        if (Array.isArray(menuData)) {
          menuData.forEach(m => {
            itemToCategory[m.name] = m.category || "Uncategorized";
          });
        }
        setMenuMap(itemToCategory);

        if (Array.isArray(data)) {
          setAllOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };
    fetchData();
  }, []);

  // Compute metrics whenever filter or data changes
  useEffect(() => {
    if (!allOrders || allOrders.length === 0) return;

    let revenue = 0;
    let ordersCount = 0;
    let cancelled = 0;

    let itemCounts = {};
    let categorySales = {};
    let hourCounts = {};

    const dailyRevenue = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    allOrders.forEach((order) => {
      const orderDateStr = order.created_at; // Real date field from DB
      if (!orderDateStr) return;

      const orderDate = new Date(orderDateStr);
      
      // Filter Logic
      let isIncluded = false;
      if (statsFilter === "all") {
        isIncluded = true;
      } else if (statsFilter === "custom") {
        if (startDate && endDate) {
          const from = new Date(startDate);
          from.setHours(0, 0, 0, 0);
          const to = new Date(endDate);
          to.setHours(23, 59, 59, 999);
          if (orderDate >= from && orderDate <= to) isIncluded = true;
        } else {
          isIncluded = true; // Agar dates set nahi hain to sab show karo
        }
      } else if (statsFilter === "daily") {
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        if (orderDay.getTime() === today.getTime()) isIncluded = true;
      } else if (statsFilter === "weekly") {
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if(diffDays <= 7) isIncluded = true;
      } else if (statsFilter === "monthly") {
        if(orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) isIncluded = true;
      } else if (statsFilter === "yearly") {
        if(orderDate.getFullYear() === currentYear) isIncluded = true;
      }

      if (!isIncluded) return; // Skip if not in selected filter

      const total = parseFloat(order.total || 0);
      const status = order.status ? order.status.toLowerCase() : "";

      ordersCount += 1;

      if (status === "cancelled") {
        cancelled += 1;
      } else {
        revenue += total;

        // Populate Chart Data (Days of the Week)
        const dayName = orderDate.toLocaleDateString("en-US", { weekday: "short" });
        if (dailyRevenue[dayName] !== undefined) {
          dailyRevenue[dayName] += total;
        }
        
        // Peak Hour Logic
        const hour = orderDate.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;

        // Top Products & Categories Logic
        if(order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const qty = parseInt(item.qty || 1);
                const itemName = item.name || item.title || "Unknown";
                itemCounts[itemName] = (itemCounts[itemName] || 0) + qty;
                
                const cat = menuMap[itemName] || "Uncategorized";
                categorySales[cat] = (categorySales[cat] || 0) + qty;
            });
        }
      }
    });

    // Average Order Value
    const avgValue = ordersCount > 0 ? revenue / ordersCount : 0;
    
    // Find Most Sold Item
    let topItem = { name: "N/A", qty: 0 };
    for (let name in itemCounts) {
       if(itemCounts[name] > topItem.qty) {
           topItem = { name, qty: itemCounts[name] };
       }
    }

    // Find Peak Hour
    let peakH = null;
    let maxCount = 0;
    for (let h in hourCounts) {
        if(hourCounts[h] > maxCount) {
           maxCount = hourCounts[h];
           peakH = h;
        }
    }
    let peakHourStr = "N/A";
    if(peakH !== null) {
        let p = parseInt(peakH);
        let pNext = (p + 1) % 24;
        let ampm = p >= 12 ? 'PM' : 'AM';
        let ampmNext = pNext >= 12 ? 'PM' : 'AM';
        let p12 = p % 12 || 12;
        let pNext12 = pNext % 12 || 12;
        peakHourStr = `${p12} ${ampm} - ${pNext12} ${ampmNext}`;
    }
    
    // Calculate Top Categories
    let totalCatQty = Object.values(categorySales).reduce((a, b) => a + b, 0);
    let catArr = Object.keys(categorySales).map(cat => ({
        name: cat,
        qty: categorySales[cat],
        percent: totalCatQty > 0 ? Math.round((categorySales[cat] / totalCatQty) * 100) : 0
    })).sort((a,b) => b.qty - a.qty).slice(0, 4);

    const colors = ["fill-red", "fill-orange", "fill-yellow", "fill-green"];
    catArr = catArr.map((c, i) => ({...c, colorClass: colors[i % colors.length]}));
    setTopCategoriesData(catArr);

    // Update Metrics
    setMetrics({
      totalRevenue: revenue,
      totalOrders: ordersCount,
      avgOrderValue: avgValue,
      cancelledOrders: cancelled,
      mostSoldItem: topItem,
      peakHour: peakHourStr,
    });

    // Chart data format
    const maxRevenue = Math.max(...Object.values(dailyRevenue));
    const formattedChartData = Object.keys(dailyRevenue).map((day) => {
      const dayTotal = dailyRevenue[day];
      return {
        day: day,
        value: maxRevenue > 0 ? Math.round((dayTotal / maxRevenue) * 100) : 0,
        amount: `Rs ${dayTotal >= 1000 ? (dayTotal / 1000).toFixed(1) + "k" : dayTotal}`,
      };
    });

    setChartData(formattedChartData);

  }, [allOrders, statsFilter, menuMap, startDate, endDate]);

  const getTrendLabel = () => {
    switch(statsFilter) {
      case "daily": return "Today";
      case "weekly": return "This Week";
      case "monthly": return "This Month";
      case "yearly": return "This Year";
      case "all": return "All Time";
      case "custom": return startDate && endDate ? `${startDate} to ${endDate}` : "Custom Range";
      default: return "Selected Period";
    }
  }

  // 🔥 TOP SUMMARY CARDS (Dynamic Data Mapped)
  const analyticsMetrics = [
    {
      title: "Total Revenue",
      value: `Rs ${metrics.totalRevenue.toLocaleString()}`,
      icon: <FaDollarSign />,
      trend: getTrendLabel(),
      isUp: true,
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders.toLocaleString(),
      icon: <FaShoppingBag />,
      trend: getTrendLabel(),
      isUp: true,
    },
    {
      title: "Avg. Order Value",
      value: `Rs ${Math.round(metrics.avgOrderValue).toLocaleString()}`,
      icon: <FaChartLine />,
      trend: getTrendLabel(),
      isUp: true,
    },
    {
      title: "Cancelled Orders",
      value: metrics.cancelledOrders.toString(),
      icon: <FaBan />,
      trend: getTrendLabel(),
      isUp: false,
    },
    {
      title: "Most Sold Product",
      value: metrics.mostSoldItem.name,
      icon: <FaFire />,
      trend: `${metrics.mostSoldItem.qty} units sold`,
      isUp: true,
    },
    {
      title: "Peak Rush Hour",
      value: metrics.peakHour,
      icon: <FaClock />,
      trend: "Busiest time",
      isUp: true,
    },
  ];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div style={{ marginBottom: "25px" }}>
        <h2 className="section-header">Analytics Overview</h2>
        <p
          style={{
            color: "var(--admin-muted)",
            fontSize: "14px",
            marginTop: "5px",
          }}
        >
          Real-time performance metrics
        </p>
      </div>

      {/* 🔥 Custom Date Range Picker */}
      {statsFilter === "custom" && (
        <div className="analytics-date-range-bar">
          <FaCalendarAlt className="date-range-icon" />
          <div className="date-range-group">
            <label>From:</label>
            <input
              type="date"
              className="analytics-date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-range-group">
            <label>To:</label>
            <input
              type="date"
              className="analytics-date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {startDate && endDate && (
            <span className="date-range-badge">
              Showing data from <b>{startDate}</b> to <b>{endDate}</b>
            </span>
          )}
        </div>
      )}

      {/* 1. Summary Cards Component */}
      <SummaryCards metrics={analyticsMetrics} />

      {/* 2. Grid Layout for Charts */}
      <div className="analytics-grid">
        {/* Left Side: Sales Bar Chart (Dynamic Data Passed) */}
        <SalesChart
          chartData={chartData}
          filter={statsFilter}
          setFilter={setStatsFilter}
        />

        {/* Right Side: Top Categories Progress */}
        <TopCategories data={topCategoriesData} />
      </div>
    </div>
  );
};

export default AnalyticsPanel;
