import React from "react";
import { FaTimes, FaSave, FaCube } from "react-icons/fa";

const InventoryModal = ({
  isOpen,
  onClose,
  editingProduct,
  form,
  setForm,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--admin-panel,#171717)] border border-[var(--admin-border,rgba(255,255,255,0.08))] rounded-3xl p-5 sm:p-7 shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-base sm:text-lg font-black text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              {editingProduct ? "Edit Raw Ingredient" : "Add New Raw Ingredient"}
            </h3>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--admin-muted,#888)] hover:text-white flex items-center justify-center border-none cursor-pointer"
            onClick={onClose}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Form Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider block mb-1.5">
              Ingredient Name *
            </label>
            <input
              type="text"
              required
              className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Mozzarella Cheese, Chicken Fillet, Tomato Paste"
            />
          </div>

          {/* Stock & Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider block mb-1.5">
                Current Stock *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider block mb-1.5">
                Measurement Unit *
              </label>
              <select
                className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                value={form.unit || "kg"}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option className="bg-[#171717]" value="kg">Kilograms (kg)</option>
                <option className="bg-[#171717]" value="g">Grams (g)</option>
                <option className="bg-[#171717]" value="L">Liters (L)</option>
                <option className="bg-[#171717]" value="ml">Milliliters (ml)</option>
                <option className="bg-[#171717]" value="pcs">Pieces (pcs)</option>
                <option className="bg-[#171717]" value="pack">Packs</option>
              </select>
            </div>
          </div>

          {/* Price & Threshold Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider block mb-1.5">
                Cost Price Per Unit (Rs.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                placeholder="e.g. 850.00"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider block mb-1.5">
                Low Stock Alert Threshold *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                value={form.threshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    threshold: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                placeholder="e.g. 5.00"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--admin-border,rgba(255,255,255,0.06))]">
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[var(--admin-muted,#888)] hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer flex items-center gap-2"
            >
              <FaSave className="text-xs" />
              <span>{editingProduct ? "Update Ingredient" : "Save Ingredient"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
