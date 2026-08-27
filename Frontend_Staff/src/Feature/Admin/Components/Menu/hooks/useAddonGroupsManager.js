import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export function useAddonGroupsManager() {
  const [mappings, setMappings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [currentMapping, setCurrentMapping] = useState({
    target_category: "",
    addons: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mapsRes, catRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE}/addon_groups.php`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
        fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
      ]);

      // Safe JSON parsing for Category Mappings
      const mapsRaw = await mapsRes.text();
      let mapsData = null;
      try {
        mapsData = JSON.parse(mapsRaw);
      } catch (err) {
        console.error(
          "Backend returned non-JSON response for addon_groups.php:",
          mapsRaw
        );
      }

      if (
        mapsData &&
        mapsData.status === "success" &&
        Array.isArray(mapsData.category_addons)
      ) {
        setMappings(mapsData.category_addons);
      } else if (Array.isArray(mapsData)) {
        setMappings(mapsData);
      } else {
        setMappings([]);
      }

      // Safe JSON parsing for Categories
      const catRaw = await catRes.text();
      let catData = null;
      try {
        catData = JSON.parse(catRaw);
      } catch (err) {
        console.error(
          "Backend returned non-JSON response for get_categories.php:",
          catRaw
        );
      }

      if (Array.isArray(catData)) {
        setCategories(catData);
      } else if (catData && catData.data && Array.isArray(catData.data)) {
        setCategories(catData.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching data in AddonGroupsManager:", error);
      setMappings([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mapping = null) => {
    if (mapping) {
      setCurrentMapping({
        target_category: mapping.target_category || "",
        addons: Array.isArray(mapping.addons) ? mapping.addons : [],
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
        ...(currentMapping.addons || []),
        {
          addon_category: "",
          selection_type: "multiple_choice",
          is_required: false,
          custom_label: "",
        },
      ],
    });
  };

  const handleAddonChange = (index, field, value) => {
    const updated = [...(currentMapping.addons || [])];
    if (updated[index]) {
      updated[index][field] = value;
      setCurrentMapping({ ...currentMapping, addons: updated });
    }
  };

  const handleRemoveAddon = (index) => {
    const updated = (currentMapping.addons || []).filter((_, i) => i !== index);
    setCurrentMapping({ ...currentMapping, addons: updated });
  };

  const handleSave = async () => {
    if (!currentMapping.target_category) {
      Swal.fire("Error", "Please select a Target Category", "error");
      return;
    }

    const addons = currentMapping.addons || [];
    for (let i = 0; i < addons.length; i++) {
      if (!addons[i].addon_category) {
        Swal.fire(
          "Error",
          "Please select an Addon Category for all rows",
          "error"
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/addon_groups.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ action: "save_mapping", ...currentMapping }),
        }
      );

      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("Save mapping parse error:", raw);
      }

      if (data && data.status === "success") {
        Swal.fire("Saved", "Category Addons saved successfully", "success");
        setIsModalOpen(false);
        fetchData();
      } else {
        Swal.fire(
          "Error",
          data?.message || "Failed to save category addons",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save category addons", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (target_category) => {
    if (
      await Swal.fire({
        title: "Are you sure?",
        text: `Delete all addon mappings for "${target_category}"?`,
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#ef4444",
      }).then((res) => res.isConfirmed)
    ) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/addon_groups.php`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              action: "delete_mapping",
              target_category,
            }),
          }
        );

        const raw = await res.text();
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          console.error("Delete mapping parse error:", raw);
        }

        if (data && data.status === "success") {
          Swal.fire("Deleted", "Mapping deleted successfully", "success");
          fetchData();
        } else {
          Swal.fire(
            "Error",
            data?.message || "Failed to delete mapping",
            "error"
          );
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete mapping", "error");
      }
    }
  };

  return {
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
  };
}
