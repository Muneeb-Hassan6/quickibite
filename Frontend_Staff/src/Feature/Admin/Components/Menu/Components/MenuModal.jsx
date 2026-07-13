import React, { useRef } from "react";
import { FaTimes, FaCloudUploadAlt, FaPlus, FaTrash } from "react-icons/fa";

const MenuModal = ({
  isOpen,
  onClose,
  editingItem,
  menuForm,
  setMenuForm,
  onSave,
  categories,
  customSliders = [],
}) => {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuForm({ ...menuForm, img: file });
    }
  };

  const addVariantRow = () => {
    setMenuForm({
      ...menuForm,
      variants: [
        ...(menuForm.variants || []),
        { size: "", price: "", inStock: true },
      ],
    });
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...menuForm.variants];
    updatedVariants[index][field] = value;
    setMenuForm({ ...menuForm, variants: updatedVariants });
  };

  const removeVariant = (index) => {
    const updatedVariants = menuForm.variants.filter((_, i) => i !== index);
    setMenuForm({ ...menuForm, variants: updatedVariants });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center !z-[99999]" onClick={onClose}>
      <div
        className="w-full bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[1rem] p-[1.563rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] !max-w-[43.75rem] w-[90%] max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-[1.25rem]">
          <h3 className="m-0 text-[1.375rem] font-black text-[var(--admin-text)] flex items-center">
            <span className="inline-block w-[0.25rem] h-[1.25rem] bg-[#f59e0b] mr-[0.625rem]"></span>
            {editingItem ? "EDIT MENU ITEM" : "ADD MENU ITEM"}
          </h3>
          <button className="bg-transparent border-none text-[var(--admin-muted)] text-[1.25rem] cursor-pointer transition-colors duration-200 hover:text-[var(--brand-red)]" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-[1.25rem]">
          {/* LEFT SIDE: Image Upload & Status Flags */}
          <div className="flex-1 flex flex-col min-w-[15.625rem]">
            <div className="mb-[1.25rem]">
              <label className="text-[0.75rem] text-[#888] font-extrabold uppercase mb-[0.375rem] block">PRODUCT IMAGE</label>
              <div
                className="border-2 border-dashed border-[var(--admin-border)] rounded-[0.75rem] h-[11.25rem] md:h-[13.75rem] flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-[rgba(255,255,255,0.02)] transition-colors duration-300 w-full hover:border-[var(--admin-orange)] hover:bg-[rgba(239,68,68,0.05)] group"
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
                {menuForm.img ? (
                  <>
                    <img
                      src={
                        typeof menuForm.img === "string"
                          ? menuForm.img
                          : URL.createObjectURL(menuForm.img)
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] flex flex-col justify-center items-center text-white opacity-0 transition-opacity duration-300 hover:opacity-100">
                      <FaCloudUploadAlt size={35} />
                      <span className="font-bold mt-[0.625rem]">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#888]">
                    <FaCloudUploadAlt className="text-[2.5rem] text-[var(--admin-muted)] mb-[0.625rem] transition-colors duration-300 group-hover:text-[var(--admin-orange)]" size={45} />
                    <p className="m-0 font-bold">Click to upload image</p>
                    <span className="text-[0.75rem] mt-[0.313rem]">PNG, JPG up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[0.625rem] mt-[0.938rem] p-[0.938rem] bg-[var(--admin-card-bg,#1e1e24)] border border-[var(--admin-border,#333)] rounded-[0.75rem] shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
              <h4 className="m-0 mb-[0.313rem] text-[0.688rem] uppercase tracking-[1px] text-[var(--admin-muted,#888)] font-bold">Item Visibility</h4>

              <label
                className={`flex items-center gap-[0.75rem] text-[0.813rem] font-semibold text-[var(--admin-text,#ccc)] cursor-pointer p-[0.625rem_0.938rem] rounded-[0.5rem] border transition-all duration-200 ${menuForm.isAvailable !== false ? "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)] text-white" : "bg-[rgba(255,255,255,0.02)] border-transparent hover:bg-[rgba(255,255,255,0.05)]"}`}
              >
                <input
                  type="checkbox"
                  checked={menuForm.isAvailable !== false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isAvailable: e.target.checked })
                  }
                  className="w-[1rem] h-[1rem] cursor-pointer accent-[var(--brand-red,#ef4444)]"
                />
                Available (In Stock)
              </label>

              <label
                className={`flex items-center gap-[0.75rem] text-[0.813rem] font-semibold text-[var(--admin-text,#ccc)] cursor-pointer p-[0.625rem_0.938rem] rounded-[0.5rem] border transition-all duration-200 ${menuForm.isTopDeal ? "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)] text-white" : "bg-[rgba(255,255,255,0.02)] border-transparent hover:bg-[rgba(255,255,255,0.05)]"}`}
              >
                <input
                  type="checkbox"
                  checked={menuForm.isTopDeal || false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isTopDeal: e.target.checked })
                  }
                  className="w-[1rem] h-[1rem] cursor-pointer accent-[var(--brand-red,#ef4444)]"
                />
                Mark as Top Deal
              </label>

              <label
                className={`flex items-center gap-[0.75rem] text-[0.813rem] font-semibold text-[var(--admin-text,#ccc)] cursor-pointer p-[0.625rem_0.938rem] rounded-[0.5rem] border transition-all duration-200 ${menuForm.isBestSeller ? "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)] text-white" : "bg-[rgba(255,255,255,0.02)] border-transparent hover:bg-[rgba(255,255,255,0.05)]"}`}
              >
                <input
                  type="checkbox"
                  checked={menuForm.isBestSeller || false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isBestSeller: e.target.checked })
                  }
                  className="w-[1rem] h-[1rem] cursor-pointer accent-[var(--brand-red,#ef4444)]"
                />
                Mark as Best Seller
              </label>

              {customSliders.length > 0 && (
                <>
                  <div className="my-[0.938rem] border-b border-[#333]"></div>
                  <h4 className="m-0 mb-[0.313rem] text-[0.75rem] text-[#888] font-bold">Custom Sliders</h4>
                  {customSliders.map(slider => {
                    const isChecked = menuForm.slider_placements?.includes(slider.id);
                    return (
                      <label
                        key={slider.id}
                        className={`flex items-center gap-[0.75rem] text-[0.813rem] font-semibold text-[var(--admin-text,#ccc)] cursor-pointer p-[0.625rem_0.938rem] rounded-[0.5rem] border transition-all duration-200 ${isChecked ? "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)] text-white" : "bg-[rgba(255,255,255,0.02)] border-transparent hover:bg-[rgba(255,255,255,0.05)]"}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked || false}
                          onChange={(e) => {
                            const currentPlacements = menuForm.slider_placements || [];
                            if (e.target.checked) {
                              setMenuForm({ ...menuForm, slider_placements: [...currentPlacements, slider.id] });
                            } else {
                              setMenuForm({ ...menuForm, slider_placements: currentPlacements.filter(id => id !== slider.id) });
                            }
                          }}
                          className="w-[1rem] h-[1rem] cursor-pointer accent-[var(--brand-red,#ef4444)]"
                        />
                        Add to "{slider.title}" Slider
                      </label>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Inputs & Variants */}
          <div className="flex-[2] flex flex-col pr-[0.625rem] max-h-[25rem] md:max-h-none overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--brand-red)] scrollbar-track-[#141414]">
            <div className="mb-[0.938rem]">
              <label className="text-[0.75rem] font-bold text-[var(--admin-muted)] uppercase mb-[0.375rem] block">Item Name</label>
              <input
                type="text"
                className="w-full p-[0.75rem] bg-[rgba(255,255,255,0.05)] border border-[#333] text-white rounded-[0.5rem] focus:outline-none focus:border-[var(--brand-red)]"
                value={menuForm.name}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, name: e.target.value })
                }
                placeholder="e.g. Zinger Burger, Extra Cheese..."
              />
            </div>

            <div className="mb-[0.938rem]">
              <label className="text-[0.75rem] font-bold text-[var(--admin-muted)] uppercase mb-[0.375rem] block">Category</label>
              <select
                className="w-full p-[0.75rem] bg-[rgba(255,255,255,0.05)] border border-[#333] text-white rounded-[0.5rem] focus:outline-none focus:border-[var(--brand-red)]"
                value={menuForm.category}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, category: e.target.value })
                }
              >
                <option className="bg-[#1a1a1a]" value="" disabled>
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option className="bg-[#1a1a1a]" key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-[0.688rem] text-[#888] mt-[0.313rem]">
                *Note: Paid Add-ons banane ke liye category mein "Add-ons"
                select karein.
              </p>
            </div>

            {/* VARIANTS SECTION */}
            <div className="bg-[rgba(0,0,0,0.3)] p-[0.938rem] rounded-[0.5rem] border border-[#333]">
              <label className="text-[0.75rem] font-bold text-[var(--admin-muted)] uppercase mb-[0.625rem] block">Sizes & Prices</label>

              {menuForm.variants &&
                menuForm.variants.map((variant, index) => (
                  <div key={index} className="flex gap-[0.625rem] mb-[0.625rem] items-center w-full">
                    <input
                      type="text"
                      className="flex-[2] min-w-0 p-[0.75rem] bg-[rgba(255,255,255,0.05)] border border-[#333] text-white rounded-[0.5rem] focus:outline-none focus:border-[var(--brand-red)]"
                      placeholder="Size (e.g. Regular)"
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="flex-1 min-w-0 p-[0.75rem] bg-[rgba(255,255,255,0.05)] border border-[#333] text-white rounded-[0.5rem] focus:outline-none focus:border-[var(--brand-red)]"
                      placeholder="Price (Rs)"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                    />

                    <label className="flex items-center gap-[0.313rem] text-[0.75rem] cursor-pointer whitespace-nowrap text-white">
                      <input
                        type="checkbox"
                        checked={variant.inStock !== false}
                        onChange={(e) =>
                          updateVariant(index, "inStock", e.target.checked)
                        }
                        className="cursor-pointer"
                      />
                      In Stock
                    </label>

                    {menuForm.variants.length > 1 && (
                      <button
                        className="bg-[rgba(239,68,68,0.1)] text-[var(--brand-red)] border-none p-[0.5rem_0.75rem] h-auto rounded-[0.5rem] cursor-pointer shrink-0 flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(239,68,68,0.2)]"
                        onClick={() => removeVariant(index)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}

              <button
                className="w-full p-[0.75rem] bg-transparent text-[var(--brand-red)] border border-dashed border-[var(--brand-red)] rounded-[0.5rem] cursor-pointer font-bold flex justify-center items-center gap-[0.5rem] mt-[0.625rem] transition-colors duration-200 hover:bg-[rgba(239,68,68,0.1)]"
                onClick={addVariantRow}
              >
                <FaPlus /> Add Another Size
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-[0.938rem] mt-[1.25rem] border-t border-[#333] pt-[1.25rem]">
          <button
            className="bg-transparent text-white border border-[#333] p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="bg-[var(--brand-red)] text-white border-none p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)]" onClick={onSave}>
            {editingItem ? "Update Item" : "Save Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
