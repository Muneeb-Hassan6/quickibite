import React, { useRef, useState } from "react";
// 🔥 FaSpinner import kar liya hy
import { FaCloudUploadAlt, FaTimes, FaSpinner } from "react-icons/fa";

const CategoryModal = ({
  isOpen,
  onClose,
  categoryForm,
  setCategoryForm,
  onSave,
  editingCategory,
}) => {
  const fileInputRef = useRef(null);

  // 🔥 Local loading state button ke liye
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryForm({ ...categoryForm, img: file });
    }
  };

  const desktopImagePreviewUrl =
    categoryForm.img instanceof File
      ? URL.createObjectURL(categoryForm.img)
      : categoryForm.img;

  // 🔥 Naya function jo button click par chalega
  const handleLocalSave = async () => {
    setIsSaving(true); // Button pe loader ON
    try {
      await onSave(); // Yeh aapki main file ka save function call karega
    } finally {
      setIsSaving(false); // Save hone ke baad loader OFF
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <span
              style={{
                display: "inline-block",
                width: "4px",
                height: "20px",
                background: "#f59e0b",
                marginRight: "10px",
              }}
            ></span>
            {editingCategory ? "EDIT CATEGORY" : "ADD CATEGORY"}
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="category-input-group" style={{ marginBottom: "20px" }}>
          <label>CATEGORY IMAGE</label>
          <div
            className="image-upload-wrapper"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden-file-input"
              onChange={handleImageChange}
            />
            {categoryForm.img ? (
              <>
                <img src={desktopImagePreviewUrl} alt="Preview" />
                <div className="image-overlay">
                  <FaCloudUploadAlt size={32} />
                  <span>Change Image</span>
                </div>
              </>
            ) : (
              <div
                className="upload-placeholder"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#888",
                }}
              >
                <FaCloudUploadAlt
                  size={40}
                  style={{ marginBottom: "10px", color: "#666" }}
                />
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  Upload Image
                </p>
                <span style={{ fontSize: "12px", marginTop: "5px" }}>
                  Click to browse
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="category-input-group" style={{ marginBottom: "30px" }}>
          <label>CATEGORY NAME</label>
          <input
            type="text"
            className="dark-input-box"
            value={categoryForm.name}
            placeholder="e.g., drinks"
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
          />
        </div>

        <div
          className="modal-footer modal-actions"
          style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}
        >
          <button className="btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>

          {/* 🔥 Updated Save Button with Loader */}
          <button
            className="btn-save"
            onClick={handleLocalSave}
            disabled={isSaving}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              minWidth: "160px",
            }}
          >
            {isSaving ? (
              <>
                <FaSpinner className="spin-animation" /> Saving
              </>
            ) : editingCategory ? (
              "Update Category"
            ) : (
              "Save Category"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
