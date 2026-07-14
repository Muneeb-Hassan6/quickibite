import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheckSquare,
  FaRegSquare,
} from "react-icons/fa";

const PosItemModal = ({ isOpen, onClose, menuItem, onAddToCart }) => {
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
          (v) => v.inStock !== false && v.inStock !== 0 && v.inStock !== "0",
        );
        setSelectedVariant(
          firstAvailable ? firstAvailable.size : menuItem.variants[0].size,
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
            `${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${menuItem.id}&variant_name=${selectedVariant}`,
          );
          const data = await response.json();

          if (response.ok && data.status === "success") {
            const removables = data.ingredients.filter(
              (ing) => ing.is_removable == 1,
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
        (v) => v.size === selectedVariant,
      );
      if (activeVar) currentPrice = activeVar.price;
    }

    const cartItem = {
      id: menuItem.id,
      title: menuItem.name,
      size: selectedVariant,
      price: currentPrice,
      qty: quantity,
      note: kitchenNote,
      excluded_ingredients: excludedIds,
    };

    onAddToCart(cartItem);
    onClose();
  };

  const isCurrentSelectionOutOfStock = () => {
    if (!menuItem.variants || menuItem.variants.length === 0) return false;
    const activeVar = menuItem.variants.find((v) => v.size === selectedVariant);
    if (!activeVar) return false;
    return (
      activeVar.inStock === false ||
      activeVar.inStock === 0 ||
      activeVar.inStock === "0"
    );
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-[999999] backdrop-blur-[6px]" onClick={onClose}>
      <div
        className="bg-[var(--admin-panel,#1f2937)] text-white rounded-[12px] w-full max-w-[450px] p-[25px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#333] max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-[20px]">
          <div>
            <h2 className="m-0 text-[22px]">{menuItem.name}</h2>
            <p className="text-[var(--brand-red,#ef4444)] font-bold m-[5px_0_0_0]">
              Rs{" "}
              {menuItem.variants?.find((v) => v.size === selectedVariant)
                ?.price || menuItem.price}
            </p>
          </div>
          <button className="bg-transparent border-none text-gray-500 text-[20px] cursor-pointer hover:text-white transition-colors duration-200" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Sizes / Variants */}
        {menuItem.variants && menuItem.variants.length > 0 && (
          <div className="mb-[20px]">
            <p className="font-bold mb-[8px] text-[13px] text-[var(--admin-muted)] uppercase block">Select Size:</p>
            <div className="flex gap-[10px] flex-wrap">
              {menuItem.variants.map((variant, index) => {
                const isOutOfStock =
                  variant.inStock === false ||
                  variant.inStock === 0 ||
                  variant.inStock === "0";
                const isActive =
                  selectedVariant === variant.size && !isOutOfStock;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isOutOfStock) setSelectedVariant(variant.size);
                    }}
                    disabled={isOutOfStock}
                    className={`p-[10px_18px] rounded-[8px] font-bold transition-all duration-200 border cursor-pointer text-center ${isOutOfStock ? "opacity-50 line-through cursor-not-allowed text-gray-500 bg-[rgba(255,255,255,0.05)] border-[#333]" : isActive ? "border-[var(--brand-red,#ef4444)] bg-[var(--brand-red,#ef4444)] text-[var(--text-main,#ffffff)]" : "border-[#333] bg-[rgba(255,255,255,0.05)] text-[var(--text-main,#ffffff)] hover:bg-[rgba(255,255,255,0.1)]"}`}
                  >
                    {variant.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Ingredients */}
        {isLoading ? (
          <p className="loading-text">Loading options...</p>
        ) : (
          optionalIngredients.length > 0 && (
            <div className="mb-[20px] bg-[rgba(255,255,255,0.05)] p-[15px] rounded-[8px]">
              <p className="font-bold mb-[8px] text-[13px] text-[var(--admin-muted)] uppercase block">
                Remove Ingredients (Optional):
              </p>
              {optionalIngredients.map((ing, index) => {
                const isExcluded = excludedIds.includes(ing.inventory_id);
                return (
                  <div
                    key={index}
                    onClick={() => toggleIngredient(ing.inventory_id)}
                    className={`flex items-center gap-[10px] mb-[8px] cursor-pointer p-[12px] rounded-[8px] border border-[#333] text-[14px] ${isExcluded ? "text-gray-500 line-through bg-[rgba(0,0,0,0.3)]" : "bg-[rgba(255,255,255,0.05)] text-white"}`}
                  >
                    <div
                      className={`${isExcluded ? "text-gray-500" : "text-white"}`}
                    >
                      {isExcluded ? (
                        <FaRegSquare size={20} />
                      ) : (
                        <FaCheckSquare size={20} />
                      )}
                    </div>
                    <span style={{ fontSize: "15px" }}>
                      {ing.ingredient_name}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Kitchen Note */}
        <div className="mb-[20px]">
          <p className="font-bold mb-[8px] text-[13px] text-[var(--admin-muted)] uppercase block">Kitchen Note (Spicy, Extra etc):</p>
          <textarea
            value={kitchenNote}
            onChange={(e) => setKitchenNote(e.target.value)}
            placeholder="e.g. Make it extra spicy..."
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[#333] rounded-[8px] text-white p-[14px] resize-none text-[14px] outline-none focus:border-[var(--brand-red)] min-h-[80px]"
          />
        </div>

        {/* Quantity and Action Button */}
        <div className="flex gap-[15px] items-center mt-[20px]">
          <div className="flex items-center justify-center bg-[var(--admin-panel)] rounded-[6px] border border-[var(--admin-border)] p-[4px]">
            <button
              className="w-[36px] h-[36px] bg-transparent text-[var(--admin-muted)] border-none cursor-pointer flex justify-center items-center hover:text-white"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <FaMinus />
            </button>
            <span className="text-[16px] font-bold text-[var(--admin-text)] w-[30px] text-center">{quantity}</span>
            <button
              className="w-[36px] h-[36px] bg-transparent text-[var(--admin-muted)] border-none cursor-pointer flex justify-center items-center hover:text-white"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <FaPlus />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isCurrentSelectionOutOfStock()}
            className={`flex-1 bg-[var(--brand-red,#ef4444)] text-white border-none p-[16px] rounded-[8px] text-[16px] font-bold cursor-pointer shadow-[var(--shadow-glow)] ${isCurrentSelectionOutOfStock() ? "opacity-50 cursor-not-allowed shadow-none" : "hover:bg-[#dc2626]"}`}
          >
            {isCurrentSelectionOutOfStock() ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosItemModal;
