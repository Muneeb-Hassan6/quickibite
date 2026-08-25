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
}) => {
  const fileInputRef = useRef(null);
  const promoFileInputRef = useRef(null);

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
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-3xl bg-[var(--admin-panel,#171717)] border border-[var(--admin-border,rgba(255,255,255,0.08))] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[88vh] overflow-y-auto flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] font-['Oswald',sans-serif] uppercase tracking-wide">
              {editingItem ? "Edit Menu Item" : "Create New Menu Item"}
            </h3>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--admin-muted,#888)] hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row gap-5 sm:gap-6 flex-1">
          {/* LEFT COLUMN: Image Upload & Visibility Settings */}
          <div className="w-full md:w-5/12 flex flex-col gap-4">
            <div>
              <label className="text-xs text-[var(--admin-muted,#888)] font-extrabold uppercase tracking-wider mb-2 block">
                Product Image
              </label>
              <div
                className="border-2 border-dashed border-[var(--admin-border,rgba(255,255,255,0.12))] rounded-2xl h-44 sm:h-52 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-white/[0.02] hover:border-amber-400 hover:bg-amber-400/5 transition-all group shadow-inner"
                onClick={() => fileInputRef.current?.click()}
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
                      className="w-full h-full object-contain p-3"
                    />
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaCloudUploadAlt size={30} className="text-amber-400" />
                      <span className="text-xs font-bold mt-2">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-[var(--admin-muted,#888)] p-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <FaCloudUploadAlt className="text-xl" />
                    </div>
                    <p className="m-0 font-bold text-xs text-[var(--admin-text,#fff)]">Click to upload image</p>
                    <span className="text-[10px] mt-1 text-[var(--admin-muted,#888)]">PNG, JPG or WebP (transparent recommended)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Visibility Settings Box */}
            <div className="flex flex-col gap-2.5 p-3.5 bg-white/[0.02] border border-[var(--admin-border,rgba(255,255,255,0.06))] rounded-2xl">
              <h4 className="m-0 text-[11px] uppercase tracking-widest text-[var(--admin-muted,#888)] font-extrabold">
                Badges & Visibility
              </h4>

              <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-300 cursor-pointer p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
                <input
                  type="checkbox"
                  checked={menuForm.isAvailable !== false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer accent-amber-500"
                />
                <span>Available in Store</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-300 cursor-pointer p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
                <input
                  type="checkbox"
                  checked={menuForm.isTopDeal || false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isTopDeal: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer accent-amber-500"
                />
                <span>Mark as Top Deal</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-300 cursor-pointer p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
                <input
                  type="checkbox"
                  checked={menuForm.isBestSeller || false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isBestSeller: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer accent-amber-500"
                />
                <span>Mark as Best Seller</span>
              </label>

              {/* Promo Banner Feature */}
              <div className="my-0.5 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]" />
              <label className={`flex items-center gap-2.5 text-xs font-bold cursor-pointer p-2 rounded-xl transition-colors ${menuForm.is_featured_banner ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "bg-white/[0.02] text-neutral-400"}`}>
                <input
                  type="checkbox"
                  checked={menuForm.is_featured_banner || false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, is_featured_banner: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer accent-amber-500"
                />
                <span>Homepage Hero Banner</span>
              </label>

              {menuForm.is_featured_banner && (
                <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-xl border border-white/5 mt-1">
                  <label className="text-[10px] text-amber-400 font-bold uppercase block">
                    Wide Promo Banner (1200x500px)
                  </label>
                  <div
                    onClick={() => promoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl h-20 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-white/[0.02] hover:border-amber-400 group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={promoFileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setMenuForm({ ...menuForm, promo_banner_image: file });
                      }}
                    />
                    {menuForm.promo_banner_image ? (
                      <>
                        <img
                          src={
                            typeof menuForm.promo_banner_image === "string"
                              ? menuForm.promo_banner_image
                              : URL.createObjectURL(menuForm.promo_banner_image)
                          }
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold">Change Banner</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-neutral-400 text-center p-1">
                        <FaCloudUploadAlt className="text-sm text-amber-400 mb-0.5" />
                        <span className="text-[10px] font-bold">Upload Wide Banner</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">
                      Banner Sort Order (0 = First)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={menuForm.banner_order ?? 0}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, banner_order: e.target.value })
                      }
                      className="w-full p-2 text-xs bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: General Info & Variants Repeater */}
          <div className="w-full md:w-7/12 flex flex-col gap-4">
            <div>
              <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider mb-1.5 block">
                Item Title *
              </label>
              <input
                type="text"
                className="w-full p-3 bg-white/5 border border-[var(--admin-border,rgba(255,255,255,0.08))] text-[var(--admin-text,#fff)] rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold"
                value={menuForm.name}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, name: e.target.value })
                }
                placeholder="e.g. Gourmet Beef Burger, Margherita Pizza..."
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider mb-1.5 block">
                Category *
              </label>
              <select
                className="w-full p-3 bg-white/5 border border-[var(--admin-border,rgba(255,255,255,0.08))] text-[var(--admin-text,#fff)] rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold cursor-pointer"
                value={menuForm.category}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, category: e.target.value })
                }
              >
                <option className="bg-[var(--admin-panel,#171717)]" value="" disabled>
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option className="bg-[var(--admin-panel,#171717)]" key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider mb-1.5 block">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                className="w-full p-3 bg-white/5 border border-[var(--admin-border,rgba(255,255,255,0.08))] text-[var(--admin-text,#fff)] rounded-xl focus:outline-none focus:border-amber-500 text-sm resize-none"
                value={menuForm.description || ""}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, description: e.target.value })
                }
                placeholder="Key ingredients, culinary notes, portion size..."
              />
            </div>

            {/* VARIANTS REPEATER CARD */}
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-[var(--admin-border,rgba(255,255,255,0.06))] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider">
                  Sizes & Price Tiers *
                </label>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  At least 1 required
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {menuForm.variants &&
                  menuForm.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <input
                        type="text"
                        className="flex-1 min-w-[110px] p-2 text-xs bg-black/40 border border-white/10 text-white rounded-lg focus:outline-none focus:border-amber-500 font-medium"
                        placeholder="Size (e.g. Regular, Large)"
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(index, "size", e.target.value)
                        }
                      />
                      <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-2 w-28 min-w-[90px] focus-within:border-amber-500">
                        <span className="text-[11px] text-amber-400 font-bold mr-1">Rs.</span>
                        <input
                          type="number"
                          min="0"
                          className="w-full py-2 bg-transparent text-xs text-white outline-none font-bold"
                          placeholder="0"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                        />
                      </div>

                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-neutral-300 select-none px-1">
                        <input
                          type="checkbox"
                          checked={variant.inStock !== false}
                          onChange={(e) =>
                            updateVariant(index, "inStock", e.target.checked)
                          }
                          className="cursor-pointer accent-amber-500"
                        />
                        <span className="text-[11px]">Stock</span>
                      </label>

                      {menuForm.variants.length > 1 && (
                        <button
                          type="button"
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
                          onClick={() => removeVariant(index)}
                          aria-label="Remove variant"
                        >
                          <FaTrash className="text-[10px]" />
                        </button>
                      )}
                    </div>
                  ))}
              </div>

              <button
                type="button"
                className="w-full py-2.5 bg-transparent text-amber-400 hover:text-amber-300 border border-dashed border-amber-500/30 hover:border-amber-500 rounded-xl cursor-pointer font-bold text-xs flex justify-center items-center gap-2 transition-all"
                onClick={addVariantRow}
              >
                <FaPlus className="text-[10px]" />
                <span>Add Another Size Variant</span>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
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
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer transition-all"
            onClick={onSave}
          >
            {editingItem ? "Update Item" : "Save Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
