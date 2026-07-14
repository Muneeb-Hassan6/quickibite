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
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[9999]" onClick={onClose}>
      <div className="w-[90%] max-w-[28.125rem] bg-[var(--admin-bg,#141414)] border border-[var(--admin-border,#222)] rounded-[1rem] p-[1.563rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-[1.563rem] w-full">
          <h3 className="uppercase flex items-center gap-[0.625rem] text-white m-0 text-[1.25rem] font-black">
            <span
              className="inline-block w-[0.25rem] h-[1.25rem] bg-[#f59e0b]"
            ></span>
            {editingCategory ? "EDIT CATEGORY" : "ADD CATEGORY"}
          </h3>
          <button onClick={onClose} className="bg-transparent border-none text-[#949191] text-[1.25rem] cursor-pointer transition-colors duration-300 hover:text-[var(--admin-text)] static !m-0">
            <FaTimes />
          </button>
        </div>

        <div className="mb-[1.25rem]">
          <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">CATEGORY IMAGE</label>
          <div
            className="relative w-full h-[12.5rem] border-2 border-dashed border-[#f59e0b] rounded-[0.75rem] overflow-hidden cursor-pointer group"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer hidden"
              onChange={handleImageChange}
            />
            {categoryForm.img ? (
              <>
                <img src={desktopImagePreviewUrl} alt="Preview" className="w-full h-full object-cover block" />
                <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.6)] flex flex-col justify-center items-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <FaCloudUploadAlt size={32} />
                  <span className="mt-[0.5rem] font-bold text-[0.938rem]">Change Image</span>
                </div>
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center h-full text-[#888]"
              >
                <FaCloudUploadAlt
                  size={40}
                  className="mb-[0.625rem] text-[#666]"
                />
                <p className="m-0 font-bold">
                  Upload Image
                </p>
                <span className="text-[0.75rem] mt-[0.313rem]">
                  Click to browse
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-[1.875rem]">
          <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">CATEGORY NAME</label>
          <input
            type="text"
            className="w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:border-[#ef4444] focus:bg-[var(--admin-bg)]"
            value={categoryForm.name}
            placeholder="e.g., drinks"
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
          />
        </div>

        <div
          className="flex justify-end gap-[0.938rem]"
        >
          <button className="bg-transparent text-white border border-[var(--admin-border)] p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)]" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>

          {/* 🔥 Updated Save Button with Loader */}
          <button
            className="bg-[var(--admin-orange)] text-white border-none p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[var(--shadow-glow)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)] flex justify-center items-center gap-[0.5rem] min-w-[10rem]"
            onClick={handleLocalSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin" /> Saving
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
