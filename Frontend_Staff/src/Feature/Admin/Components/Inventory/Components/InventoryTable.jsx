import React from "react";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const InventoryTable = ({
  products,
  onEdit,
  onDelete,
  requestSort,
  sortConfig,
}) => {
  // Sorting icon dikhane ke liye helper function
  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key)
      return <FaSort className="opacity-30" />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="w-full overflow-x-auto bg-[var(--admin-panel)] rounded-[12px]  shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2)] animate-slide-up">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="p-[16px_20px] bg-[rgba(255,255,255,0.03)] text-[var(--admin-muted)] font-semibold text-[13px] uppercase border-b border-[var(--admin-border)] whitespace-nowrap select-none cursor-pointer hover:text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.05)]" onClick={() => requestSort("name")}>
              Product {getSortIcon("name")}
            </th>
            <th
              className="p-[16px_20px] bg-[rgba(255,255,255,0.03)] text-[var(--admin-muted)] font-semibold text-[13px] uppercase border-b border-[var(--admin-border)] whitespace-nowrap select-none cursor-pointer hover:text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.05)]"
              onClick={() => requestSort("price")}
            >
              Price {getSortIcon("price")}
            </th>
            <th
              className="p-[16px_20px] bg-[rgba(255,255,255,0.03)] text-[var(--admin-muted)] font-semibold text-[13px] uppercase border-b border-[var(--admin-border)] whitespace-nowrap select-none cursor-pointer hover:text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.05)]"
              onClick={() => requestSort("stock")}
            >
              Stock {getSortIcon("stock")}
            </th>
            <th className="p-[16px_20px] bg-[rgba(255,255,255,0.03)] text-[var(--admin-muted)] font-semibold text-[13px] uppercase border-b border-[var(--admin-border)] whitespace-nowrap select-none hover:text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.05)]">Status</th>
            <th className="p-[16px_20px] bg-[rgba(255,255,255,0.03)] text-[var(--admin-muted)] font-semibold text-[13px] uppercase border-b border-[var(--admin-border)] whitespace-nowrap select-none text-right hover:text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.05)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => {
              // Badge Logic
              let badgeClass = "bg-[#10b981]";
              let statusText = "In Stock";
              if (product.stock === 0) {
                badgeClass = "bg-[#ef4444]";
                statusText = "Out of Stock";
              } else if (product.stock <= 10) {
                badgeClass = "bg-[#f59e0b]";
                statusText = "Low Stock";
              }

              return (
                <tr key={product.id} className="transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="p-[16px_20px] border-b border-[var(--admin-border)] text-[var(--admin-text)] text-[14px] align-middle">
                    <div className="flex items-center gap-[15px]">
                      <span className="font-bold text-[15px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-[16px_20px] border-b border-[var(--admin-border)] text-[var(--admin-text)] text-[14px] align-middle font-bold">
                    ${parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="p-[16px_20px] border-b border-[var(--admin-border)] text-[var(--admin-text)] text-[14px] align-middle font-bold">{product.stock}</td>
                  <td className="p-[16px_20px] border-b border-[var(--admin-border)] text-[var(--admin-text)] text-[14px] align-middle">
                    <span className={`p-[6px_12px] rounded-[20px] text-[11px] font-bold text-white uppercase inline-block ${badgeClass}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="p-[16px_20px] border-b border-[var(--admin-border)] text-[var(--admin-text)] text-[14px] align-middle">
                    <div className="flex gap-[10px] justify-end">
                      <button
                        className="w-[35px] h-[35px] rounded flex items-center justify-center cursor-pointer text-[14px] transition-all duration-200 ease bg-[var(--admin-bg)] text-[var(--admin-text)]"
                        onClick={() => onEdit(product)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="w-[35px] h-[35px] rounded flex items-center justify-center cursor-pointer text-[14px] transition-all duration-200 ease bg-[rgba(239,68,68,0.1)] text-[#ef4444] hover:bg-[#ef4444] hover:text-white"
                        onClick={() => onDelete(product.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              {/* colSpan 5 kar diya hai kyunke ek column remove ho chuka hai */}
              <td colSpan="5" className="text-center p-[40px] text-[var(--admin-muted)] border-b border-[var(--admin-border)]">
                No products found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
