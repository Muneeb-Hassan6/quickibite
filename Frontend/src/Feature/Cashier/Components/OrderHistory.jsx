import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaUser,
  FaPrint,
  FaCheck,
  FaTimes,
} from "react-icons/fa"; // 🔥 Naye icons add kiye
import Swal from "sweetalert2";

const OrderHistory = ({ onViewClick, onPrintClick }) => {
  const [historySearch, setHistorySearch] = useState("");
  const [ordersData, setOrdersData] = useState([]);

  // FETCH LIVE ORDERS FROM DATABASE
  const fetchOrderHistory = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=cashier`,
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const formattedOrders = data.map((dbOrder) => {
          let parsedCart = [];
          try {
            parsedCart = dbOrder.cart
              ? typeof dbOrder.cart === "string"
                ? JSON.parse(dbOrder.cart)
                : dbOrder.cart
              : [];
          } catch (error) {
            console.error("Cart parse error for Order ID:", dbOrder.id);
            parsedCart = [];
          }

          return {
            id: dbOrder.id,
            customerName: dbOrder.customer_name || "Walk-in",
            table: dbOrder.table_number || "Takeaway",
            total: parseFloat(dbOrder.total || dbOrder.total_amount || 0),
            paymentStatus:
              dbOrder.payment_status || dbOrder.status || "Pending",
            paymentMethod: dbOrder.payment_method || "Cash",
            time: dbOrder.time,
            items: parsedCart,
          };
        });

        formattedOrders.sort((a, b) => b.id - a.id);
        setOrdersData(formattedOrders);
      }
    } catch (error) {
      console.error("Failed to fetch order history", error);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
    const interval = setInterval(fetchOrderHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 NAYA FUNCTION: Payment Status Change Karne Ke Liye
  // 🔥 UPDATED FUNCTION
  const togglePaymentStatus = async (orderId, currentStatus) => {
    // Agar orderId nahi hai toh yahi rok do
    if (!orderId) {
      Swal.fire("Error", "Order ID is missing!", "error");
      return;
    }

    const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";

    // 🔥 Jasoos: Console me check karein kya data ja raha hai
    console.log("Sending to Backend ->", { id: orderId, status: newStatus });

    const result = await Swal.fire({
      title: `Mark as ${newStatus}?`,
      text: `Are you sure you want to change Order #${orderId} to ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newStatus === "Paid" ? "#10b981" : "#ef4444",
      cancelButtonColor: "#333",
      confirmButtonText: `Yes, Mark ${newStatus}`,
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/update_payment_status.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // 🔥 Make sure yeh line exactly aisi hi ho:
            body: JSON.stringify({ id: orderId, status: newStatus }),
          },
        );

        const resData = await response.json();

        // Jasoos: Backend ne wapis kya bheja
        console.log("Backend Reply ->", resData);

        if (resData.success) {
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: `Payment status changed to ${newStatus}.`,
            timer: 1500,
            showConfirmButton: false,
          });

          setOrdersData((prevData) =>
            prevData.map((order) =>
              order.id === orderId
                ? { ...order, paymentStatus: newStatus }
                : order,
            ),
          );
        } else {
          // Ab popup me masla saaf nazar aayega
          Swal.fire(
            "Error",
            resData.message || "Failed to update status",
            "error",
          );
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "Network Error! Could not connect to backend.",
          "error",
        );
      }
    }
  };

  const filteredHistory = ordersData.filter((order) => {
    const search = historySearch.toLowerCase();
    return (
      order.id.toString().includes(search) ||
      (order.table && order.table.toLowerCase().includes(search)) ||
      (order.customerName && order.customerName.toLowerCase().includes(search))
    );
  });

  return (
    <div className="history-container">
      <h2 className="page-title" style={{ paddingBottom: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", marginBottom: "30px" }}>
        Transaction History
      </h2>

      <div className="pos-controls-bar" style={{ marginBottom: "30px" }}>
        <div
          className="pos-search-wrapper"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <FaSearch className="pos-search-icon" />
          <input
            type="text"
            placeholder="Search Customer or Order ID..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="pos-search-input"
          />
        </div>
      </div>

      <div className="pos-history-table-wrapper">
        <table className="pos-glass-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Table</th>
              <th>Total</th>
              <th>Payment Info</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((order) => (
                <tr key={order.id}>
                  <td data-label="ID">#{order.id}</td>
                  <td data-label="Customer Name">
                    <FaUser
                      size={10}
                      style={{
                        marginRight: "5px",
                        color: "var(--admin-muted)",
                      }}
                    />
                    {order.customerName}
                  </td>
                  <td data-label="Table">{order.table}</td>

                  <td
                    data-label="Total"
                    style={{ color: "var(--brand-red)", fontWeight: "bold" }}
                  >
                    Rs {order.total.toFixed(2)}
                  </td>

                  <td data-label="Payment Info">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            order.paymentStatus === "Paid"
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                          color:
                            order.paymentStatus === "Paid"
                              ? "#10b981"
                              : "var(--brand-red)",
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--admin-muted)",
                          fontWeight: "bold",
                          marginLeft: "2px",
                        }}
                      >
                        Via {order.paymentMethod}
                      </span>
                    </div>
                  </td>

                  <td data-label="Action" className="status-btn-group">
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-start",
                      }}
                    >
                      {/* 🔥 NAYA PAYMENT TOGGLE BUTTON */}
                      <button
                        className="btn-pos-view"
                        onClick={() =>
                          togglePaymentStatus(order.id, order.paymentStatus)
                        }
                        style={{
                          color:
                            order.paymentStatus === "Paid"
                              ? "#ef4444"
                              : "#10b981",
                          borderColor:
                            order.paymentStatus === "Paid"
                              ? "rgba(239, 68, 68, 0.3)"
                              : "rgba(16, 185, 129, 0.3)",
                          backgroundColor:
                            order.paymentStatus === "Paid"
                              ? "rgba(239, 68, 68, 0.05)"
                              : "rgba(16, 185, 129, 0.05)",
                        }}
                        title={`Mark as ${order.paymentStatus === "Paid" ? "Unpaid" : "Paid"}`}
                      >
                        {order.paymentStatus === "Paid" ? (
                          <>
                            <FaTimes style={{ marginRight: "5px" }} /> Unpaid
                          </>
                        ) : (
                          <>
                            <FaCheck style={{ marginRight: "5px" }} /> Paid
                          </>
                        )}
                      </button>

                      <button
                        className="btn-pos-view"
                        onClick={() => onViewClick(order)}
                      >
                        <FaEye style={{ marginRight: "5px" }} /> View
                      </button>
                      <button
                        className="btn-pos-view"
                        onClick={() => onPrintClick && onPrintClick(order)}
                        style={{
                          color: "#3b82f6",
                          borderColor: "rgba(59, 130, 246, 0.3)",
                          backgroundColor: "rgba(59, 130, 246, 0.05)",
                        }}
                      >
                        <FaPrint style={{ marginRight: "5px" }} /> Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    color: "var(--admin-muted)",
                    padding: "30px 0",
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
  );
};

export default OrderHistory;
