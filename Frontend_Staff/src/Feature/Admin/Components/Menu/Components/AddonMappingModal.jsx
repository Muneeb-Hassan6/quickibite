import React from "react";
import { FaSpinner } from "react-icons/fa";
import AddonProductLinkList from "./AddonProductLinkList";

export default function AddonMappingModal({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  currentMapping,
  setCurrentMapping,
  categories = [],
  handleAddAddon,
  handleAddonChange,
  handleRemoveAddon,
  handleSave,
  isSaving,
}) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="bg-[var(--admin-bg,#141414)] rounded-xl w-[95%] max-w-[600px] max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isEditing ? "Edit Category Mappings" : "Create Category Mapping"}
        </h2>

        <div className="flex flex-col gap-6">
          {/* Target Category */}
          <div>
            <label className="text-gray-300 text-sm mb-1 block">
              Target Product Category (e.g. Burgers)
            </label>
            <select
              value={currentMapping.target_category}
              onChange={(e) =>
                setCurrentMapping({
                  ...currentMapping,
                  target_category: e.target.value,
                })
              }
              disabled={isEditing}
              className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded px-3 py-2 outline-none focus:border-red-500 disabled:opacity-50"
            >
              <option value="">-- Select Target Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {isEditing && (
              <span className="text-xs text-gray-500 mt-1 block">
                Target category cannot be changed when editing.
              </span>
            )}
          </div>

          <hr className="border-[#333]" />

          {/* Addon Categories Repeater */}
          <AddonProductLinkList
            addons={currentMapping.addons}
            categories={categories}
            targetCategory={currentMapping.target_category}
            handleAddAddon={handleAddAddon}
            handleAddonChange={handleAddonChange}
            handleRemoveAddon={handleRemoveAddon}
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-gray-400 hover:text-white font-bold bg-transparent border-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2 cursor-pointer border-none"
          >
            {isSaving ? (
              <FaSpinner className="animate-spin" />
            ) : (
              "Save Mappings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
