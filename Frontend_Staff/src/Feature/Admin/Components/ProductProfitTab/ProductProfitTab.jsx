import React, { useState, useEffect, useRef } from "react";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaBoxOpen,
  FaSort,
  FaCalendarAlt,
  FaPercent,
  FaCrown,
  FaFilter,
} from "react-icons/fa";

const ProductProfitTab = () => {
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [profitData, setProfitData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "profit", direction: "desc" });
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  useEffect(() => {
    if (filter === "custom" && (!startDate || !endDate)) return;
    fetchData();
  }, [filter, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = `${import.meta.env.VITE_API_BASE}/get_product_profit.php?range=${filter}`;
      if (filter === "custom") {
        url += `&start=${startDate}&end=${endDate}`;
      }
      const response = await fetch(url, { headers });
      const data = await response.json();
      if (data.success) {
        setProfitData(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching product profit data", error);
    }
    setLoading(false);
  };

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const categories = ["all", ...new Set(profitData.map((item) => item.category).filter(Boolean))];
  const filteredByCategory = profitData.filter(
    (item) => categoryFilter === "all" || item.category === categoryFilter
  );

  const sortedData = [...filteredByCategory].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const totalQty = filteredByCategory.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
  const totalRevenue = filteredByCategory.reduce((acc, item) => acc + (Number(item.revenue) || 0), 0);
  const totalCost = filteredByCategory.reduce((acc, item) => acc + (Number(item.cogs) || 0), 0);
  const totalProfit = filteredByCategory.reduce((acc, item) => acc + (Number(item.profit) || 0), 0);
  const storeMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
  const topProduct = sortedData.length > 0 ? [...filteredByCategory].sort((a, b) => b.profit - a.profit)[0] : null;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Product Profitability & Unit Economics
            </h2>
          </div>
          <p className="text-xs text-[var(--admin-muted,#888)] m-0 mt-0.5 font-sans">
            Cost of Goods Sold (COGS), gross margins, and net profitability per menu item.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 outline-none cursor-pointer focus:border-amber-500 transition-colors"
          >
            {categories.map((cat, idx) => (
              <option key={idx} className="bg-[#171717]" value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          {/* Time Range Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 outline-none cursor-pointer focus:border-amber-500 transition-colors"
          >
            <option className="bg-[#171717]" value="today">Today</option>
            <option className="bg-[#171717]" value="weekly">This Week</option>
            <option className="bg-[#171717]" value="monthly">This Month</option>
            <option className="bg-[#171717]" value="yearly">This Year</option>
            <option className="bg-[#171717]" value="all">All Time</option>
            <option className="bg-[#171717]" value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range Bar */}
      {filter === "custom" && (
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

      {/* Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--panel-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block">
              Units Dispatched
            </span>
            <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-sans block">
              {totalQty.toLocaleString()} Items
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-sm font-black shrink-0">
            <FaBoxOpen />
          </div>
        </div>

        <div className="bg-[var(--panel-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block">
              Total Production Cost
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-500 font-sans block">
              Rs. {totalCost.toLocaleString()}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-sm font-black shrink-0">
            <FaMoneyBillWave />
          </div>
        </div>

        <div className="bg-[var(--panel-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block">
              Net Gross Profit
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-500 font-sans block">
              Rs. {totalProfit.toLocaleString()}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-sm font-black shrink-0">
            <FaChartLine />
          </div>
        </div>

        <div className="bg-[var(--panel-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block">
              Average Margin
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-500 font-mono block">
              {storeMargin}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-sm font-black shrink-0">
            <FaPercent />
          </div>
        </div>
      </div>

      {/* Profitability Table */}
      <div className="bg-[var(--panel-bg)] rounded-2xl border border-[var(--border-subtle)] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[760px] text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--table-header-bg)]">
              <th
                onClick={() => handleSort("title")}
                className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Product Title</span>
                  <FaSort className="text-[10px] text-[var(--text-muted)]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("qty")}
                className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Units Sold</span>
                  <FaSort className="text-[10px] text-[var(--text-muted)]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("revenue")}
                className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Gross Revenue</span>
                  <FaSort className="text-[10px] text-[var(--text-muted)]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cogs")}
                className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Total Cost (COGS)</span>
                  <FaSort className="text-[10px] text-[var(--text-muted)]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("profit")}
                className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Net Profit</span>
                  <FaSort className="text-[10px] text-[var(--text-muted)]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("margin")}
                className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Margin %</span>
                  <FaSort className="text-[10px] text-[var(--text-muted)]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-12 text-xs text-[var(--text-secondary)] font-semibold"
                >
                  Calculating Unit Economics & Profitability...
                </td>
              </tr>
            ) : sortedData.length > 0 ? (
              sortedData.map((item, index) => {
                const margin = Number(item.margin) || 0;
                let badgeStyle = "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30";
                let marginColor = "bg-emerald-500";

                if (margin <= 30) {
                  badgeStyle = "bg-rose-500/15 text-rose-500 border border-rose-500/30";
                  marginColor = "bg-rose-500";
                } else if (margin <= 50) {
                  badgeStyle = "bg-amber-500/15 text-amber-500 border border-amber-500/30";
                  marginColor = "bg-amber-500";
                }

                return (
                  <tr key={index} className="hover:bg-[var(--table-row-hover)] transition-colors">
                    <td className="p-3.5 sm:p-4 align-middle">
                      <div>
                        <span className="font-extrabold text-sm text-[var(--text-primary)] block">
                          {item.title}
                        </span>
                        {item.category && (
                          <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle font-bold text-[var(--text-primary)] font-mono">
                      {item.qty}
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle font-bold text-[var(--text-secondary)] font-mono">
                      Rs. {Number(item.revenue || 0).toLocaleString()}
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle text-[var(--text-secondary)] font-medium font-mono">
                      Rs. {Number(item.cogs || 0).toLocaleString()}
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle">
                      <span className="font-black text-sm text-emerald-500 font-mono">
                        Rs. {Number(item.profit || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-2 bg-black/20 dark:bg-black/50 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${marginColor}`}
                            style={{ width: `${Math.min(100, Math.max(5, margin))}%` }}
                          />
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block ${badgeStyle}`}
                        >
                          {margin}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-12 text-xs text-[var(--text-secondary)] font-semibold"
                >
                  No completed sales records found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductProfitTab;
