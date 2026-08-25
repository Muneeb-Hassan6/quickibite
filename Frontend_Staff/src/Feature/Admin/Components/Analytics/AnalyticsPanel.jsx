import React, { useState, useEffect } from "react";
import {
  FaDollarSign,
  FaShoppingBag,
  FaChartLine,
  FaBan,
  FaFire,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";

// Import Components
import SummaryCards from "./Components/SummaryCards";
import SalesChart from "./Components/SalesChart";
import TopCategories from "./Components/TopCategories";

const AnalyticsPanel = () => {
  const [statsFilter, setStatsFilter] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [allOrders, setAllOrders] = useState([]);
  const [menuMap, setMenuMap] = useState({});

  // Dynamic Metrics
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

  // Fetch orders and menu catalog
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

  // Compute metrics
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
      const orderDateStr = order.created_at || order.date;
      if (!orderDateStr) return;

      const orderDate = new Date(orderDateStr);
      if (isNaN(orderDate.getTime())) return;

      let isIncluded = false;

      if (statsFilter === "daily") {
        if (orderDate.toDateString() === today.toDateString()) isIncluded = true;
      } else if (statsFilter === "weekly") {
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) isIncluded = true;
      } else if (statsFilter === "monthly") {
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) isIncluded = true;
      } else if (statsFilter === "yearly") {
        if (orderDate.getFullYear() === currentYear) isIncluded = true;
      } else if (statsFilter === "all") {
        isIncluded = true;
      } else if (statsFilter === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        if (orderDate >= start && orderDate <= end) isIncluded = true;
      }

      if (isIncluded) {
        const isCancelled = order.status && ["cancelled", "declined"].includes(order.status.toLowerCase());

        if (isCancelled) {
          cancelled++;
        } else {
          const orderTotal = parseFloat(order.total) || 0;
          revenue += orderTotal;
          ordersCount++;

          const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayName = daysMap[orderDate.getDay()];
          if (dailyRevenue[dayName] !== undefined) {
            dailyRevenue[dayName] += orderTotal;
          }

          const hour = orderDate.getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;

          let items = [];
          if (typeof order.items === "string") {
            try { items = JSON.parse(order.items); } catch (e) {}
          } else if (Array.isArray(order.items)) {
            items = order.items;
          }

          if (Array.isArray(items)) {
            items.forEach((item) => {
              const name = item.name || item.title || "Unknown";
              const qty = parseInt(item.qty) || 1;
              itemCounts[name] = (itemCounts[name] || 0) + qty;

              const category = menuMap[name] || "Specialty";
              categorySales[category] = (categorySales[category] || 0) + qty;
            });
          }
        }
      }
    });

    const avgValue = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;

    let topItem = { name: "N/A", qty: 0 };
    Object.keys(itemCounts).forEach((name) => {
      if (itemCounts[name] > topItem.qty) {
        topItem = { name, qty: itemCounts[name] };
      }
    });

    let maxHour = -1;
    let maxHourCount = 0;
    Object.keys(hourCounts).forEach((h) => {
      if (hourCounts[h] > maxHourCount) {
        maxHourCount = hourCounts[h];
        maxHour = parseInt(h);
      }
    });

    let peakHourStr = "N/A";
    if (maxHour !== -1) {
      const nextH = (maxHour + 1) % 24;
      const formatH = (h) => {
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}${ampm}`;
      };
      peakHourStr = `${formatH(maxHour)} - ${formatH(nextH)}`;
    }

    const totalCatQty = Object.values(categorySales).reduce((a, b) => a + b, 0);
    let catArr = Object.keys(categorySales).map(cat => ({
      name: cat,
      qty: categorySales[cat],
      percent: totalCatQty > 0 ? Math.round((categorySales[cat] / totalCatQty) * 100) : 0
    })).sort((a,b) => b.qty - a.qty).slice(0, 4);

    setTopCategoriesData(catArr);

    setMetrics({
      totalRevenue: revenue,
      totalOrders: ordersCount,
      avgOrderValue: avgValue,
      cancelledOrders: cancelled,
      mostSoldItem: topItem,
      peakHour: peakHourStr,
    });

    const maxRevenue = Math.max(...Object.values(dailyRevenue));
    const formattedChartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
      const dayTotal = dailyRevenue[day] || 0;
      return {
        day: day,
        value: maxRevenue > 0 ? Math.round((dayTotal / maxRevenue) * 100) : 0,
        amount: `Rs. ${dayTotal.toLocaleString()}`,
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
  };

  const analyticsMetrics = [
    {
      title: "Gross Revenue",
      value: `Rs. ${metrics.totalRevenue.toLocaleString()}`,
      icon: <FaDollarSign />,
      trend: getTrendLabel(),
      isUp: true,
    },
    {
      title: "Completed Orders",
      value: metrics.totalOrders.toLocaleString(),
      icon: <FaShoppingBag />,
      trend: getTrendLabel(),
      isUp: true,
    },
    {
      title: "Avg. Ticket Size",
      value: `Rs. ${metrics.avgOrderValue.toLocaleString()}`,
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
      title: "Top Product",
      value: metrics.mostSoldItem.name,
      icon: <FaFire />,
      trend: `${metrics.mostSoldItem.qty} sold`,
      isUp: true,
    },
    {
      title: "Peak Rush Time",
      value: metrics.peakHour,
      icon: <FaClock />,
      trend: "Peak traffic",
      isUp: true,
    },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Analytics & Sales Overview
            </h2>
          </div>
          <p className="text-xs text-[var(--admin-muted,#888)] m-0 mt-0.5 font-sans">
            Real-time business performance metrics, volume patterns, and product trends.
          </p>
        </div>
      </div>

      {/* Custom Date Range Bar */}
      {statsFilter === "custom" && (
        <div className="flex items-center gap-3 bg-[var(--admin-panel,#171717)] p-3 rounded-2xl border border-amber-500/20 flex-wrap">
          <FaCalendarAlt className="text-amber-400 text-xs" />
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <span>From:</span>
            <input
              type="date"
              className="bg-black/40 text-white border border-white/10 rounded-xl px-2.5 py-1 text-xs [color-scheme:dark]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <span>To:</span>
            <input
              type="date"
              className="bg-black/40 text-white border border-white/10 rounded-xl px-2.5 py-1 text-xs [color-scheme:dark]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* 1. Metric Summary Cards */}
      <SummaryCards metrics={analyticsMetrics} />

      {/* 2. Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <SalesChart
            chartData={chartData}
            filter={statsFilter}
            setFilter={setStatsFilter}
          />
        </div>
        <div className="lg:col-span-4">
          <TopCategories data={topCategoriesData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
