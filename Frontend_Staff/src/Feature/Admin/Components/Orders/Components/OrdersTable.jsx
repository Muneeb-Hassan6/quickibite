import React from "react";
import { FaEye, FaEdit } from "react-icons/fa";

const OrdersTable = ({ orders, onEditClick, onViewClick }) => {
  return (
    <div className="premium-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ paddingLeft: "25px" }}>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment Info</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td style={{ paddingLeft: "25px" }}>
                  <span className="order-id-text">{order.id}</span>
                </td>
                <td>
                  <b>{order.customerName}</b>
                  <br />
                  <small>{order.type}</small>
                </td>
                <td style={{ color: "var(--admin-muted)" }}>
                  {/* Array ko string mein convert kar ke table mein dikhaya */}
                  {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                </td>
                <td>
                  <span className="amount-text">Rs. {order.total}</span>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px", 
                      fontWeight: "bold",
                      backgroundColor: order.paymentStatus === "Paid" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: order.paymentStatus === "Paid" ? "#10b981" : "var(--brand-red)"
                    }}>
                      {order.paymentStatus}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--admin-muted)", fontWeight: "bold" }}>
                      {order.paymentMethod}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => onViewClick(order)}
                  >
                    <FaEye /> View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
