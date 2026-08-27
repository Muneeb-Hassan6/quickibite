import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import ItemVariantSelector from "./ItemVariantSelector";
import ItemIngredientToggles from "./ItemIngredientToggles";

export default function PosItemModal({ isOpen, onClose, menuItem, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState("");
  const [optionalIngredients, setOptionalIngredients] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [kitchenNote, setKitchenNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && menuItem) {
      setQuantity(1);
      setKitchenNote("");
      setExcludedIds([]);

      if (menuItem.variants && menuItem.variants.length > 0) {
        const firstAvailable = menuItem.variants.find(
          (v) => v.inStock !== false && v.inStock !== 0 && v.inStock !== "0"
        );
        setSelectedVariant(
          firstAvailable ? firstAvailable.size : menuItem.variants[0].size
        );
      } else {
        setSelectedVariant("Regular");
      }
    }
  }, [isOpen, menuItem]);

  useEffect(() => {
    if (isOpen && menuItem && selectedVariant) {
      const fetchRecipeDetails = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${menuItem.id}&variant_name=${selectedVariant}`
          );
          const data = await response.json();

          if (response.ok && data.status === "success") {
            const removables = data.ingredients.filter(
              (ing) => ing.is_removable == 1
            );
            setOptionalIngredients(removables);
          } else {
            setOptionalIngredients([]);
          }
        } catch (error) {
          console.error("Error fetching recipe for POS:", error);
          setOptionalIngredients([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecipeDetails();
    }
  }, [isOpen, menuItem, selectedVariant]);

  if (!isOpen || !menuItem) return null;

  const toggleIngredient = (inventoryId) => {
    if (excludedIds.includes(inventoryId)) {
      setExcludedIds(excludedIds.filter((id) => id !== inventoryId));
    } else {
      setExcludedIds([...excludedIds, inventoryId]);
    }
  };

  const handleAddToCart = () => {
    let currentPrice = menuItem.price;
    if (menuItem.variants && menuItem.variants.length > 0) {
      const activeVar = menuItem.variants.find(
        (v) => v.size === selectedVariant
      );
      if (activeVar) currentPrice = activeVar.price;
    }

    const cartItem = {
      id: menuItem.id,
      title: menuItem.name || menuItem.title,
      name: menuItem.name || menuItem.title,
      size: selectedVariant,
      variant: selectedVariant,
      price: currentPrice,
      qty: quantity,
      quantity,
      note: kitchenNote,
      excluded_ingredients: excludedIds,
    };

    onAddToCart(cartItem);
    onClose();
  };

  const isCurrentSelectionOutOfStock = () => {
    if (!menuItem.variants || menuItem.variants.length === 0) return false;
    const activeVar = menuItem.variants.find((v) => v.size === selectedVariant);
    return (
      activeVar &&
      (activeVar.inStock === false ||
        activeVar.inStock === 0 ||
        activeVar.inStock === "0")
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      style={{ transform: "none", perspective: "none" }}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ transform: "none", perspective: "none" }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/30">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 font-mono">
              Customize Item
            </span>
            <h3 className="m-0 text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug">
              {menuItem.name || menuItem.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Size / Variant Options */}
          <ItemVariantSelector
            variants={menuItem.variants}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
          />

          {/* Optional Removable Ingredients */}
          <ItemIngredientToggles
            optionalIngredients={optionalIngredients}
            excludedIds={excludedIds}
            toggleIngredient={toggleIngredient}
          />

          {/* Kitchen Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 font-mono">
              Special Instructions / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Extra spicy, sauce on the side..."
              value={kitchenNote}
              onChange={(e) => setKitchenNote(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
            />
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase font-mono">
              Quantity
            </span>
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center border-none cursor-pointer transition-colors disabled:opacity-40"
              >
                <FaMinus className="text-[10px]" />
              </button>
              <span className="w-8 text-center text-sm font-bold font-mono text-zinc-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                <FaPlus className="text-[10px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Add Button */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <button
            type="button"
            disabled={isCurrentSelectionOutOfStock()}
            onClick={handleAddToCart}
            className={`w-full py-3.5 px-4 rounded-2xl font-['Oswald',sans-serif] font-bold text-sm uppercase tracking-wider transition-all border-none ${
              isCurrentSelectionOutOfStock()
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-[0.99]"
            }`}
          >
            {isCurrentSelectionOutOfStock()
              ? "Option Sold Out"
              : "Add Customized Item to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
