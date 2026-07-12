import React, { useState, useEffect } from "react";
import { useCart } from "../../Context/CartContext";
import {
  FaShoppingCart,
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheckSquare,
} from "react-icons/fa";
import { optimizeCloudinaryImage } from "../../utils/imageOptimizer";

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
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.8)] backdrop-blur-[0.313rem] z-[10000] flex items-center justify-center p-[0.937rem] animate-fade-in max-md:p-[0.625rem]" onClick={closePopup}>
      <div
        className="bg-[var(--panel-bg,#1a1a1a)] border border-[var(--border-color,#333)] rounded-[1.25rem] w-full max-w-[25rem] max-h-[95vh] overflow-y-auto shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative flex flex-col max-md:w-[92%] max-md:max-w-[21.876rem] max-md:max-h-[85vh] max-[23.75rem]:max-w-[19.375rem] [&::-webkit-scrollbar]:w-[0.375rem] [&::-webkit-scrollbar-track]:bg-[#0a0a0a] [&::-webkit-scrollbar-track]:rounded-[0.625rem] [&::-webkit-scrollbar-thumb]:bg-[#333333] hover:[&::-webkit-scrollbar-thumb]:bg-[#ef4444] [&::-webkit-scrollbar-thumb]:rounded-[0.625rem]"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <button className="absolute top-[0.937rem] right-[0.937rem] bg-[rgba(0,0,0,0.6)] text-white border-none w-[2.125rem] h-[2.125rem] rounded-full flex justify-center items-center cursor-pointer z-[100] transition-all duration-300 backdrop-blur-[0.25rem] hover:bg-[var(--brand-red,#ef4444)] hover:scale-110" onClick={closePopup}>
          <FaTimes size={16} />
        </button>

        <div className="w-full h-[13.75rem] bg-white max-md:h-[10rem] max-[23.75rem]:h-[9.375rem]">
          <img
            src={optimizeCloudinaryImage(image || "https://placehold.co/600x400?text=No+Image", 600)}
            alt={title}
            className="w-full h-full object-cover rounded-t-[1.25rem]"
          />
        </div>

        <div className="p-[1.25rem] flex flex-col gap-[1.125rem] max-md:p-[0.938rem] max-md:gap-[0.75rem]">
          <div>
            <div className="flex justify-between items-start mb-[0.5rem]">
              <h2 className="text-[var(--text-main,#ffffff)] m-0 text-[1.375rem] font-[800] leading-[1.2] font-['Oswald',sans-serif] max-md:text-[1.126rem]">{title}</h2>
              <span className="text-[var(--brand-red,#ef4444)] font-[800] text-[1.125rem] whitespace-nowrap ml-[0.625rem] max-md:text-[1rem]">Rs {currentPrice}</span>
            </div>
            <p className="text-[var(--text-muted,#cccccc)] text-[0.812rem] m-0 max-md:text-[0.75rem] max-md:mb-[0.312rem]">{description}</p>
          </div>

          {/* SIZES */}
          {item?.variants && item.variants.length > 1 && (
            <div className="mt-[0.937rem] mb-[0.937rem]">
              <h4 className="text-[var(--text-main,#ffffff)] text-[0.875rem] mb-[0.625rem] font-bold max-md:text-[0.812rem] max-md:mb-[0.5rem]">Select Size</h4>
              <div className="flex flex-wrap gap-[0.625rem]">
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
                      className={`p-[0.5rem_1rem] rounded-[0.5rem] font-bold text-[0.812rem] cursor-pointer transition-all duration-200 border border-[var(--border-color,#444)] max-md:p-[0.376rem_0.75rem] max-md:text-[0.75rem] max-md:rounded-[0.376rem] ${isActive ? "bg-[var(--brand-red,#ef4444)] text-[var(--btn-text,#ffffff)] border-[var(--brand-red,#ef4444)]" : "bg-transparent text-[var(--text-muted,#aaaaaa)]"}`}
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
                      <span className="text-[0.687rem] opacity-80 font-normal">
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
            <div className="mt-[0.937rem] mb-[0.937rem]">
              <h4 className="text-[var(--text-main,#ffffff)] text-[0.875rem] mb-[0.625rem] font-bold max-md:text-[0.812rem] max-md:mb-[0.5rem]">
                Ingredients (Uncheck to remove)
              </h4>
              <div className="grid grid-cols-2 gap-[0.625rem] max-md:grid-cols-1 max-md:gap-[0.5rem]">
                {isFetchingExtras ? (
                  <span className="loading-text">Loading...</span>
                ) : (
                  optionalIngredients.map((ing, index) => {
                    const isExcluded = excludedIds.includes(ing.inventory_id);
                    return (
                      <label
                        key={`ing-${index}`}
                        className={`flex items-center gap-[0.5rem] p-[0.625rem_0.75rem] rounded-[0.5rem] border border-[#e2e8f0] text-[0.812rem] cursor-pointer transition-all duration-200 font-[500] max-md:p-[0.5rem_0.625rem] max-md:text-[0.75rem] ${isExcluded ? "text-[#94a3b8] line-through bg-[#f1f5f9] opacity-70" : "bg-[#f8f9fa] text-[#333]"}`}
                      >
                        <input
                          type="checkbox"
                          checked={!isExcluded}
                          onChange={() => toggleRemovable(ing.inventory_id)}
                          className="cursor-pointer"
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
            <div className="mt-[0.937rem] mb-[0.937rem]">
              <h4 className="text-[var(--text-main,#ffffff)] text-[0.875rem] mb-[0.625rem] font-bold max-md:text-[0.812rem] max-md:mb-[0.5rem]">Extra Add-ons</h4>
              <div className="flex flex-wrap gap-[0.625rem]">
                {addonsList.map((addon) => {
                  const isSelected = selectedAddons.find(
                    (a) => a.id === addon.id,
                  );
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`flex items-center justify-center gap-[0.375rem] p-[0.625rem_0.875rem] rounded-[0.5rem] border text-[0.812rem] font-[600] cursor-pointer transition-all duration-200 max-md:p-[0.376rem_0.75rem] max-md:text-[0.75rem] max-md:rounded-[0.376rem] ${isSelected ? "bg-[rgba(239,68,68,0.1)] border-[var(--brand-red)] text-[var(--brand-red)]" : "bg-white text-[#333] border-[#e2e8f0]"}`}
                    >
                      {isSelected ? <FaCheckSquare /> : <FaPlus />}{" "}
                      {addon.addon_name}{" "}
                      <span className={`text-[0.75rem] ${isSelected ? "text-[var(--brand-red)]" : "text-[var(--brand-red)]"}`}>
                        (+Rs {addon.addon_price})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-[0.937rem] mb-[0.937rem]">
            <h4 className="text-[var(--text-main,#ffffff)] text-[0.875rem] mb-[0.625rem] font-bold max-md:text-[0.812rem] max-md:mb-[0.5rem]">
              Special Instructions (Optional)
            </h4>
            <textarea
              className="w-full bg-[var(--bg-body,#111111)] text-[var(--text-main,#ffffff)] border border-[var(--border-color,#333333)] rounded-[0.625rem] p-[0.75rem] text-[0.812rem] outline-none resize-none transition-all duration-300 focus:border-[var(--brand-yellow,#555)]"
              placeholder="e.g. Cut in half, extra crispy..."
              rows="2"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
            ></textarea>
          </div>

          <div>
            <div className="flex justify-between items-center mb-[0.937rem] max-md:my-[0.625rem]">
              <div className="flex items-center bg-[var(--bg-body,#222222)] border border-[var(--border-color)] rounded-[1.875rem] p-[0.375rem_0.75rem] gap-[0.937rem] max-md:p-[0.251rem_0.625rem] max-md:gap-[0.625rem]">
                <button className="bg-transparent border-none text-[var(--text-main,#fff)] cursor-pointer flex items-center p-[0.313rem]" onClick={decreaseQuantity}>
                  <FaMinus size={10} />
                </button>
                <span className="text-[var(--text-main,#ffffff)] font-bold text-[0.937rem] min-w-[0.937rem] text-center max-md:text-[0.875rem]">{quantity}</span>
                <button className="bg-transparent border-none text-[var(--text-main,#fff)] cursor-pointer flex items-center p-[0.313rem]" onClick={increaseQuantity}>
                  <FaPlus size={10} />
                </button>
              </div>

              <div className="text-right">
                <div className="text-[var(--text-muted,#aaaaaa)] text-[0.625rem] uppercase tracking-[0.5px] mb-[2px]">Total</div>
                <div className="text-[var(--text-main,#ffffff)] text-[1.25rem] font-[900] max-md:text-[1.126rem]">Rs {finalTotal}</div>
              </div>
            </div>

            <button
              className="w-full bg-[var(--brand-red,#ef4444)] text-[var(--btn-text,#ffffff)] border-none rounded-[0.75rem] p-[0.937rem] font-[800] text-[0.937rem] tracking-[1px] cursor-pointer flex justify-center items-center gap-[0.625rem] shadow-[var(--shadow-glow,0_4px_15px_rgba(239,68,68,0.4))] transition-all duration-200 active:scale-95 max-md:p-[0.75rem] max-md:text-[0.875rem] max-md:rounded-[0.625rem]"
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