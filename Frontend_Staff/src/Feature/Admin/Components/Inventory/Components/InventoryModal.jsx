import React from "react";
import { FaTimes } from "react-icons/fa";

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
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.6)] backdrop-blur-[5px] flex justify-center items-center z-[9999]" onClick={onClose}>
      <div
        className="bg-[var(--admin-panel)] w-[90%] !max-w-[500px] rounded-[16px] p-[25px] shadow-[0_10px_25px_rgba(0,0,0,0.5)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-[20px] pb-[15px] ">
          <h3 className="text-[18px] font-extrabold text-[var(--admin-text)] m-0 uppercase tracking-[1px] font-oswald">
            {editingProduct ? "Edit Ingredient" : "Add New Ingredient"}
          </h3>
          <button className="bg-transparent border-none text-[var(--admin-muted)] text-[20px] cursor-pointer transition-all duration-200 hover:text-[var(--admin-orange)]" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* FORM FIELDS */}
        <div className="flex flex-col gap-[15px]">
          <div className="mb-[15px]">
            <label className="block text-[13px] font-bold mb-[8px] text-[var(--admin-muted)]">Ingredient Name</label>
            <input
              type="text"
              className="w-full bg-[rgba(255,255,255,0.03)] p-[14px] rounded-[10px] text-[var(--admin-text)] outline-none text-[14px] transition-all duration-300 focus:bg-[var(--admin-panel)]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Chicken Breast, Cheddar Cheese..."
            />
          </div>

          {/* STOCK & UNIT ROW */}
          <div className="flex gap-[15px] w-full">
            <div className="flex-1 min-w-0">
              <label className="block text-[13px] font-bold mb-[8px] text-[var(--admin-muted)]">Current Stock</label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-[rgba(255,255,255,0.03)] p-[14px] rounded-[10px] text-[var(--admin-text)] outline-none text-[14px] transition-all duration-300 focus:bg-[var(--admin-panel)]"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-[13px] font-bold mb-[8px] text-[var(--admin-muted)]">Unit</label>
              <select
                className="w-full bg-[rgba(255,255,255,0.03)] p-[14px] rounded-[10px] text-[var(--admin-text)] outline-none text-[14px] transition-all duration-300 focus:bg-[var(--admin-panel)]"
                value={form.unit || "kg"}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="pack">Packs</option>
              </select>
            </div>
          </div>

          {/* PRICE & THRESHOLD ROW */}
          <div className="flex gap-[15px] w-full">
            <div className="flex-1 min-w-0">
              <label className="block text-[13px] font-bold mb-[8px] text-[var(--admin-muted)]">Unit Price (Rs)</label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-[rgba(255,255,255,0.03)] p-[14px] rounded-[10px] text-[var(--admin-text)] outline-none text-[14px] transition-all duration-300 focus:bg-[var(--admin-panel)]"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g., 500"
              />
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-[13px] font-bold mb-[8px] text-[var(--admin-muted)]">Low Stock Alert (Threshold)</label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-[rgba(255,255,255,0.03)] p-[14px] rounded-[10px] text-[var(--admin-text)] outline-none text-[14px] transition-all duration-300 focus:border-[var(--admin-orange)] focus:bg-[var(--admin-panel)]"
                value={form.threshold}
                onChange={(e) =>
                  setForm({ ...form, threshold: e.target.value })
                }
                placeholder="e.g., 5"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS (Fixed Layout) */}
        <div className="mt-[30px] pt-[20px] flex justify-end items-center gap-[15px] w-full">
          <button className="bg-transparent text-[var(--admin-text)] border border-[var(--admin-border)] p-[10px_20px] rounded font-bold cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:border-[var(--admin-text)]" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-gradient-to-r from-[var(--admin-orange)] to-[#b91c1c] text-white border-none p-[10px_20px] rounded font-bold cursor-pointer transition-all duration-200 shadow-[var(--shadow-glow)] hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)]" onClick={onSave}>
            {editingProduct ? "Update Ingredient" : "Save Ingredient"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
