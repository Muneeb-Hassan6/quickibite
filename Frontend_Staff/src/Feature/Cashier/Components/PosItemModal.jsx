import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheckSquare,
  FaRegSquare,
} from "react-icons/fa";
import "./PosItemModal.css"; // 🔥 CSS FILE IMPORT

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
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-box animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-container">
          <div>
            <h2 className="modal-item-title">{menuItem.name}</h2>
            <p className="modal-item-price">
              Rs{" "}
              {menuItem.variants?.find((v) => v.size === selectedVariant)
                ?.price || menuItem.price}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Sizes / Variants */}
        {menuItem.variants && menuItem.variants.length > 0 && (
          <div className="section-container">
            <p className="section-label">Select Size:</p>
            <div className="variants-container">
              {menuItem.variants.map((variant, index) => {
                const isOutOfStock =
                  variant.inStock === false ||
                  variant.inStock === 0 ||
                  variant.inStock === "0";
                const isActive =
                  selectedVariant === variant.size && !isOutOfStock;

                let btnClass = "variant-btn ";
                if (isOutOfStock) btnClass += "out-of-stock";
                else if (isActive) btnClass += "active";
                else btnClass += "inactive";

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isOutOfStock) setSelectedVariant(variant.size);
                    }}
                    disabled={isOutOfStock}
                    className={btnClass}
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
            <div className="ingredients-box">
              <p className="ingredients-label">
                Remove Ingredients (Optional):
              </p>
              {optionalIngredients.map((ing, index) => {
                const isExcluded = excludedIds.includes(ing.inventory_id);
                return (
                  <div
                    key={index}
                    onClick={() => toggleIngredient(ing.inventory_id)}
                    className={`ingredient-item ${isExcluded ? "excluded" : "included"}`}
                  >
                    <div
                      className={`ingredient-icon ${isExcluded ? "excluded" : "included"}`}
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
        <div className="section-container">
          <p className="section-label">Kitchen Note (Spicy, Extra etc):</p>
          <textarea
            value={kitchenNote}
            onChange={(e) => setKitchenNote(e.target.value)}
            placeholder="e.g. Make it extra spicy..."
            className="kitchen-note-input"
          />
        </div>

        {/* Quantity and Action Button */}
        <div className="action-container">
          <div className="qty-controls">
            <button
              className="qty-btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <FaMinus />
            </button>
            <span className="qty-display">{quantity}</span>
            <button
              className="qty-btn"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <FaPlus />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isCurrentSelectionOutOfStock()}
            className={`add-to-cart-btn ${isCurrentSelectionOutOfStock() ? "disabled" : ""}`}
          >
            {isCurrentSelectionOutOfStock() ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosItemModal;
