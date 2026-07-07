import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
// 🔥 FaSpinner ko import me add kar liya
import { FaTimes, FaPlus, FaTrash, FaSpinner } from "react-icons/fa";

const AddonModal = ({ isOpen, onClose, menuItem, inventoryItems }) => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 1. Naya state loader ko control karne ke liye
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && menuItem) {
      setLoading(true);
      fetch(
        `${import.meta.env.VITE_API_BASE}/get_addons.php?menu_item_id=${menuItem.id}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.addons.length > 0) {
            const mapped = data.addons.map((a) => ({
              addon_name: a.addon_name,
              addon_price: a.addon_price,
              inventory_id: a.inventory_id,
              qty: a.qty_to_deduct,
            }));
            setAddons(mapped);
          } else {
            setAddons([
              { addon_name: "", addon_price: "", inventory_id: "", qty: "" },
            ]);
          }
          setLoading(false);
        });
    }
  }, [isOpen, menuItem]);

  const handleAddRow = () => {
    setAddons([
      ...addons,
      { addon_name: "", addon_price: "", inventory_id: "", qty: "" },
    ]);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...addons];
    updated[index][field] = value;
    setAddons(updated);
  };

  const handleSave = async () => {
    // 🔥 2. API hit hone se pehle loader On karein
    setIsSaving(true);

    const payload = {
      menu_item_id: menuItem.id,
      addons: addons.filter((a) => a.addon_name !== ""),
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/save_addons.php`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Saved!", timer: 1500 });
        onClose();
      }
    } catch (error) {
      console.error("Save failed", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save addons",
      });
    } finally {
      // 🔥 3. Save ho jaye ya error aye, dono suraton me loader Off kar dein
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pos-modal-overlay">
      <div className="pos-modal-box addon-modal-container">
        <div className="pos-modal-header">
          <h3 className="pos-modal-title">Add-ons for {menuItem.name}</h3>
          <button className="btn-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="pos-modal-section">
          {loading ? (
            <p>Loading...</p>
          ) : (
            addons.map((addon, index) => (
              <div key={index} className="addon-row">
                <input
                  type="text"
                  placeholder="Name (e.g. Extra Cheese)"
                  className="pos-custom-note-input addon-name-input"
                  value={addon.addon_name}
                  onChange={(e) =>
                    handleFieldChange(index, "addon_name", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="pos-custom-note-input addon-price-input"
                  value={addon.addon_price}
                  onChange={(e) =>
                    handleFieldChange(index, "addon_price", e.target.value)
                  }
                />
                <select
                  className="pos-category-dropdown addon-inv-select"
                  value={addon.inventory_id}
                  onChange={(e) =>
                    handleFieldChange(index, "inventory_id", e.target.value)
                  }
                >
                  <option value="">Link Inventory</option>
                  {inventoryItems.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  className="pos-custom-note-input addon-qty-input"
                  value={addon.qty}
                  onChange={(e) =>
                    handleFieldChange(index, "qty", e.target.value)
                  }
                />
                <button
                  onClick={() =>
                    setAddons(addons.filter((_, i) => i !== index))
                  }
                  className="btn-cart-remove"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}

          <button className="btn-add-row" onClick={handleAddRow}>
            <FaPlus /> Add Option
          </button>
        </div>

        {/* 🔥 4. Save Button UI Logic */}
        <button
          className="btn-confirm-add addon-save-btn"
          onClick={handleSave}
          disabled={isSaving} // Jab save ho raha ho toh button click hona band ho jaye
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {isSaving ? (
            <>
              <FaSpinner className="spin-animation" /> Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddonModal;
