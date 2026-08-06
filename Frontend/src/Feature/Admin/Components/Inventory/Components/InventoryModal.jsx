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
    <div className="admin-modal-overlay override-zindex" onClick={onClose}>
      <div
        className="admin-modal-box inventory-modal-box animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-header-flex">
          <h3 className="modal-title">
            {editingProduct ? "Edit Ingredient" : "Add New Ingredient"}
          </h3>
          <button className="btn-close-modal-clean" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* FORM FIELDS */}
        <div className="modal-form-layout">
          <div className="admin-input-group">
            <label>Ingredient Name</label>
            <input
              type="text"
              className="admin-input-field custom-admin-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Chicken Breast, Cheddar Cheese..."
            />
          </div>

          {/* STOCK & UNIT ROW */}
          <div className="modal-form-row">
            <div className="admin-input-group input-col">
              <label>Current Stock</label>
              <input
                type="number"
                step="0.01"
                className="admin-input-field custom-admin-input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="admin-input-group input-col">
              <label>Unit</label>
              <select
                className="admin-input-field custom-admin-input"
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
          <div className="modal-form-row">
            <div className="admin-input-group input-col">
              <label>Unit Price (Rs)</label>
              <input
                type="number"
                step="0.01"
                className="admin-input-field custom-admin-input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g., 500"
              />
            </div>

            <div className="admin-input-group input-col">
              <label>Low Stock Alert (Threshold)</label>
              <input
                type="number"
                step="0.01"
                className="admin-input-field custom-admin-input"
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
        <div className="modal-footer-actions">
          <button className="btn-cancel-modal-clean" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save-modal-clean" onClick={onSave}>
            {editingProduct ? "Update Ingredient" : "Save Ingredient"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
