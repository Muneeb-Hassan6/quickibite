import React from "react";
import { FaUtensils, FaPlus, FaTrash, FaSlidersH } from "react-icons/fa";

export default function DealSelectedItemsTable({
  includedItems = [],
  handleAddItemRow,
  handleRemoveItemRow,
  handleItemChange,
  handleQuickSelectMenu,
  menuItems = [],
}) {
  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FaUtensils className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
            2. Bundled Food Items ({includedItems.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={handleAddItemRow}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shadow-sm transition-all active:scale-95"
        >
          <FaPlus className="text-[10px]" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Repeater List */}
      <div className="space-y-3">
        {includedItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3 hover:border-amber-500/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Large Pizza, Zinger Burger"
                  value={item.item_title}
                  onChange={(e) =>
                    handleItemChange(idx, "item_title", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="w-full sm:w-20">
                <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1 text-center">
                  Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(idx, "quantity", e.target.value)
                  }
                  className="w-full p-2 bg-white dark:bg-black/40 text-amber-600 dark:text-amber-400 text-center font-black rounded-xl border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="w-full sm:w-44">
                <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                  Auto-fill from Menu
                </label>
                <select
                  onChange={(e) => handleQuickSelectMenu(idx, e.target.value)}
                  defaultValue=""
                  className="w-full p-2 bg-white dark:bg-black/40 text-slate-900 dark:text-neutral-300 rounded-xl border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option className="bg-white dark:bg-[#171717]" value="">
                    -- Pick Product --
                  </option>
                  {menuItems.map((m) => (
                    <option
                      className="bg-white dark:bg-[#171717]"
                      key={m.id}
                      value={m.id}
                    >
                      {m.name || m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="self-end sm:self-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => handleRemoveItemRow(idx)}
                  className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                  title="Remove Item"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            </div>

            {/* Customizable Flavor Choices */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-600 dark:text-amber-400">
                <input
                  type="checkbox"
                  checked={item.is_customizable}
                  onChange={(e) =>
                    handleItemChange(
                      idx,
                      "is_customizable",
                      e.target.checked
                    )
                  }
                  className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <FaSlidersH className="text-[10px]" /> Customer Can Choose
                  Flavor / Drink
                </span>
              </label>

              {item.is_customizable && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">
                      Choice Group Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Select Pizza Flavor"
                      value={item.choice_group_name || ""}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "choice_group_name",
                          e.target.value
                        )
                      }
                      className="w-full p-2 bg-white dark:bg-black/50 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">
                      Comma-Separated Options
                    </label>
                    <input
                      type="text"
                      placeholder="Fajita, Tikka, Pepperoni, Veggie"
                      value={item.options_str || ""}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "options_str",
                          e.target.value
                        )
                      }
                      className="w-full p-2 bg-white dark:bg-black/50 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
