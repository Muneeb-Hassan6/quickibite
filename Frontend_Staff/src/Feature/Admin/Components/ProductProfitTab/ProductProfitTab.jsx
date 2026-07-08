import React, { useState, useEffect, useRef } from "react";
import "./ProductProfitTab.css";
import { FaMoneyBillWave, FaChartLine, FaBoxOpen, FaSort, FaCalendarAlt } from "react-icons/fa";

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
    // If filter is custom, wait until both dates are set to fetch automatically
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
        setProfitData(data.data);
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

  const categories = ["all", ...new Set(profitData.map(item => item.category))];
  const filteredByCategory = profitData.filter(item => categoryFilter === "all" || item.category === categoryFilter);

  const sortedData = [...filteredByCategory].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const totalQty = filteredByCategory.reduce((acc, item) => acc + item.qty, 0);
  const totalCost = filteredByCategory.reduce((acc, item) => acc + item.cogs, 0);
  const totalProfit = filteredByCategory.reduce((acc, item) => acc + item.profit, 0);
  const topProduct = sortedData.length > 0 ? [...filteredByCategory].sort((a,b) => b.profit - a.profit)[0] : null;

  return (
    <div className="product-profit-container animate-slide-up">
      <div className="profit-header-section">
        <h2 className="section-title"><FaMoneyBillWave /> Product Profitability</h2>
        <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="profit-filter">
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
              ))}
            </select>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="profit-filter">
              <option value="today">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
            {filter === "custom" && (
              <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                <div className="date-input-wrapper">
                  <input 
                     type="date" 
                     value={startDate} 
                     onChange={(e) => setStartDate(e.target.value)} 
                     className="profit-filter date-input-field"
                     ref={startDateRef}
                     onClick={() => startDateRef.current.showPicker()}
                  />
                  <FaCalendarAlt className="custom-calendar-icon" onClick={() => startDateRef.current.showPicker()} />
                </div>
                <span style={{color: '#fff'}}>to</span>
                <div className="date-input-wrapper">
                  <input 
                     type="date" 
                     value={endDate} 
                     onChange={(e) => setEndDate(e.target.value)} 
                     className="profit-filter date-input-field"
                     ref={endDateRef}
                     onClick={() => endDateRef.current.showPicker()}
                  />
                  <FaCalendarAlt className="custom-calendar-icon" onClick={() => endDateRef.current.showPicker()} />
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="profit-summary-cards">
         <div className="p-summary-card">
            <div className="icon-box bg-blue"><FaBoxOpen /></div>
            <div>
              <h3>Products Sold</h3>
              <p>{totalQty} Items</p>
            </div>
         </div>
         <div className="p-summary-card">
            <div className="icon-box bg-red"><FaMoneyBillWave /></div>
            <div>
              <h3>Total Investment</h3>
              <p>Rs {totalCost.toLocaleString()}</p>
            </div>
         </div>
         <div className="p-summary-card">
            <div className="icon-box bg-green"><FaMoneyBillWave /></div>
            <div>
              <h3>Net Profit</h3>
              <p>Rs {totalProfit.toLocaleString()}</p>
            </div>
         </div>
         <div className="p-summary-card">
            <div className="icon-box bg-orange"><FaChartLine /></div>
            <div>
              <h3>Top Performer</h3>
              <p>{topProduct ? topProduct.title : "N/A"}</p>
            </div>
         </div>
      </div>

      <div className="profit-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("title")} style={{cursor: "pointer"}}>Product Name <FaSort style={{marginLeft:'5px', color:'#999'}}/></th>
              <th onClick={() => handleSort("qty")} style={{cursor: "pointer"}}>Qty Sold <FaSort style={{marginLeft:'5px', color:'#999'}}/></th>
              <th onClick={() => handleSort("revenue")} style={{cursor: "pointer"}}>Revenue <FaSort style={{marginLeft:'5px', color:'#999'}}/></th>
              <th onClick={() => handleSort("cogs")} style={{cursor: "pointer"}}>Total Cost <FaSort style={{marginLeft:'5px', color:'#999'}}/></th>
              <th onClick={() => handleSort("profit")} style={{cursor: "pointer"}}>Net Profit <FaSort style={{marginLeft:'5px', color:'#999'}}/></th>
              <th onClick={() => handleSort("margin")} style={{cursor: "pointer"}}>Margin % <FaSort style={{marginLeft:'5px', color:'#999'}}/></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign:"center", padding:"30px"}}>Loading profit data...</td></tr>
            ) : sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={index}>
                  <td><b>{item.title}</b></td>
                  <td>{item.qty}</td>
                  <td>Rs {item.revenue.toLocaleString()}</td>
                  <td style={{color: "var(--admin-muted)"}}>Rs {item.cogs.toLocaleString()}</td>
                  <td style={{color: item.profit > 0 ? "#10B981" : "#EF4444", fontWeight: "bold"}}>
                    Rs {item.profit.toLocaleString()}
                  </td>
                  <td>
                    <span className={`margin-badge ${item.margin >= 50 ? 'high' : item.margin >= 20 ? 'medium' : 'low'}`}>
                      {item.margin}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{textAlign:"center", padding:"30px"}}>No completed orders found for this period.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductProfitTab;
