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
      <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
        {filteredMenuItems.length > 0 ? (
          <div className="table-responsive-container">
            <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-[var(--text-primary)]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
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
              <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
                {filteredMenuItems.map((item) => {
                  const displayPrice = item.price ?? item.variants?.[0]?.price ?? 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group"
                    >
                      <td className="p-3.5 sm:p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-black/10 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                            <img
                              src={resolveImageUrl(item.img, 100)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/100x100?text=Food";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-[var(--text-primary)] block truncate">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)] block truncate max-w-[200px]">
                              {item.description || "No description provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 sm:p-4 align-middle">
                        <span className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {item.category || "Unassigned"}
                        </span>
                      </td>

                      <td className="p-3.5 sm:p-4 align-middle font-black text-amber-600 dark:text-amber-400 font-mono">
                        Rs. {Number(displayPrice).toLocaleString()}
                      </td>

                      <td className="p-3.5 sm:p-4 align-middle">
                        <span
                          className={`!rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider inline-block ${
                            item.isAvailable
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {item.isAvailable ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>

                      <td className="p-3.5 sm:p-4 align-middle text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 cursor-pointer transition-all shadow-sm"
                            title="Manage Recipe"
                            onClick={() => onSetRecipe(item)}
                          >
                            <FaBookOpen className="text-xs" />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 cursor-pointer transition-all shadow-sm"
                            title="Manage Addons"
                            onClick={() => onAddOns(item)}
                          >
                            <FaLayerGroup className="text-xs" />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-500/20 cursor-pointer transition-all shadow-sm"
                            title="Edit Item"
                            onClick={() => onEdit(item)}
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 cursor-pointer transition-all shadow-sm"
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
          </div>
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
