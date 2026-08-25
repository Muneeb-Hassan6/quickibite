import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaTrash, FaEdit, FaSpinner } from "react-icons/fa";

const AddonGroupsManager = () => {
  const [mappings, setMappings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentMapping, setCurrentMapping] = useState({
    target_category: "",
    addons: [], // array of { addon_category, selection_type, is_required }
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mapsRes, catRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE}/addon_groups.php`),
        fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`),
      ]);

      const mapsData = await mapsRes.json();
      if (mapsData.status === "success") setMappings(mapsData.category_addons);

      const catData = await catRes.json();
      if (Array.isArray(catData)) setCategories(catData);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mapping = null) => {
    if (mapping) {
      setCurrentMapping({
        target_category: mapping.target_category,
        addons: mapping.addons || [],
      });
      setIsEditing(true);
    } else {
      setCurrentMapping({
        target_category: "",
        addons: [],
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleAddAddon = () => {
    setCurrentMapping({
      ...currentMapping,
      addons: [
        ...currentMapping.addons,
        { addon_category: "", selection_type: "multiple_choice", is_required: false, custom_label: "" },
      ],
    });
  };

  const handleAddonChange = (index, field, value) => {
    const updated = [...currentMapping.addons];
    updated[index][field] = value;
    setCurrentMapping({ ...currentMapping, addons: updated });
  };

  const handleRemoveAddon = (index) => {
    const updated = currentMapping.addons.filter((_, i) => i !== index);
    setCurrentMapping({ ...currentMapping, addons: updated });
  };

  const handleSave = async () => {
    if (!currentMapping.target_category) {
      Swal.fire("Error", "Please select a Target Category", "error");
      return;
    }
    
    // Validate empty addons
    for (let i=0; i<currentMapping.addons.length; i++) {
        if (!currentMapping.addons[i].addon_category) {
            Swal.fire("Error", "Please select an Addon Category for all rows", "error");
            return;
        }
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/addon_groups.php`, {
        method: "POST",
        body: JSON.stringify({ action: "save_mapping", ...currentMapping }),
      });
      const data = await res.json();
      if (data.status === "success") {
        Swal.fire("Saved", "Category Addons saved successfully", "success");
        setIsModalOpen(false);
        fetchData();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save category addons", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (target_category) => {
    if (await Swal.fire({ title: "Are you sure?", showCancelButton: true, confirmButtonText: "Delete" }).then(res => res.isConfirmed)) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/addon_groups.php`, {
          method: "POST",
          body: JSON.stringify({ action: "delete_mapping", target_category }),
        });
        const data = await res.json();
        if (data.status === "success") {
          Swal.fire("Deleted", "Mapping deleted", "success");
          fetchData();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-[1.5rem] font-bold text-[var(--admin-text)]">Category Addon Mappings</h2>
            <p className="text-gray-400 text-sm">Assign entire menu categories (e.g. Drinks) as addons to product categories (e.g. Burgers).</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[var(--brand-yellow,#ef4444)] text-white px-4 py-2 rounded font-bold shadow-md hover:bg-red-600 transition"
        >
          + Add New Mapping
        </button>
      </div>

      {loading ? (
        <p className="text-[var(--admin-text)]">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mappings.map((mapGroup) => (
            <div key={mapGroup.target_category} className="bg-[var(--panel-bg,#1a1a1a)] border border-[#333] p-5 rounded-lg shadow-lg relative">
              <div className="flex justify-between items-start mb-4 border-b border-[#333] pb-3">
                <div>
                    <span className="text-gray-400 text-xs uppercase tracking-widest block mb-1">Target Category</span>
                    <h3 className="text-xl font-bold text-white m-0">{mapGroup.target_category}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(mapGroup)} className="text-blue-400 hover:text-blue-300"><FaEdit /></button>
                  <button onClick={() => handleDelete(mapGroup.target_category)} className="text-red-500 hover:text-red-400"><FaTrash /></button>
                </div>
              </div>
              
              <div>
                <strong className="text-white text-sm mb-2 block">Available Addon Categories:</strong>
                {mapGroup.addons.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {mapGroup.addons.map((a, i) => (
                      <React.Fragment key={i}>
                        <div className="bg-[#222] border border-[#444] p-2 rounded text-sm flex justify-between items-center">
                          <span className="font-bold text-white">{a.addon_category}</span>
                          <div className="text-xs text-gray-400 text-right">
                            <span className={a.is_required ? "text-red-400" : ""}>{a.is_required ? "Required" : "Optional"}</span>
                            <br/>
                            <span>{a.selection_type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}</span>
                          </div>
                        </div>
                        {a.custom_label && (
                          <div className="text-xs text-gray-500 mt-1 italic pl-2 border-l-2 border-[#555]">
                            Label: {a.custom_label}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">No addons mapped.</span>
                )}
              </div>
            </div>
          ))}
          {mappings.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500 bg-[#1a1a1a] rounded-lg border border-dashed border-[#333]">
              No category mappings found. Create one to get started.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-[var(--admin-bg,#141414)] rounded-xl w-[95%] max-w-[600px] max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-white mb-6">
              {isEditing ? "Edit Category Mappings" : "Create Category Mapping"}
            </h2>

            <div className="flex flex-col gap-6">
              {/* Target Category */}
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Target Product Category (e.g. Burgers)</label>
                <select
                  value={currentMapping.target_category}
                  onChange={(e) => setCurrentMapping({ ...currentMapping, target_category: e.target.value })}
                  disabled={isEditing}
                  className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded px-3 py-2 outline-none focus:border-red-500 disabled:opacity-50"
                >
                  <option value="">-- Select Target Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {isEditing && <span className="text-xs text-gray-500 mt-1 block">Target category cannot be changed when editing.</span>}
              </div>

              <hr className="border-[#333]" />

              {/* Addon Categories */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-gray-300 text-sm block font-bold">Addon Categories to Assign</label>
                  <button onClick={handleAddAddon} className="text-red-500 text-sm font-bold flex items-center gap-1 hover:text-red-400">
                    <FaPlus /> Add Category
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {currentMapping.addons.map((addon, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-[#1a1a1a] p-3 rounded border border-[#333]">
                      <div className="flex justify-between">
                          <label className="text-xs text-gray-400">Addon Category</label>
                          <button onClick={() => handleRemoveAddon(index)} className="text-gray-500 hover:text-red-500 text-xs flex items-center gap-1">
                            <FaTrash /> Remove
                          </button>
                      </div>
                      <select
                        value={addon.addon_category}
                        onChange={(e) => handleAddonChange(index, "addon_category", e.target.value)}
                        className="w-full bg-[#222] text-white border border-[#444] rounded px-2 py-2 outline-none text-sm"
                      >
                        <option value="">-- Select Category (e.g. Drinks) --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name} disabled={cat.name === currentMapping.target_category}>{cat.name}</option>
                        ))}
                      </select>

                      <div className="mt-1">
                        <label className="text-xs text-gray-400 mb-1 block">Custom Label (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Complete your meal with a Drink!"
                          value={addon.custom_label || ""}
                          onChange={(e) => handleAddonChange(index, "custom_label", e.target.value)}
                          className="w-full bg-[#222] text-white border border-[#444] rounded px-2 py-1 outline-none text-sm"
                        />
                      </div>

                      <div className="flex gap-4 mt-2">
                          <div className="flex-1">
                              <label className="text-xs text-gray-400 mb-1 block">Selection Type</label>
                              <select
                                value={addon.selection_type}
                                onChange={(e) => handleAddonChange(index, "selection_type", e.target.value)}
                                className="w-full bg-[#222] text-white border border-[#444] rounded px-2 py-1 outline-none text-sm"
                              >
                                <option value="single_choice">Single Choice (Radio)</option>
                                <option value="multiple_choice">Multiple Choice (Checkbox)</option>
                              </select>
                          </div>
                          <div className="flex-1 flex items-center pt-4">
                              <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={addon.is_required}
                                  onChange={(e) => handleAddonChange(index, "is_required", e.target.checked)}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                Is Required?
                              </label>
                          </div>
                      </div>
                    </div>
                  ))}
                  {currentMapping.addons.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-6 italic border border-dashed border-[#333] rounded">
                        No addon categories mapped yet. Click "Add Category".
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white font-bold">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2"
              >
                {isSaving ? <FaSpinner className="animate-spin" /> : "Save Mappings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonGroupsManager;
