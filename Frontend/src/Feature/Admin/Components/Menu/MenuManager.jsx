import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaHamburger,
  FaList,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import imageCompression from "browser-image-compression";
import "./styles/index.css";

import MenuModal from "./Components/MenuModal";
import CategoryModal from "./Components/CategoryModal";
import MenuTable from "./Components/MenuTable";
import RecipeModal from "./Components/RecipeModal";
import AddonModal from "./Components/AddonModal";

const MenuManager = () => {
  const [activeTab, setActiveTab] = useState("items");

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenuForRecipe, setSelectedMenuForRecipe] = useState(null);

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedItemForAddons, setSelectedItemForAddons] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    id: null,
    type: "",
    title: "",
    message: "",
  });

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [customSliders, setCustomSliders] = useState([]);

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const defaultMenuForm = {
    name: "",
    description: "",
    category: "",
    img: "",
    isAvailable: true,
    isTopDeal: false,
    isBestSeller: false,
    variants: [{ size: "Regular", price: "" }],
    slider_placements: [],
  };
  const [menuForm, setMenuForm] = useState(defaultMenuForm);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const defaultCategoryForm = { name: "", img: "" };
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dovuegkwa";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

  useEffect(() => {
    fetchMenuData();
    fetchCategoryData();
    fetchInventoryData();
    fetchCustomSliders();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`,
      );
      const data = await response.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Menu fetch error:", error);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_categories.php`,
      );
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Category fetch error:", error);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/inventory_api.php`,
      );
      const data = await response.json();
      setInventoryItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Inventory fetch error:", error);
    }
  };

  const fetchCustomSliders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_homepage_data.php`,
      );
      const result = await response.json();
      if (result.success && result.data && result.data.sections) {
        const sliders = result.data.sections.filter(s => 
          s.section_type === 'product_slider' && s.content_data && s.content_data.startsWith('custom:')
        );
        setCustomSliders(sliders);
      }
    } catch (error) {
      console.error("Sliders fetch error:", error);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const uploadToCloudinary = async (file) => {
    if (!file || typeof file === "string") return file;
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.error) {
        showToast("Cloudinary Error: " + data.error.message, "error");
        return null;
      }
      return data.secure_url;
    } catch (err) {
      showToast("Failed to process or upload image.", "error");
      return null;
    }
  };

  const handleOpenAddons = (item) => {
    setSelectedItemForAddons(item);
    setIsAddonModalOpen(true);
  };

  const handleSaveMenu = async () => {
    const hasValidVariants =
      menuForm.variants &&
      menuForm.variants.length > 0 &&
      menuForm.variants[0].price !== "";

    if (!menuForm.name || !hasValidVariants) {
      return showToast(
        "Please fill the required details (Name and Price).",
        "error",
      );
    }

    try {
      const finalImgUrl = await uploadToCloudinary(menuForm.img);
      if (!finalImgUrl && menuForm.img instanceof File) {
        return showToast("Image upload failed!", "error");
      }
      const payload = { ...menuForm, img: finalImgUrl || "", auth_token: sessionStorage.getItem("auth_token") };
      const url = editingItem
        ? `${import.meta.env.VITE_API_BASE}/update_menu.php`
        : `${import.meta.env.VITE_API_BASE}/add_menu.php`;

      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          editingItem ? { ...payload, id: editingItem.id } : payload,
        ),
      });

      const result = await response.json();
      if (result.success) {
        showToast(
          editingItem
            ? "Item updated successfully!"
            : "Item added successfully!",
          "success",
        );
        await fetchMenuData();
        setIsMenuModalOpen(false);
      } else showToast("Error: " + result.message, "error");
    } catch (error) {
      showToast("Server connection failed.", "error");
    }
  };

  const triggerDeleteMenu = (id) => {
    setConfirmDialog({
      show: true,
      id: id,
      type: "menu",
      title: "Delete Menu Item?",
      message:
        "Are you sure you want to remove this item? This action cannot be undone.",
    });
  };

  const executeDeleteMenu = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/delete_menu.php`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id: id, auth_token: sessionStorage.getItem("auth_token") }),
        },
      );
      const result = await response.json();
      if (result.success) {
        setMenuItems(menuItems.filter((item) => item.id !== id));
        showToast("Item deleted successfully!", "success");
      } else showToast("Failed to delete item.", "error");
    } catch (error) {
      showToast("Server connection failed.", "error");
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name || !categoryForm.img)
      return showToast("Please fill all category details!", "error");

    try {
      const finalImgUrl = categoryForm.img ? await uploadToCloudinary(categoryForm.img) : "";

      if (!finalImgUrl && categoryForm.img instanceof File) {
        return showToast("Image upload failed!", "error");
      }

      const payload = {
        name: categoryForm.name,
        img: finalImgUrl || categoryForm.img,
        auth_token: sessionStorage.getItem("auth_token")
      };
      const url = editingCategory
        ? `${import.meta.env.VITE_API_BASE}/update_category.php`
        : `${import.meta.env.VITE_API_BASE}/add_category.php`;

      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          editingCategory ? { ...payload, id: editingCategory.id } : payload,
        ),
      });

      const result = await response.json();
      if (result.success) {
        showToast(
          editingCategory
            ? "Category updated successfully!"
            : "Category saved successfully!",
          "success",
        );
        await fetchCategoryData();
        setIsCategoryModalOpen(false);
      } else showToast("Error: " + result.message, "error");
    } catch (error) {
      showToast("Server connection failed.", "error");
    }
  };

  const triggerDeleteCategory = (id) => {
    setConfirmDialog({
      show: true,
      id: id,
      type: "category",
      title: "Delete Category?",
      message:
        "Removing this category might affect items linked to it. Continue?",
    });
  };

  const executeDeleteCategory = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/delete_category.php`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id: id, auth_token: sessionStorage.getItem("auth_token") }),
        },
      );
      const result = await response.json();
      if (result.success) {
        setCategories(categories.filter((cat) => cat.id !== id));
        showToast("Category deleted successfully!", "success");
      } else showToast("Failed to delete category.", "error");
    } catch (error) {
      showToast("Server connection failed.", "error");
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === "menu") executeDeleteMenu(confirmDialog.id);
    else executeDeleteCategory(confirmDialog.id);
    setConfirmDialog({ ...confirmDialog, show: false });
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    
    // Calculate which custom sliders this product currently belongs to
    const initialSliderPlacements = customSliders
      .filter(slider => {
        const idsStr = slider.content_data.split(':')[1];
        if (!idsStr) return false;
        const ids = idsStr.split(',').map(id => parseInt(id));
        return ids.includes(parseInt(item.id));
      })
      .map(slider => slider.id);

    setMenuForm({
      ...item,
      isAvailable: item.isAvailable == 1,
      isTopDeal: item.isTopDeal == 1,
      isBestSeller: item.isBestSeller == 1,
      variants: Array.isArray(item.variants) && item.variants.length > 0
        ? item.variants.map((v) => ({ ...v, inStock: v.inStock != 0 }))
        : [{ size: "Regular", price: "", inStock: true }],
      slider_placements: initialSliderPlacements,
    });
    setIsMenuModalOpen(true);
  };

  return (
    <div>
      {toast.show && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.type === "success" ? (
            <FaCheckCircle size={20} />
          ) : (
            <FaExclamationCircle size={20} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {confirmDialog.show && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <div className="confirm-icon-box">
              <FaTrash />
            </div>
            <h3 className="confirm-title">{confirmDialog.title}</h3>
            <p className="confirm-message">{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button
                className="btn-confirm-cancel"
                onClick={() =>
                  setConfirmDialog({ ...confirmDialog, show: false })
                }
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleConfirmAction}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="menu-manager-header">
        <div>
          <h2 className="section-header menu-manager-title">Menu Management</h2>
          <div className="tab-group">
            <button
              className={`tab-btn ${activeTab === "items" ? "active" : ""}`}
              onClick={() => setActiveTab("items")}
            >
              <FaHamburger /> Menu Items
            </button>
            <button
              className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              <FaList /> Explore Categories
            </button>
          </div>
        </div>
        {activeTab === "items" && (
          <button
            className="add-new-btn"
            onClick={() => {
              setEditingItem(null);
              setMenuForm(defaultMenuForm);
              setIsMenuModalOpen(true);
            }}
          >
            <FaPlus /> Add Product
          </button>
        )}
      </div>

      {activeTab === "items" ? (
        <MenuTable
          menuItems={menuItems}
          categories={categories}
          onEdit={handleEditItem}
          onDelete={triggerDeleteMenu}
          onAddOns={handleOpenAddons}
          onSetRecipe={(item) => {
            setSelectedMenuForRecipe(item);
            setIsRecipeModalOpen(true);
          }}
        />
      ) : (
        <div className="categories-grid animate-slide-up">
          <div
            className="category-card add-new-cat"
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm(defaultCategoryForm);
              setIsCategoryModalOpen(true);
            }}
          >
            <FaPlus size={30} />
            <p
              className="upload-placeholder"
              style={{ margin: "10px 0 0 0", fontWeight: "600" }}
            >
              Add Category
            </p>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} className="category-card hover-actions-container">
              <img
                src={cat.img}
                alt={cat.name}
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/150?text=No+Image")
                }
              />
              <div className="cat-name">{cat.name}</div>
              <div className="category-hover-overlay">
                <button
                  className="btn-edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(cat);
                    setCategoryForm({ name: cat.name, img: cat.img });
                    setIsCategoryModalOpen(true);
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="btn-delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerDeleteCategory(cat.id);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        editingItem={editingItem}
        menuForm={menuForm}
        setMenuForm={setMenuForm}
        onSave={handleSaveMenu}
        categories={categories}
        customSliders={customSliders}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        editingCategory={editingCategory}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        onSave={handleSaveCategory}
      />

      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        menuItem={selectedMenuForRecipe}
        inventoryItems={inventoryItems}
      />

      <AddonModal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        menuItem={selectedItemForAddons}
        inventoryItems={inventoryItems}
      />
    </div>
  );
};

export default MenuManager;
