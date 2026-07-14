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
      <div className="flex justify-between items-center mb-[0.938rem] gap-[0.938rem] bg-[var(--admin-panel,#141414)] p-[0.75rem_1.25rem] rounded-[0.75rem]">
        <select
          className="bg-[rgba(255,255,255,0.05)] text-[var(--admin-text)] p-[0.625rem_0.938rem] rounded-[0.5rem] text-[0.875rem] font-semibold cursor-pointer outline-none min-w-[11.25rem] transition-all duration-300 focus:border-[var(--admin-orange)] focus:bg-[var(--admin-bg)]"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option className="bg-[var(--admin-panel)] text-[var(--admin-text)]" value="All">All Categories</option>
          {categories.map((cat) => (
            <option className="bg-[var(--admin-panel)] text-[var(--admin-text)]" key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex items-center bg-[rgba(255,255,255,0.03)] px-[0.938rem] rounded-[0.5rem] transition-all duration-300 w-[18.75rem] focus-within:border-[var(--admin-orange)] focus-within:bg-[var(--admin-bg)]">
          <FaSearch className="text-[#888] text-[1rem] mr-[0.625rem] block" />
          <input
            className="bg-transparent border-none text-[var(--admin-text)] py-[0.625rem] text-[0.875rem] outline-none w-full"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[var(--admin-panel,#141414)] rounded-[0.75rem] overflow-x-auto mt-[0.625rem]">
        {filteredMenuItems.length > 0 ? (
          <table className="w-full border-collapse text-left text-[var(--admin-text)]">
            <thead>
              <tr>
                <th className="p-[1rem_1.25rem] text-[0.813rem] uppercase text-[var(--admin-muted)] border-b border-[var(--admin-border)] font-extrabold tracking-[0.5px]">PRODUCT</th>
                <th className="p-[1rem_1.25rem] text-[0.813rem] uppercase text-[var(--admin-muted)] border-b border-[var(--admin-border)] font-extrabold tracking-[0.5px]">CATEGORY</th>
                <th className="p-[1rem_1.25rem] text-[0.813rem] uppercase text-[var(--admin-muted)] border-b border-[var(--admin-border)] font-extrabold tracking-[0.5px]">PRICE</th>
                <th className="p-[1rem_1.25rem] text-[0.813rem] uppercase text-[var(--admin-muted)] border-b border-[var(--admin-border)] font-extrabold tracking-[0.5px]">STATUS</th>
                <th className="p-[1rem_1.25rem] text-[0.813rem] uppercase text-[#888] border-b border-[#222] font-extrabold tracking-[0.5px] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenuItems.map((item) => (
                <tr key={item.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200">
                  <td className="p-[1rem_1.25rem] align-middle text-[0.938rem] font-bold">
                    <div className="flex items-center gap-[0.938rem]">
                      <img
                        src={
                          item.img || "https://via.placeholder.com/40?text=No+Img"
                        }
                        alt={item.name}
                        className="w-[2.813rem] h-[2.813rem] rounded-[0.5rem] object-cover bg-[var(--admin-bg)]"
                      />
                      <span className="font-extrabold text-[0.938rem] text-[var(--admin-text)]">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-[1rem_1.25rem] align-middle text-[0.938rem] font-bold">{item.category || "Uncategorized"}</td>
                  <td className="p-[1rem_1.25rem] align-middle text-[0.938rem] font-bold">Rs {item.price}</td>
                  <td className="p-[1rem_1.25rem] align-middle text-[0.938rem] font-bold">
                    <span
                      className={`py-[0.313rem] px-[0.625rem] rounded-[1.25rem] text-[0.688rem] font-extrabold uppercase tracking-[0.5px] inline-block ${item.isAvailable ? "bg-[#10b981] text-white" : "bg-[#ef4444] text-white"}`}
                    >
                      {item.isAvailable ? "IN STOCK" : "OUT OF STOCK"}
                    </span>
                  </td>
                  <td className="p-[1rem_1.25rem] align-middle border-b border-[var(--admin-border)] text-[0.938rem] font-bold">
                    <div className="flex justify-end gap-[0.75rem]">
                      {/* 🔥 1. Add-ons Button (Paise walay add-ons ke liye) */}
                      <button
                        className="w-[2.25rem] h-[2.25rem] rounded flex justify-center items-center cursor-pointer transition-all duration-200 bg-[rgba(255,255,255,0.05)] text-[0.938rem] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.15)] hover:border-[#3b82f6] hover:text-[#60a5fa] hover:scale-110"
                        title="Add-ons / Instructions"
                        onClick={() => onAddOns(item)}
                      >
                        <FaPlusCircle />
                      </button>

                      {/* 🔥 2. Recipe Button */}
                      <button
                        className="w-[2.25rem] h-[2.25rem] rounded flex justify-center items-center cursor-pointer transition-all duration-200 bg-[rgba(255,255,255,0.05)] text-[0.938rem] text-[#10b981] hover:bg-[rgba(16,185,129,0.15)] hover:border-[#10b981] hover:text-[#34d399] hover:scale-110"
                        title="Set Recipe"
                        onClick={() => onSetRecipe(item)}
                      >
                        <FaBookOpen />
                      </button>

                      {/* 3. Edit Button */}
                      <button
                        className="w-[2.25rem] h-[2.25rem] rounded flex justify-center items-center cursor-pointer transition-all duration-200 bg-[rgba(255,255,255,0.05)] text-[0.938rem] text-[#9ca3af] hover:bg-[var(--admin-panel)] hover:border-[var(--admin-text)] hover:text-[var(--admin-text)] hover:scale-110"
                        onClick={() => onEdit(item)}
                      >
                        <FaEdit />
                      </button>

                      {/* 4. Delete Button */}
                      <button
                        className="w-[2.25rem] h-[2.25rem] rounded flex justify-center items-center cursor-pointer transition-all duration-200 bg-[rgba(255,255,255,0.05)] text-[0.938rem] text-[#ef4444] hover:bg-[rgba(239,68,68,0.15)] hover:border-[#ef4444] hover:text-[#f87171] hover:scale-110"
                        onClick={() => onDelete(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
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
