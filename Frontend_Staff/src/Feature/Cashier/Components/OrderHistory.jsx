import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [historySearch, setHistorySearch] = useState("");

  const { data: ordersData = [] } = useQuery({
    queryKey: ['cashier_orders'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_orders.php?type=cashier`);
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
            paymentStatus: dbOrder.payment_status || dbOrder.status || "Pending",
            paymentMethod: dbOrder.payment_method || "Cash",
            time: dbOrder.time,
            items: parsedCart,
          };
        });

        formattedOrders.sort((a, b) => b.id - a.id);
        return formattedOrders;
      }
      return [];
    },
    refetchInterval: 5000,
  });


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

          queryClient.setQueryData(['cashier_orders'], (prevData = []) => 
            prevData.map((order) =>
              order.id === orderId
                ? { ...order, paymentStatus: newStatus }
                : order,
            )
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
    <div className="p-[30px] h-full overflow-y-auto">
      <h2 className="m-0 font-oswald text-[28px] font-extrabold text-[var(--admin-text)] uppercase tracking-[1px] pb-[20px] border-b border-[rgba(255,255,255,0.1)] mb-[30px]">
        Transaction History
      </h2>

      <div className="flex gap-[15px] mb-[30px] items-center">
        <div
          className="flex items-center bg-[var(--pos-panel)] border border-[var(--admin-border)] shadow-sm rounded-[20px] px-[15px] transition-colors duration-300 focus-within:border-[var(--brand-red)] w-full max-w-[400px]"
        >
          <FaSearch className="text-[var(--admin-muted)] mr-[10px]" />
          <input
            type="text"
            placeholder="Search Customer or Order ID..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="bg-transparent border-none text-[var(--admin-text)] py-[12px] px-0 w-full outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--pos-panel)] border border-[var(--admin-border)] shadow-sm rounded-[24px] p-[20px]">
        <table className="w-full border-collapse text-left [&_th]:p-[15px] [&_th]:text-[var(--admin-muted)] [&_th]:text-[13px] [&_th]:uppercase [&_th]:border-b-[2px] [&_th]:border-b-[var(--admin-border)] [&_th]:font-extrabold [&_td]:p-[15px] [&_td]:border-b [&_td]:border-b-[var(--admin-border)] [&_td]:text-[14px] [&_td]:transition-all [&_td]:duration-200 max-[900px]:[&_thead]:hidden max-[900px]:[&_tr]:block max-[900px]:[&_tr]:bg-[var(--admin-panel)] max-[900px]:[&_tr]:mb-[15px] max-[900px]:[&_tr]:rounded-[12px] max-[900px]:[&_tr]:p-[15px] max-[900px]:[&_tr]:border max-[900px]:[&_tr]:border-[var(--admin-border)] max-[900px]:[&_td]:flex max-[900px]:[&_td]:justify-between max-[900px]:[&_td]:items-center max-[900px]:[&_td]:border-b-dashed max-[900px]:[&_td]:py-[10px] max-[900px]:[&_td]:text-right max-[900px]:[&_td]:before:content-[attr(data-label)] max-[900px]:[&_td]:before:text-[var(--admin-muted)] max-[900px]:[&_td]:before:font-extrabold max-[900px]:[&_td]:before:text-[11px] max-[900px]:[&_td]:before:uppercase">
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
                        className="bg-transparent border-none text-[var(--admin-muted)] px-[15px] py-[8px] rounded-[20px] cursor-pointer flex items-center gap-[6px] text-[13px] font-bold transition-all duration-200 hover:text-[var(--brand-red)] hover:bg-[rgba(239,68,68,0.05)]"
                        onClick={() =>
                          togglePaymentStatus(order.id, order.paymentStatus)
                        }
                        style={{
                          color:
                            order.paymentStatus === "Paid"
                              ? "#ef4444"
                              : "#10b981",
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
                        className="bg-[var(--bg-body)] border border-[var(--admin-border)] text-[var(--admin-muted)] px-[15px] py-[8px] rounded-[20px] cursor-pointer flex items-center gap-[6px] text-[13px] font-bold transition-all duration-200 hover:text-[var(--brand-red)] hover:bg-[rgba(239,68,68,0.05)] shadow-sm"
                        onClick={() => onViewClick(order)}
                      >
                        <FaEye style={{ marginRight: "5px" }} /> View
                      </button>
                      <button
                        className="bg-[rgba(59,130,246,0.05)] border-none text-[var(--admin-muted)] px-[15px] py-[8px] rounded-[20px] cursor-pointer flex items-center gap-[6px] text-[13px] font-bold transition-all duration-200 hover:text-[#3b82f6] hover:bg-[rgba(59,130,246,0.1)]"
                        onClick={() => onPrintClick && onPrintClick(order)}
                        style={{
                          color: "#3b82f6",
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
