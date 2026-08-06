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
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-action-pill"
                    onClick={() => onEditClick(order)}
                  >
                    <FaEdit /> Update
                  </button>
                  <button
                    className="btn-view"
                    style={{ marginLeft: "5px" }}
                    onClick={() => onViewClick(order)}
                  >
                    <FaEye />
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
