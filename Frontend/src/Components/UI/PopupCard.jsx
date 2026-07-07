import React, { useState, useEffect } from "react";
import { useCart } from "../../Context/CartContext";
import {
  FaShoppingCart,
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheckSquare,
} from "react-icons/fa";
import "./PopupCard.css";

const PopupCard = ({ image, title, description, price, item, closePopup }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [optionalIngredients, setOptionalIngredients] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [addonsList, setAddonsList] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isFetchingExtras, setIsFetchingExtras] = useState(false);

  useEffect(() => {
    if (item?.variants && item.variants.length > 0) {
      const firstAvailableVariant =
        item.variants.find((v) => v.inStock !== false && v.inStock !== 0) ||
        item.variants[0];
      setSelectedVariant(firstAvailableVariant);
    }
  }, [item]);

  useEffect(() => {
    if (item && selectedVariant) {
      const fetchExtras = async () => {
        setIsFetchingExtras(true);
        try {
          const recipeRes = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${item.id}&variant_name=${selectedVariant.size}`,
          );
          const recipeData = await recipeRes.json();
          if (recipeRes.ok && recipeData.status === "success") {
            const removables = recipeData.ingredients.filter(
              (ing) => ing.is_removable == 1,
            );
            setOptionalIngredients(removables);
          } else {
            setOptionalIngredients([]);
          }

          const addonsRes = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_addons.php?menu_item_id=${item.id}`,
          );
          const addonsData = await addonsRes.json();
          if (
            addonsRes.ok &&
            addonsData.status === "success" &&
            addonsData.addons
          ) {
            setAddonsList(addonsData.addons);
          } else {
            setAddonsList([]);
          }
        } catch (error) {
          console.error("Error fetching details:", error);
          setOptionalIngredients([]);
          setAddonsList([]);
        } finally {
          setIsFetchingExtras(false);
        }
      };
      fetchExtras();
    }
  }, [item, selectedVariant]);

  const toggleRemovable = (invId) =>
    setExcludedIds((prev) =>
      prev.includes(invId)
        ? prev.filter((id) => id !== invId)
        : [...prev, invId],
    );

  const toggleAddon = (addon) =>
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon],
    );

  const currentPrice = selectedVariant
    ? parseInt(selectedVariant.price)
    : parseInt(price);
  const addonsTotal = selectedAddons.reduce(
    (sum, addon) => sum + parseFloat(addon.addon_price),
    0,
  );
  const finalTotal = (currentPrice + addonsTotal) * quantity;

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    const excludedNames = excludedIds
      .map((id) => {
        const ing = optionalIngredients.find((i) => i.inventory_id === id);
        return ing ? ing.ingredient_name : null;
      })
      .filter(Boolean)
      .join(", ");

    let finalNote = specialNote;
    if (excludedNames) {
      finalNote = specialNote
        ? `Without: ${excludedNames} | ${specialNote}`
        : `Without: ${excludedNames}`;
    }

    addToCart({
      ...item,
      menuItemId: item.id,
      price: currentPrice,
      size: selectedVariant ? selectedVariant.size : "Regular",
      note: finalNote,
      excluded_ingredients: excludedIds,
      qty: quantity,
      id: selectedVariant ? `${item.id}-${selectedVariant.size}` : item.id,
    });

    selectedAddons.forEach((addon) => {
      addToCart({
        id: `addon-${addon.id}-${item.id}`,
        title: addon.addon_name,
        price: parseFloat(addon.addon_price),
        size: "Extra",
        note: `For ${title || item.name || "Item"}`,
        is_addon: true,
        addon_data: {
          inventory_id: addon.inventory_id,
          qty: addon.qty_to_deduct,
        },
        qty: quantity,
      });
    });

    closePopup();
  };

  return (
    <div className="modal-overlay-fade" onClick={closePopup}>
      <div
        className="modal-content-bounce customer-popup-box"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <button className="modal-close-btn-fixed" onClick={closePopup}>
          <FaTimes size={16} />
        </button>

        <div className="modal-img-container">
          <img
            src={image || "https://placehold.co/600x400?text=No+Image"}
            alt={title}
            className="modal-img"
          />
        </div>

        <div className="modal-content-body">
          <div>
            <div className="modal-title-row">
              <h2 className="modal-title-text">{title}</h2>
              <span className="modal-price-text">Rs {currentPrice}</span>
            </div>
            <p className="modal-desc-text">{description}</p>
          </div>

          {/* SIZES */}
          {item?.variants && item.variants.length > 1 && (
            <div className="popup-section">
              <h4 className="modal-section-title">Select Size</h4>
              <div className="size-options-container">
                {item.variants.map((variant, index) => {
                  const isActive =
                    selectedVariant && selectedVariant.size === variant.size;

                  const isOutOfStock =
                    variant.inStock === false ||
                    variant.inStock === 0 ||
                    variant.inStock === "0";

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!isOutOfStock) setSelectedVariant(variant);
                      }}
                      disabled={isOutOfStock}
                      className={`size-pill ${isActive ? "active" : ""}`}
                      style={
                        isOutOfStock
                          ? {
                            opacity: 0.5,
                            cursor: "not-allowed",
                            textDecoration: "line-through",
                            backgroundColor: "#f3f4f6",
                            color: "#9ca3af",
                            borderColor: "#e5e7eb",
                          }
                          : {}
                      }
                    >
                      {variant.size} <br />{" "}
                      <span className="pill-price">
                        {isOutOfStock ? "Sold Out" : `Rs ${variant.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DYNAMIC OPTIONAL INGREDIENTS */}
          {optionalIngredients.length > 0 && (
            <div className="popup-section">
              <h4 className="modal-section-title">
                Ingredients (Uncheck to remove)
              </h4>
              <div className="spec-checkbox-grid">
                {isFetchingExtras ? (
                  <span className="loading-text">Loading...</span>
                ) : (
                  optionalIngredients.map((ing, index) => {
                    const isExcluded = excludedIds.includes(ing.inventory_id);
                    return (
                      <label
                        key={`ing-${index}`}
                        className={`spec-checkbox-label ${isExcluded ? "excluded" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={!isExcluded}
                          onChange={() => toggleRemovable(ing.inventory_id)}
                        />
                        {ing.ingredient_name}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC PAID ADD-ONS */}
          {addonsList.length > 0 && (
            <div className="popup-section">
              <h4 className="modal-section-title">Extra Add-ons</h4>
              <div className="pos-addon-grid">
                {addonsList.map((addon) => {
                  const isSelected = selectedAddons.find(
                    (a) => a.id === addon.id,
                  );
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`pos-addon-btn ${isSelected ? "active" : ""}`}
                    >
                      {isSelected ? <FaCheckSquare /> : <FaPlus />}{" "}
                      {addon.addon_name}{" "}
                      <span className="addon-price-tag">
                        (+Rs {addon.addon_price})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="popup-section">
            <h4 className="modal-section-title">
              Special Instructions (Optional)
            </h4>
            <textarea
              className="note-input"
              placeholder="e.g. Cut in half, extra crispy..."
              rows="2"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
            ></textarea>
          </div>

          <div>
            <div className="modal-footer-row">
              <div className="qty-control-box">
                <button className="qty-btn" onClick={decreaseQuantity}>
                  <FaMinus size={10} />
                </button>
                <span className="qty-number">{quantity}</span>
                <button className="qty-btn" onClick={increaseQuantity}>
                  <FaPlus size={10} />
                </button>
              </div>

              <div className="total-price-box">
                <div className="total-label">Total</div>
                <div className="total-value">Rs {finalTotal}</div>
              </div>
            </div>

            <button
              className="modal-add-btn"
              onClick={handleAddToCart}
              disabled={
                selectedVariant &&
                (selectedVariant.inStock === false ||
                  selectedVariant.inStock === 0 ||
                  selectedVariant.inStock === "0")
              }
              style={
                selectedVariant &&
                  (selectedVariant.inStock === false ||
                    selectedVariant.inStock === 0 ||
                    selectedVariant.inStock === "0")
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : {}
              }
            >
              <FaShoppingCart size={16} /> ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupCard;