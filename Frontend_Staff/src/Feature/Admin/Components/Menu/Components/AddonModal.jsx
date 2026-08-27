import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTimes, FaSpinner } from "react-icons/fa";
import AddonSubItemsTable from "./AddonSubItemsTable";

const AddonModal = ({ isOpen, onClose, menuItem, inventoryItems = [] }) => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && menuItem) {
      setLoading(true);
      fetch(
        `${import.meta.env.VITE_API_BASE}/get_addons.php?menu_item_id=${menuItem.id}`
      )
        .then((res) => res.json())
        .then((resData) => {
          const list = resData.data || resData.addons || [];
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((a) => ({
              addon_name: a.addon_name || "",
              addon_price: a.addon_price || "",
              inventory_id: a.inventory_id || "",
              qty: a.qty_to_deduct || "",
            }));
            setAddons(mapped);
          } else {
            setAddons([
              { addon_name: "", addon_price: "", inventory_id: "", qty: "" },
            ]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load addons", err);
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

  const handleRemoveRow = (index) => {
    const updated = addons.filter((_, i) => i !== index);
    setAddons(
      updated.length > 0
        ? updated
        : [{ addon_name: "", addon_price: "", inventory_id: "", qty: "" }]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    const filteredAddons = addons
      .filter((a) => a.addon_name.trim() !== "")
      .map((a) => ({
        addon_name: a.addon_name.trim(),
        addon_price: a.addon_price !== "" ? Number(a.addon_price) : 0,
        inventory_id: a.inventory_id ? Number(a.inventory_id) : null,
        qty: a.qty ? Number(a.qty) : null,
      }));

    const payload = {
      menu_item_id: menuItem.id,
      addons: filteredAddons,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/save_addons.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();
      if (res.ok && (result.success || result.status === "success")) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Item add-ons updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        onClose();
      } else {
        throw new Error(result.message || "Failed to save addons");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message || "Network Error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !menuItem) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-2xl bg-[var(--admin-panel,#171717)] border border-[var(--admin-border,rgba(255,255,255,0.08))] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[88vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              <h3 className="m-0 text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] font-['Oswald',sans-serif] uppercase tracking-wide">
                Custom Add-on Options
              </h3>
            </div>
            <p className="text-xs text-amber-400 font-bold mt-1 m-0">
              Product: {menuItem.name}
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--admin-muted,#888)] hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={onClose}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AddonSubItemsTable
            addons={addons}
            inventoryItems={inventoryItems}
            loading={loading}
            handleAddRow={handleAddRow}
            handleFieldChange={handleFieldChange}
            handleRemoveRow={handleRemoveRow}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--admin-border,rgba(255,255,255,0.06))]">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[var(--admin-muted,#888)] hover:text-white border border-[var(--admin-border,rgba(255,255,255,0.08))] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer transition-all flex items-center gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <FaSpinner className="animate-spin text-xs" />}
            <span>Save Add-ons</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddonModal;
