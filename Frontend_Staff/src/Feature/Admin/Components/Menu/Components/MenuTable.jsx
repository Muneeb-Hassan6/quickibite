import React, { useState } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaBookOpen,
  FaLayerGroup,
  FaUtensils,
} from "react-icons/fa";
import { resolveImageUrl } from "../../../../../utils/imageOptimizer";

const MenuTable = ({
  menuItems = [],
  categories = [],
  onEdit,
  onDelete,
  onSetRecipe,
  onAddOns,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (item.category && item.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-slide-up space-y-4">
      {/* Responsive Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-[var(--panel-bg)] p-3 sm:p-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <select
          className="bg-[var(--input-bg)] text-[var(--text-primary)] p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer outline-none w-full sm:w-56 border border-[var(--border-subtle)] focus:border-amber-500 transition-colors"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option className="bg-[var(--panel-bg)] text-[var(--text-primary)]" value="All">
            All Categories ({menuItems.length})
          </option>
          {categories.map((cat) => (
            <option className="bg-[var(--panel-bg)] text-[var(--text-primary)]" key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex items-center bg-[var(--input-bg)] px-3 py-1 rounded-xl border border-[var(--border-subtle)] focus-within:border-amber-500 transition-colors w-full sm:w-72">
          <FaSearch className="text-[var(--text-muted)] text-sm mr-2.5 shrink-0" />
          <input
            className="bg-transparent border-none text-[var(--text-primary)] py-2 text-xs sm:text-sm outline-none w-full placeholder-[var(--text-muted)] font-medium"
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--panel-bg)] rounded-2xl border border-[var(--border-subtle)] overflow-x-auto shadow-sm">
        {filteredMenuItems.length > 0 ? (
          <table className="w-full border-collapse text-left text-[var(--text-primary)] min-w-[660px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--table-header-bg)]">
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider">
                  Product
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider">
                  Category
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider">
                  Base Price
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider">
                  Stock Status
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredMenuItems.map((item) => {
                const displayPrice = item.price ?? item.variants?.[0]?.price ?? 0;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--table-row-hover)] transition-all group"
                  >
                    <td className="p-3.5 sm:p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/10 dark:bg-black/40 border border-[var(--border-subtle)] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          <img
                            src={resolveImageUrl(item.img, 100)}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/100x100?text=No+Img";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-sm text-[var(--text-primary)] block truncate">
                            {item.name}
                          </span>
                          {item.variants && item.variants.length > 1 ? (
                            <span className="text-[10px] text-amber-500 font-bold block mt-0.5">
                              {item.variants.length} Variants Available
                            </span>
                          ) : (
                            <span className="text-[10px] text-[var(--text-secondary)] font-semibold block mt-0.5">
                              ID: #{item.id}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4 align-middle text-xs sm:text-sm font-semibold">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs">
                        {item.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 align-middle text-xs sm:text-sm font-black text-amber-500 font-mono">
                      Rs. {Number(displayPrice).toLocaleString()}
                    </td>
                    <td className="p-3.5 sm:p-4 align-middle">
                      <span
                        className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                          item.isAvailable
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                        }`}
                      >
                        {item.isAvailable ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        {/* Add-ons Button */}
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl flex justify-center items-center cursor-pointer transition-all bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-neutral-950 border border-amber-500/20 shadow-sm active:scale-90"
                          title="Manage Add-on Groups"
                          onClick={() => onAddOns(item)}
                        >
                          <FaLayerGroup className="text-xs" />
                        </button>

                        {/* Recipe Button */}
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl flex justify-center items-center cursor-pointer transition-all bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 shadow-sm active:scale-90"
                          title="Inventory Recipe & Portions"
                          onClick={() => onSetRecipe(item)}
                        >
                          <FaUtensils className="text-xs" />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl flex justify-center items-center cursor-pointer transition-all bg-[var(--input-bg)] hover:bg-amber-500 hover:text-neutral-950 text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-sm active:scale-90"
                          title="Edit Item"
                          onClick={() => onEdit(item)}
                        >
                          <FaEdit className="text-xs" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl flex justify-center items-center cursor-pointer transition-all bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20 shadow-sm active:scale-90"
                          title="Delete Item"
                          onClick={() => onDelete(item.id)}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            <p className="text-sm font-semibold">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuTable;
