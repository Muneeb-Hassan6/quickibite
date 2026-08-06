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
    <div className="admin-modal-overlay override-zindex" onClick={onClose}>
      <div
        className="admin-modal-box menu-modal-box animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-flex">
          <h3 className="modal-title">
            <span className="modal-title-bar"></span>
            {editingItem ? "EDIT MENU ITEM" : "ADD NEW MENU ITEM"}
          </h3>
          <button className="btn-close-modal-clean" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-split-layout">
          {/* LEFT SIDE: Image Upload & Status Flags */}
          <div className="modal-left-col">
            <div className="admin-input-group menu-image-group">
              <label className="menu-image-label">PRODUCT IMAGE</label>
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
                {menuForm.img ? (
                  <>
                    <img
                      src={
                        typeof menuForm.img === "string"
                          ? menuForm.img
                          : URL.createObjectURL(menuForm.img)
                      }
                      alt="Preview"
                      className="menu-preview-img"
                    />
                    <div className="image-overlay">
                      <FaCloudUploadAlt size={35} />
                      <span>Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="menu-upload-placeholder">
                    <FaCloudUploadAlt className="menu-upload-icon" size={45} />
                    <p>Click to upload image</p>
                    <span>PNG, JPG up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            <div className="menu-flags-section">
              <h4 className="flags-heading">Item Visibility</h4>

              <label
                className={`flag-checkbox-label ${menuForm.isAvailable !== false ? "active-flag" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={menuForm.isAvailable !== false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isAvailable: e.target.checked })
                  }
                />
                Available (In Stock)
              </label>

              <label
                className={`flag-checkbox-label ${menuForm.isTopDeal ? "active-flag" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={menuForm.isTopDeal || false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isTopDeal: e.target.checked })
                  }
                />
                Mark as Top Deal
              </label>

              <label
                className={`flag-checkbox-label ${menuForm.isBestSeller ? "active-flag" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={menuForm.isBestSeller || false}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isBestSeller: e.target.checked })
                  }
                />
                Mark as Best Seller
              </label>

              {customSliders.length > 0 && (
                <>
                  <div className="flags-divider" style={{ margin: '15px 0', borderBottom: '1px solid #333' }}></div>
                  <h4 className="flags-heading" style={{ fontSize: '12px', color: '#888' }}>Custom Sliders</h4>
                  {customSliders.map(slider => {
                    const isChecked = menuForm.slider_placements?.includes(slider.id);
                    return (
                      <label
                        key={slider.id}
                        className={`flag-checkbox-label ${isChecked ? "active-flag" : ""}`}
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
          <div className="modal-right-col">
            <div className="admin-input-group">
              <label>Item Name</label>
              <input
                type="text"
                className="admin-input-field custom-admin-input dark-input-box"
                value={menuForm.name}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, name: e.target.value })
                }
                placeholder="e.g. Zinger Burger, Extra Cheese..."
              />
            </div>

            <div className="admin-input-group">
              <label>Category</label>
              <select
                className="admin-input-field custom-admin-input dark-input-box"
                value={menuForm.category}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, category: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="menu-hint-text">
                *Note: Paid Add-ons banane ke liye category mein "Add-ons"
                select karein.
              </p>
            </div>

            {/* VARIANTS SECTION */}
            <div className="variants-section-box">
              <label className="variants-label">Sizes & Prices</label>

              {menuForm.variants &&
                menuForm.variants.map((variant, index) => (
                  <div key={index} className="variant-flex-row align-center">
                    <input
                      type="text"
                      className="admin-input-field custom-admin-input variant-input-size dark-input-box"
                      placeholder="Size (e.g. Regular)"
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="admin-input-field custom-admin-input variant-input-price dark-input-box"
                      placeholder="Price (Rs)"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                    />

                    <label className="variant-stock-label">
                      <input
                        type="checkbox"
                        checked={variant.inStock !== false}
                        onChange={(e) =>
                          updateVariant(index, "inStock", e.target.checked)
                        }
                      />
                      In Stock
                    </label>

                    {menuForm.variants.length > 1 && (
                      <button
                        className="btn-remove-variant rm-btn-trash small-trash-btn"
                        onClick={() => removeVariant(index)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}

              <button
                className="btn-add-variant rm-btn-add"
                onClick={addVariantRow}
              >
                <FaPlus /> Add Another Size
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="menu-modal-footer">
          <button
            className="btn-cancel-modal-clean btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="btn-save-modal-clean btn-save" onClick={onSave}>
            {editingItem ? "Update Item" : "Save Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
