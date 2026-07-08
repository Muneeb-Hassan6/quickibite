import React, { useState } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaBookOpen,
  FaPlusCircle,
} from "react-icons/fa";

const MenuTable = ({
  menuItems,
  categories,
  onEdit,
  onDelete,
  onSetRecipe,
  onAddOns, // 🔥 Naya Prop: Add-ons manage karne ke liye
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (item.category && item.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-slide-up">
      <div className="table-controls-bar">
        <select
          className="category-filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="search-box">
          <FaSearch className="menu-search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {filteredMenuItems.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenuItems.map((item) => (
                <tr key={item.id}>
                  <td className="product-cell">
                    <img
                      src={
                        item.img || "https://via.placeholder.com/40?text=No+Img"
                      }
                      alt={item.name}
                      className="product-img-small"
                    />
                    <span className="product-name">{item.name}</span>
                  </td>
                  <td>{item.category || "Uncategorized"}</td>
                  <td>Rs {item.price}</td>
                  <td>
                    <span
                      className={`status-badge ${item.isAvailable ? "in-stock" : "out-of-stock"}`}
                    >
                      {item.isAvailable ? "IN STOCK" : "OUT OF STOCK"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {/* 🔥 1. Add-ons Button (Paise walay add-ons ke liye) */}
                    <button
                      className="action-btn addon-btn"
                      title="Add-ons / Instructions"
                      onClick={() => onAddOns(item)}
                      style={{ color: "#3b82f6" }}
                    >
                      <FaPlusCircle />
                    </button>

                    {/* 🔥 2. Recipe Button */}
                    <button
                      className="action-btn recipe-btn"
                      title="Set Recipe"
                      onClick={() => onSetRecipe(item)}
                      style={{ color: "#10b981" }}
                    >
                      <FaBookOpen />
                    </button>

                    {/* 3. Edit Button */}
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(item)}
                    >
                      <FaEdit />
                    </button>

                    {/* 4. Delete Button */}
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: "20px", color: "#888", textAlign: "center" }}>
            No matching products found.
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuTable;
