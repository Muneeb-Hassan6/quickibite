import React from "react";
import {
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import MenuSearchFilterBar from "./Components/MenuSearchFilterBar";
import MenuCategoryTabs from "./Components/MenuCategoryTabs";
import MenuModal from "./Components/MenuModal";
import CategoryModal from "./Components/CategoryModal";
import MenuTable from "./Components/MenuTable";
import RecipeModal from "./Components/RecipeModal";
import AddonModal from "./Components/AddonModal";
import AddonGroupsManager from "./AddonGroupsManager";

import { useMenuManager } from "./hooks/useMenuManager";

const MenuManager = () => {
  const {
    activeTab,
    setActiveTab,
    isRecipeModalOpen,
    setIsRecipeModalOpen,
    selectedMenuForRecipe,
    setSelectedMenuForRecipe,
    isAddonModalOpen,
    setIsAddonModalOpen,
    selectedItemForAddons,
    toast,
    confirmDialog,
    setConfirmDialog,
    isMenuModalOpen,
    setIsMenuModalOpen,
    editingItem,
    setEditingItem,
    defaultMenuForm,
    menuForm,
    setMenuForm,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    setEditingCategory,
    defaultCategoryForm,
    categoryForm,
    setCategoryForm,
    menuItems,
    categories,
    inventoryItems,
    customSliders,
    handleOpenAddons,
    handleSaveMenu,
    triggerDeleteMenu,
    handleSaveCategory,
    triggerDeleteCategory,
    handleConfirmAction,
    handleEditItem,
  } = useMenuManager();

  return (
    <div>
      {/* Toast Feedback */}
      {toast.show && (
        <div
          className={`fixed top-[20px] right-[20px] bg-[var(--admin-panel)] text-white p-[15px_25px] rounded-[10px] flex items-center gap-[12px] font-bold shadow-[0_5px_15px_rgba(0,0,0,0.3)] z-[9999] animate-slide-up border-l-[4px] ${
            toast.type === "success" ? "border-green-500" : "border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <FaCheckCircle size={20} className="text-green-500" />
          ) : (
            <FaExclamationCircle size={20} className="text-red-500" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[9999]">
          <div className="w-[90%] max-w-[400px] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[16px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-slide-up text-center">
            <div className="bg-[rgba(239,68,68,0.03)] p-[30px_20px_20px] border-b border-[var(--admin-border)] relative">
              <div className="w-[65px] h-[65px] bg-[rgba(239,68,68,0.1)] text-[var(--admin-orange)] rounded-full flex justify-center items-center text-[26px] mx-auto mb-[15px] shadow-[var(--shadow-glow)] border border-[rgba(239,68,68,0.2)]">
                <FaTrash />
              </div>
              <h3 className="m-0 text-[22px] font-black text-[var(--admin-text)]">
                {confirmDialog.title}
              </h3>
              <p className="mt-[5px] text-[13px] text-[var(--admin-muted)] font-semibold">
                {confirmDialog.message}
              </p>
            </div>
            <div className="p-[15px_25px] bg-[rgba(0,0,0,0.1)] flex gap-[12px]">
              <button
                type="button"
                className="flex-1 p-[14px] bg-transparent border border-[var(--admin-border)] text-[var(--admin-muted)] rounded-[10px] font-bold cursor-pointer transition-colors duration-200 hover:text-[var(--admin-text)] hover:border-[var(--admin-text)]"
                onClick={() =>
                  setConfirmDialog({ ...confirmDialog, show: false })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-[2] p-[14px] bg-[var(--admin-orange)] border-none text-white rounded-[10px] font-black text-[15px] flex justify-center items-center gap-[8px] cursor-pointer shadow-[var(--shadow-glow)] transition-transform duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)]"
                onClick={handleConfirmAction}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & View Switcher */}
      <MenuSearchFilterBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddProduct={() => {
          setEditingItem(null);
          setMenuForm(defaultMenuForm);
          setIsMenuModalOpen(true);
        }}
      />

      {/* Main Content Body */}
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
        <MenuCategoryTabs
          categories={categories}
          onAddCategory={() => {
            setEditingCategory(null);
            setCategoryForm(defaultCategoryForm);
            setIsCategoryModalOpen(true);
          }}
          onEditCategory={(cat) => {
            setEditingCategory(cat);
            setCategoryForm({ name: cat.name, img: cat.img });
            setIsCategoryModalOpen(true);
          }}
          onDeleteCategory={triggerDeleteCategory}
        />
      )}

      {/* Modals */}
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
