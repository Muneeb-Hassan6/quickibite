import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaHamburger,
  FaList,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
  FaLayerGroup,
} from "react-icons/fa";
import imageCompression from "browser-image-compression";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import MenuModal from "./Components/MenuModal";
import CategoryModal from "./Components/CategoryModal";
import MenuTable from "./Components/MenuTable";
import RecipeModal from "./Components/RecipeModal";
import AddonModal from "./Components/AddonModal";
import AddonGroupsManager from "./AddonGroupsManager";

const MenuManager = () => {
  const queryClient = useQueryClient();
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

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const defaultMenuForm = {
    name: "",
    description: "",
    category: "",
    img: "",
    promo_banner_image: "",
    is_featured_banner: false,
    banner_order: 0,
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

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/inventory_api.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: customSliders = [] } = useQuery({
    queryKey: ['homepage_sliders'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_homepage_data.php`);
      const result = await response.json();
      if (result.success && result.data && result.data.sections) {
        return result.data.sections.filter(s =>
          s.section_type === 'product_slider' && s.content_data && s.content_data.startsWith('custom:')
        );
      }
      return [];
    }
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const uploadToCloudinary = async (file) => {
    if (!file || typeof file === "string") return file;
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
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

      let finalPromoBannerUrl = menuForm.promo_banner_image;
      if (menuForm.promo_banner_image instanceof File) {
        finalPromoBannerUrl = await uploadToCloudinary(menuForm.promo_banner_image);
      }

      const payload = {
        ...menuForm,
        img: finalImgUrl || "",
        promo_banner_image: finalPromoBannerUrl || "",
        is_featured_banner: menuForm.is_featured_banner ? 1 : 0,
        banner_order: parseInt(menuForm.banner_order || 0),
        auth_token: sessionStorage.getItem("auth_token")
      };
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
        queryClient.invalidateQueries({ queryKey: ['menu'] });
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
        queryClient.setQueryData(['menu'], old => old.filter(item => item.id !== id));
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
        queryClient.invalidateQueries({ queryKey: ['categories'] });
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
        queryClient.setQueryData(['categories'], old => old.filter(cat => cat.id !== id));
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
      promo_banner_image: item.promo_banner_image || "",
      is_featured_banner: item.is_featured_banner == 1 || item.is_featured_banner === true,
      banner_order: parseInt(item.banner_order || 0),
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
        <div className={`fixed top-[20px] right-[20px] bg-[var(--admin-panel)] text-white p-[15px_25px] rounded-[10px] flex items-center gap-[12px] font-bold shadow-[0_5px_15px_rgba(0,0,0,0.3)] z-[9999] animate-slide-up border-l-[4px] ${toast.type === "success" ? "border-green-500" : "border-red-500"}`}>
          {toast.type === "success" ? (
            <FaCheckCircle size={20} className="text-green-500" />
          ) : (
            <FaExclamationCircle size={20} className="text-red-500" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {confirmDialog.show && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[9999]">
          <div className="w-[90%] max-w-[400px] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[16px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-slide-up text-center">
            <div className="bg-[rgba(239,68,68,0.03)] p-[30px_20px_20px] border-b border-[var(--admin-border)] relative">
              <div className="w-[65px] h-[65px] bg-[rgba(239,68,68,0.1)] text-[var(--admin-orange)] rounded-full flex justify-center items-center text-[26px] mx-auto mb-[15px] shadow-[var(--shadow-glow)] border border-[rgba(239,68,68,0.2)]">
                <FaTrash />
              </div>
              <h3 className="m-0 text-[22px] font-black text-[var(--admin-text)]">{confirmDialog.title}</h3>
              <p className="mt-[5px] text-[13px] text-[var(--admin-muted)] font-semibold">{confirmDialog.message}</p>
            </div>
            <div className="p-[15px_25px] bg-[rgba(0,0,0,0.1)] flex gap-[12px]">
              <button
                className="flex-1 p-[14px] bg-transparent border border-[var(--admin-border)] text-[var(--admin-muted)] rounded-[10px] font-bold cursor-pointer transition-colors duration-200 hover:text-[var(--admin-text)] hover:border-[var(--admin-text)]"
                onClick={() =>
                  setConfirmDialog({ ...confirmDialog, show: false })
                }
              >
                Cancel
              </button>
              <button
                className="flex-[2] p-[14px] bg-[var(--admin-orange)] border-none text-white rounded-[10px] font-black text-[15px] flex justify-center items-center gap-[8px] cursor-pointer shadow-[var(--shadow-glow)] transition-transform duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)]"
                onClick={handleConfirmAction}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[var(--admin-border,rgba(255,255,255,0.06))] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Menu Management
            </h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full sm:w-auto mt-3">
            <div className="inline-flex bg-slate-100 dark:bg-[#202020] border border-slate-200/80 dark:border-white/[0.06] rounded-full p-1 gap-1 shadow-sm">
              <button
                type="button"
                className={`py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-2 font-bold transition-all text-xs border-none whitespace-nowrap shrink-0 ${activeTab === "items"
                  ? "btn-brand-cta !rounded-full"
                  : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                onClick={() => setActiveTab("items")}
              >
                <FaHamburger className="text-xs" />
                <span>Menu Items</span>
              </button>
              <button
                type="button"
                className={`py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-2 font-bold transition-all text-xs border-none whitespace-nowrap shrink-0 ${activeTab === "categories"
                  ? "btn-brand-cta !rounded-full"
                  : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                onClick={() => setActiveTab("categories")}
              >
                <FaList className="text-xs" />
                <span>Explore Categories</span>
              </button>
              <button
                type="button"
                className={`py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-2 font-bold transition-all text-xs border-none whitespace-nowrap shrink-0 ${activeTab === "addongroups"
                  ? "btn-brand-cta !rounded-full"
                  : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                onClick={() => setActiveTab("addongroups")}
              >
                <FaLayerGroup className="text-xs" />
                <span>Addon Groups</span>
              </button>
            </div>
          </div>
        </div>
        {activeTab === "items" && (
          <button
            type="button"
            className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shrink-0 active:scale-95"
            onClick={() => {
              setEditingItem(null);
              setMenuForm(defaultMenuForm);
              setIsMenuModalOpen(true);
            }}
          >
            <FaPlus className="text-xs" />
            <span>Add Product</span>
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
      ) : activeTab === "addongroups" ? (
        <AddonGroupsManager />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-4 animate-slide-up">
          <div
            className="border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/[0.03] transition-all flex flex-col items-center justify-center min-h-[140px] cursor-pointer text-slate-500 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 group p-4"
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm(defaultCategoryForm);
              setIsCategoryModalOpen(true);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors mb-2">
              <FaPlus className="text-sm" />
            </div>
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-center">
              Add Category
            </p>
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-[#161616] group transition-all min-h-[140px] flex items-center justify-center shadow-sm hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover z-[1] opacity-70 dark:opacity-50 transition-all duration-500 group-hover:scale-110 group-hover:opacity-30"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150?text=No+Image";
                }}
              />
              <div
                className="relative z-[2] font-black text-sm text-white uppercase tracking-wider text-center px-3 transition-opacity duration-300 group-hover:opacity-0 group-hover:invisible"
                style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)" }}
              >
                {cat.name}
              </div>
              <div className="absolute inset-0 bg-black/75 flex justify-center items-center gap-3 opacity-0 transition-opacity duration-300 z-10 group-hover:opacity-100 p-2">
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-blue-500/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="Edit Category"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(cat);
                    setCategoryForm({ name: cat.name, img: cat.img });
                    setIsCategoryModalOpen(true);
                  }}
                >
                  <FaEdit className="text-xs" />
                </button>
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="Delete Category"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerDeleteCategory(cat.id);
                  }}
                >
                  <FaTrash className="text-xs" />
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
