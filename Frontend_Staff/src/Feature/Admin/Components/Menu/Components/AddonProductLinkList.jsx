import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function AddonProductLinkList({
  addons = [],
  categories = [],
  targetCategory = "",
  handleAddAddon,
  handleAddonChange,
  handleRemoveAddon,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="text-gray-300 text-sm block font-bold">
          Addon Categories to Assign
        </label>
        <button
          type="button"
          onClick={handleAddAddon}
          className="text-red-500 text-sm font-bold flex items-center gap-1 hover:text-red-400 bg-transparent border-none cursor-pointer"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {addons.map((addon, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 bg-[#1a1a1a] p-3 rounded border border-[#333]"
          >
            <div className="flex justify-between">
              <label className="text-xs text-gray-400">Addon Category</label>
              <button
                type="button"
                onClick={() => handleRemoveAddon(index)}
                className="text-gray-500 hover:text-red-500 text-xs flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <FaTrash /> Remove
              </button>
            </div>
            <select
              value={addon.addon_category}
              onChange={(e) =>
                handleAddonChange(index, "addon_category", e.target.value)
              }
              className="w-full bg-[#222] text-white border border-[#444] rounded px-2 py-2 outline-none text-sm"
            >
              <option value="">-- Select Category (e.g. Drinks) --</option>
              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.name}
                  disabled={cat.name === targetCategory}
                >
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="mt-1">
              <label className="text-xs text-gray-400 mb-1 block">
                Custom Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Complete your meal with a Drink!"
                value={addon.custom_label || ""}
                onChange={(e) =>
                  handleAddonChange(index, "custom_label", e.target.value)
                }
                className="w-full bg-[#222] text-white border border-[#444] rounded px-2 py-1 outline-none text-sm"
              />
            </div>

            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">
                  Selection Type
                </label>
                <select
                  value={addon.selection_type}
                  onChange={(e) =>
                    handleAddonChange(index, "selection_type", e.target.value)
                  }
                  className="w-full bg-[#222] text-white border border-[#444] rounded px-2 py-1 outline-none text-sm"
                >
                  <option value="single_choice">Single Choice (Radio)</option>
                  <option value="multiple_choice">
                    Multiple Choice (Checkbox)
                  </option>
                </select>
              </div>
              <div className="flex-1 flex items-center pt-4">
                <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addon.is_required}
                    onChange={(e) =>
                      handleAddonChange(index, "is_required", e.target.checked)
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  Is Required?
                </label>
              </div>
            </div>
          </div>
        ))}
        {addons.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-6 italic border border-dashed border-[#333] rounded">
            No addon categories mapped yet. Click "Add Category".
          </p>
        )}
      </div>
    </div>
  );
}
