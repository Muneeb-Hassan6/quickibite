import React from "react";
import AddonGroupCard from "./Components/AddonGroupCard";
import AddonMappingModal from "./Components/AddonMappingModal";
import { useAddonGroupsManager } from "./hooks/useAddonGroupsManager";

const AddonGroupsManager = () => {
  const {
    mappings,
    categories,
    loading,
    isModalOpen,
    setIsModalOpen,
    isSaving,
    currentMapping,
    setCurrentMapping,
    isEditing,
    openModal,
    handleAddAddon,
    handleAddonChange,
    handleRemoveAddon,
    handleSave,
    handleDelete,
  } = useAddonGroupsManager();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[1.5rem] font-bold text-[var(--admin-text)]">
            Category Addon Mappings
          </h2>
          <p className="text-gray-400 text-sm">
            Assign entire menu categories (e.g. Drinks) as addons to product
            categories (e.g. Burgers).
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[var(--brand-yellow,#ef4444)] text-white px-4 py-2 rounded font-bold shadow-md hover:bg-red-600 transition cursor-pointer border-none"
        >
          + Add New Mapping
        </button>
      </div>

      {loading ? (
        <p className="text-[var(--admin-text)]">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mappings.map((mapGroup) => (
            <AddonGroupCard
              key={mapGroup.target_category}
              mapGroup={mapGroup}
              openModal={openModal}
              handleDelete={handleDelete}
            />
          ))}
          {mappings.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500 bg-[#1a1a1a] rounded-lg border border-dashed border-[#333]">
              No category mappings found. Create one to get started.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AddonMappingModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isEditing={isEditing}
        currentMapping={currentMapping}
        setCurrentMapping={setCurrentMapping}
        categories={categories}
        handleAddAddon={handleAddAddon}
        handleAddonChange={handleAddonChange}
        handleRemoveAddon={handleRemoveAddon}
        handleSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default AddonGroupsManager;
