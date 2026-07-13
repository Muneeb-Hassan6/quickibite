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
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[9999]">
      <div className="w-[90%] max-w-[46.875rem] bg-[var(--admin-bg,#141414)] border border-[var(--admin-border,#222)] rounded-[1rem] p-[1.563rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative animate-slide-up">
        <div className="flex justify-between items-center mb-[1.563rem] w-full">
          <h3 className="uppercase flex items-center gap-[0.625rem] text-white m-0 text-[1.25rem] font-black">Add-ons for {menuItem.name}</h3>
          <button className="bg-transparent border-none text-[#949191] text-[1.25rem] cursor-pointer transition-colors duration-300 hover:text-white static !m-0" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            addons.map((addon, index) => (
              <div key={index} className="flex gap-[0.75rem] mb-[0.75rem] items-center">
                <input
                  type="text"
                  placeholder="Name (e.g. Extra Cheese)"
                  className="flex-[2] h-[3rem] w-full bg-[#111] border border-[#333] text-white px-[0.938rem] rounded-[0.5rem] outline-none focus:border-[#ef4444]"
                  value={addon.addon_name}
                  onChange={(e) =>
                    handleFieldChange(index, "addon_name", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="flex-1 h-[3rem] w-full bg-[#111] border border-[#333] text-white px-[0.938rem] rounded-[0.5rem] outline-none focus:border-[#ef4444]"
                  value={addon.addon_price}
                  onChange={(e) =>
                    handleFieldChange(index, "addon_price", e.target.value)
                  }
                />
                <select
                  className="flex-[2] h-[3rem] w-full bg-[#111] border border-[#333] text-white px-[0.938rem] rounded-[0.5rem] outline-none cursor-pointer focus:border-[#ef4444]"
                  value={addon.inventory_id}
                  onChange={(e) =>
                    handleFieldChange(index, "inventory_id", e.target.value)
                  }
                >
                  <option className="bg-[#111] text-white" value="">Link Inventory</option>
                  {inventoryItems.map((inv) => (
                    <option className="bg-[#111] text-white" key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  className="flex-[0.8] h-[3rem] w-full bg-[#111] border border-[#333] text-white px-[0.938rem] rounded-[0.5rem] outline-none focus:border-[#ef4444]"
                  value={addon.qty}
                  onChange={(e) =>
                    handleFieldChange(index, "qty", e.target.value)
                  }
                />
                <button
                  onClick={() =>
                    setAddons(addons.filter((_, i) => i !== index))
                  }
                  className="bg-transparent border-none text-[#888] text-[1.125rem] cursor-pointer transition-all duration-200 flex items-center justify-center px-[0.625rem] h-[3rem] hover:text-[#ef4444] hover:scale-125"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}

          <button className="bg-[rgba(255,255,255,0.05)] text-white border border-dashed border-[#555] px-[1.25rem] py-[0.75rem] rounded-[0.5rem] text-[0.875rem] font-semibold inline-flex items-center gap-[0.5rem] transition-all duration-300 mt-[0.938rem] cursor-pointer hover:bg-[rgba(239,68,68,0.1)] hover:border-[#ef4444] hover:text-[#ef4444] hover:-translate-y-[2px]" onClick={handleAddRow}>
            <FaPlus /> Add Option
          </button>
        </div>

        {/* 🔥 4. Save Button UI Logic */}
        <button
          className="mt-[1.563rem] w-full bg-[var(--brand-red,#ef4444)] text-white border-none p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-[0.625rem]"
          onClick={handleSave}
          disabled={isSaving} // Jab save ho raha ho toh button click hona band ho jaye
        >
          {isSaving ? (
            <>
              <FaSpinner className="animate-spin" /> Saving...
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
