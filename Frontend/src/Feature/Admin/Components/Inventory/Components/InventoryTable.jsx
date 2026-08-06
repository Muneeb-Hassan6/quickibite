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
      return <FaSort className="sort-icon-inactive" />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="inventory-table-container animate-slide-up">
      <table className="inventory-table">
        <thead>
          <tr>
            <th className="sortable-header" onClick={() => requestSort("name")}>
              Product {getSortIcon("name")}
            </th>
            <th
              className="sortable-header"
              onClick={() => requestSort("price")}
            >
              Price {getSortIcon("price")}
            </th>
            <th
              className="sortable-header"
              onClick={() => requestSort("stock")}
            >
              Stock {getSortIcon("stock")}
            </th>
            <th>Status</th>
            <th className="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => {
              // Badge Logic
              let badgeClass = "bg-green";
              let statusText = "In Stock";
              if (product.stock === 0) {
                badgeClass = "bg-red";
                statusText = "Out of Stock";
              } else if (product.stock <= 10) {
                badgeClass = "bg-orange";
                statusText = "Low Stock";
              }

              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-name">{product.name}</span>
                    </div>
                  </td>
                  <td className="product-price">
                    ${parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="product-stock">{product.stock}</td>
                  <td>
                    <span className={`table-badge ${badgeClass}`}>
                      {statusText}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-table-icon edit"
                        onClick={() => onEdit(product)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-table-icon delete"
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
              <td colSpan="5" className="empty-state-cell">
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
