import React from "react";
import { FaEye, FaEdit } from "react-icons/fa";

const OrdersTable = ({ orders, onEditClick, onViewClick }) => {
  return (
    <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-[1rem] p-[1.25rem] overflow-x-auto shadow-[0_4px_6px_rgba(0,0,0,0.2)]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="p-[0.938rem] text-[var(--admin-muted)] text-[0.813rem] uppercase border-b-2 border-[var(--admin-border)] font-semibold" style={{ paddingLeft: "25px" }}>Order ID</th>
            <th className="p-[0.938rem] text-[var(--admin-muted)] text-[0.813rem] uppercase border-b-2 border-[var(--admin-border)] font-semibold">Customer</th>
            <th className="p-[0.938rem] text-[var(--admin-muted)] text-[0.813rem] uppercase border-b-2 border-[var(--admin-border)] font-semibold">Items</th>
            <th className="p-[0.938rem] text-[var(--admin-muted)] text-[0.813rem] uppercase border-b-2 border-[var(--admin-border)] font-semibold">Total</th>
            <th className="p-[0.938rem] text-[var(--admin-muted)] text-[0.813rem] uppercase border-b-2 border-[var(--admin-border)] font-semibold">Status</th>
            <th className="p-[0.938rem] text-[var(--admin-muted)] text-[0.813rem] uppercase border-b-2 border-[var(--admin-border)] font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)] group">
                <td className="p-[0.938rem] border-b border-[var(--admin-border)] text-[0.875rem] align-middle text-[var(--admin-text)]" style={{ paddingLeft: "25px" }}>
                  <span className="font-extrabold text-[var(--admin-text)] text-[0.938rem]">{order.id}</span>
                </td>
                <td className="p-[0.938rem] border-b border-[var(--admin-border)] text-[0.875rem] align-middle text-[var(--admin-text)]">
                  <b>{order.customerName}</b>
                  <br />
                  <small>{order.type}</small>
                </td>
                <td className="p-[0.938rem] border-b border-[var(--admin-border)] text-[0.875rem] align-middle" style={{ color: "var(--admin-muted)" }}>
                  {/* Array ko string mein convert kar ke table mein dikhaya */}
                  {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                </td>
                <td className="p-[0.938rem] border-b border-[var(--admin-border)] text-[0.875rem] align-middle text-[var(--admin-text)]">
                  <span className="font-extrabold text-[var(--admin-orange)] text-[0.938rem]">Rs. {order.total}</span>
                </td>
                <td className="p-[0.938rem] border-b border-[var(--admin-border)] text-[0.875rem] align-middle text-[var(--admin-text)]">
                  <span className={`px-[0.875rem] py-[0.375rem] rounded-[1.875rem] text-[0.688rem] font-extrabold uppercase tracking-[0.5px] inline-block ${order.status === 'pending' ? 'bg-[rgba(255,174,0,0.15)] text-[#ffae00] border border-[rgba(255,174,0,0.3)]' : order.status === 'cooking' ? 'bg-[rgba(239,68,68,0.15)] text-[var(--admin-orange)] border border-[rgba(239,68,68,0.3)]' : order.status === 'delivered' ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)]' : ''}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-[0.938rem] border-b border-[var(--admin-border)] text-[0.875rem] align-middle text-[var(--admin-text)]">
                  <button
                    className="bg-transparent border border-[var(--admin-border)] text-[var(--admin-muted)] py-[0.5rem] px-[0.75rem] rounded-[0.375rem] cursor-pointer inline-flex items-center gap-[0.375rem] text-[0.75rem] font-semibold transition-all duration-200 hover:border-[var(--admin-orange)] hover:text-[var(--admin-orange)] hover:bg-[rgba(239,68,68,0.05)]"
                    onClick={() => onEditClick(order)}
                  >
                    <FaEdit /> Update
                  </button>
                  <button
                    className="bg-transparent border border-[var(--admin-border)] text-[var(--admin-muted)] py-[0.5rem] px-[0.75rem] rounded-[0.375rem] cursor-pointer inline-flex items-center gap-[0.375rem] text-[0.75rem] font-semibold transition-all duration-200 hover:border-[var(--admin-orange)] hover:text-[var(--admin-orange)] hover:bg-[rgba(239,68,68,0.05)] ml-[0.313rem]"
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
