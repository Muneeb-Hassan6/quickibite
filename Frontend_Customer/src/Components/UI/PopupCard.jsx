import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../../Context/CartContext";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheck,
  FaChevronDown,
  FaShoppingBag,
  FaGlassMartiniAlt,
  FaUtensils,
  FaPepperHot,
  FaFire,
  FaSlidersH,
  FaCrown,
} from "react-icons/fa";
import { resolveImageUrl } from "../../utils/imageOptimizer";

// Asset references for combo sub-items
import burgerImg from "../../assets/Burger.jpg";
import shawarmaImg from "../../assets/shawarama.jpg";
import wrapImg from "../../assets/wraps.jpg";
import pizzaImg from "../../assets/pizza.png";
import broastImg from "../../assets/broast.jpg";
import wingsImg from "../../assets/grilledwings.jpg";
import friesImg from "../../assets/potatocorner.jpg";
import drinksImg from "../../assets/Drinks.jpg";
import saucesImg from "../../assets/sauces.jpg";
import pastaImg from "../../assets/pasta.jpg";

const DEFAULT_DRINK_FLAVORS = ["Coca-Cola", "Sprite", "Fanta", "7Up", "Mountain Dew", "Pepsi"];
const DEFAULT_PIZZA_FLAVORS = ["Chicken Tikka", "Chicken Fajita", "Peri Peri", "Supreme"];
const DEFAULT_FRIES_FLAVORS = ["Plain Salted", "Masala Fries", "Garlic Mayo Fries"];

const getSubItemImage = (itemName = "") => {
  const name = (itemName || "").toLowerCase();
  if (name.includes("burger") || name.includes("patty") || name.includes("zinger")) return burgerImg;
  if (name.includes("shawarma")) return shawarmaImg;
  if (name.includes("wrap")) return wrapImg;
  if (name.includes("pizza")) return pizzaImg;
  if (name.includes("broast") || name.includes("fried chicken") || name.includes("chicken")) return broastImg;
  if (name.includes("wing")) return wingsImg;
  if (name.includes("fries") || name.includes("potato")) return friesImg;
  if (name.includes("drink") || name.includes("ml") || name.includes("1.5l") || name.includes("coke") || name.includes("pepsi")) return drinksImg;
  if (name.includes("sauce") || name.includes("dip") || name.includes("mayo")) return saucesImg;
  if (name.includes("pasta")) return pastaImg;
  return friesImg;
};

const parseComboItems = (description = "", dbItems = []) => {
  if (Array.isArray(dbItems) && dbItems.length > 0) {
    return dbItems.map((it, idx) => {
      const name = it.item_title || it.name || "Item";
      const lname = name.toLowerCase();
      const isDrink = lname.includes("drink") || lname.includes("ml") || lname.includes("1.5l") || lname.includes("coke") || lname.includes("pepsi");
      const isPizza = lname.includes("pizza");
      const isFries = lname.includes("fries") || lname.includes("potato");

      return {
        id: it.id || idx,
        raw: `${it.quantity || 1}x ${name}`,
        qty: `${it.quantity || 1}X`,
        name: name,
        isDrink,
        isPizza,
        isFries,
        is_customizable: Boolean(it.is_customizable),
        choice_group_name: it.choice_group_name || (isPizza ? "Choose Pizza Flavor" : isFries ? "Choose Fries Flavor" : isDrink ? "Choose Drink Flavor" : `Choose ${name} Flavor`),
        options: Array.isArray(it.options) && it.options.length > 0
          ? it.options
          : (isPizza ? DEFAULT_PIZZA_FLAVORS : isFries ? DEFAULT_FRIES_FLAVORS : isDrink ? DEFAULT_DRINK_FLAVORS : []),
        image: getSubItemImage(name),
      };
    });
  }

  if (!description) return [];
  const rawParts = description.split(/\+|\band\b|,/i).map((s) => s.trim()).filter(Boolean);
  return rawParts.map((part, index) => {
    const qtyMatch = part.match(/^(\d+\s*x|\d+\s*pcs|\d+|quarter)\s+/i);
    let qty = "1X";
    let name = part;
    if (qtyMatch) {
      qty = qtyMatch[1].toLowerCase().includes("x")
        ? qtyMatch[1].toUpperCase()
        : qtyMatch[1].toLowerCase().includes("pcs")
          ? qtyMatch[1].toUpperCase()
          : `${qtyMatch[1]}X`;
      name = part.replace(qtyMatch[0], "").trim();
    }
    const lname = name.toLowerCase();
    const isDrink = lname.includes("drink") || lname.includes("ml") || lname.includes("1.5l") || lname.includes("coke") || lname.includes("pepsi");
    const isPizza = lname.includes("pizza");
    const isFries = lname.includes("fries") || lname.includes("potato");
    return {
      id: index,
      raw: part,
      qty: qty,
      name: name || part,
      isDrink,
      isPizza,
      isFries,
      is_customizable: isPizza || isFries || isDrink,
      choice_group_name: isPizza ? "Choose Pizza Flavor" : isFries ? "Choose Fries Flavor" : isDrink ? "Choose Drink Flavor" : "",
      options: isPizza ? DEFAULT_PIZZA_FLAVORS : isFries ? DEFAULT_FRIES_FLAVORS : isDrink ? DEFAULT_DRINK_FLAVORS : [],
      image: getSubItemImage(name || part),
    };
  });
};

const PopupCard = ({ image, title, description, price, item, closePopup }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [excludedIds, setExcludedIds] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedUpsells, setSelectedUpsells] = useState([]);
  const [selectedDrink, setSelectedDrink] = useState("Coca-Cola");
  const [selectedPizza, setSelectedPizza] = useState("Chicken Tikka");
  const [selectedFries, setSelectedFries] = useState("Masala Fries");

  const [fullItem, setFullItem] = useState(item);
  const [isLoadingDealDetails, setIsLoadingDealDetails] = useState(false);

  // Check if item is a Deal (Strict: does not falsely classify discounted/badged products)
  const isDeal = Boolean(
    fullItem?.is_deal === true ||
    fullItem?.isDeal === true ||
    fullItem?.type === "deal" ||
    (fullItem?.id && fullItem.id.toString().startsWith("deal-")) ||
    (fullItem?.items && Array.isArray(fullItem.items) && fullItem.items.length > 0)
  );

  useEffect(() => {
    setFullItem(item);
    if (!item) return;

    const rawId = item.deal_id || String(item.id || "").replace("deal-", "").replace("prod-", "");
    const isDealItem = Boolean(
      item?.is_deal === true ||
      item?.isDeal === true ||
      item?.type === "deal" ||
      (item?.id && item.id.toString().startsWith("deal-")) ||
      (item?.items && Array.isArray(item.items) && item.items.length > 0)
    );

    if (isDealItem && (!item.items || item.items.length === 0)) {
      setIsLoadingDealDetails(true);
      fetch(`${import.meta.env.VITE_API_BASE}/get_deal_details.php?id=${rawId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.deal) {
            setFullItem((prev) => ({
              ...prev,
              ...res.deal,
              is_deal: true,
              items: res.deal.items || []
            }));
          }
        })
        .catch((e) => console.error("Could not fetch full deal details in modal", e))
        .finally(() => setIsLoadingDealDetails(false));
    }
  }, [item]);

  const rawDesc = fullItem?.items_description || description || fullItem?.description || "";
  const comboItems = useMemo(() => parseComboItems(rawDesc, fullItem?.items), [rawDesc, fullItem?.items]);
  const hasDrinkInCombo = comboItems.some((c) => c.isDrink);
  const hasPizzaInCombo = comboItems.some((c) => c.isPizza);
  const hasFriesInCombo = comboItems.some((c) => c.isFries);

  // Dynamic Accordion open states
  const [openSections, setOpenSections] = useState({
    comboIncludes: true,
    pizzaFlavor: true,
    friesFlavor: true,
    drinkFlavor: true,
    dealAddons: false,
    drinks: true,
    fries: false,
    dips: false,
    pairings: false,
    ingredients: false,
  });

  // Body Scroll Lock with reliable cleanup and layout shift prevention
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Prevent layout shift when scrollbar disappears
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "unset";
      document.body.style.paddingRight = originalPaddingRight || "unset";
    };
  }, []);

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Set default variant safely
  useEffect(() => {
    if (fullItem?.variants && fullItem.variants.length > 0) {
      const firstAvailableVariant =
        fullItem.variants.find((v) => v.inStock !== false && v.inStock !== 0) ||
        fullItem.variants[0];
      setSelectedVariant(firstAvailableVariant);
    } else if (!isDeal) {
      setSelectedVariant({
        id: 1,
        size: "Regular",
        price: parseFloat(fullItem?.price || price || 0),
        inStock: true,
      });
    }
  }, [fullItem, isDeal, price]);

  // Safe Category Detection for Addon Groups
  const rawCategory = isDeal
    ? "deals"
    : fullItem?.category_name ||
      fullItem?.category ||
      fullItem?.category_title ||
      fullItem?.category_slug ||
      fullItem?.cat_name ||
      item?.category_name ||
      item?.category ||
      item?.category_title ||
      item?.category_slug ||
      item?.cat_name ||
      "";

  const itemCategory = rawCategory.toString().trim().toLowerCase();
  const currentCat = itemCategory;
  const dealId = isDeal
    ? (fullItem?.deal_id || String(fullItem?.id || "").replace("deal-", "") || item?.deal_id || String(item?.id || "").replace("deal-", "") || 0)
    : 0;

  const currentItemId = fullItem?.id || item?.id || "";
  const cleanItemId = String(currentItemId).replace("deal-", "");

  // Dynamic Category Addon Groups mapped from category_addons
  const { data: mappedAddonGroups = [] } = useQuery({
    queryKey: ["product_mapped_addon_groups", itemCategory, cleanItemId, dealId],
    queryFn: async () => {
      if (!itemCategory) return [];
      try {
        const url = isDeal && dealId
          ? `${import.meta.env.VITE_API_BASE}/addon_groups.php?action=get_for_product&category=deals&deal_id=${encodeURIComponent(dealId)}`
          : `${import.meta.env.VITE_API_BASE}/addon_groups.php?action=get_for_product&category=${encodeURIComponent(itemCategory)}&item_id=${encodeURIComponent(cleanItemId)}`;
        const res = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
        const text = await res.text();
        const data = JSON.parse(text);
        if (data && data.status === "success" && Array.isArray(data.addon_groups)) {
          return data.addon_groups;
        }
        return [];
      } catch (err) {
        console.error("Error fetching dynamic addon groups:", err);
        return [];
      }
    },
    enabled: !!itemCategory,
  });

  const getCategoryIcon = (categoryName = "") => {
    const cat = (categoryName || "").toLowerCase();
    if (cat.includes("drink") || cat.includes("beverage")) return <FaGlassMartiniAlt className="text-red-500 text-sm" />;
    if (cat.includes("fries") || cat.includes("potato")) return <FaUtensils className="text-amber-500 text-sm" />;
    if (cat.includes("sauce") || cat.includes("sause") || cat.includes("dip")) return <FaPepperHot className="text-red-500 text-sm" />;
    if (cat.includes("pairing") || cat.includes("side") || cat.includes("appetizer") || cat.includes("wing") || cat.includes("bread") || cat.includes("nugget")) {
      return <FaFire className="text-amber-500 text-sm" />;
    }
    if (cat.includes("wrap") || cat.includes("shawarma") || cat.includes("burger")) return <FaFire className="text-orange-500 text-sm" />;
    return <FaUtensils className="text-amber-500 text-sm" />;
  };

  const toggleMappedAddon = (group, addonItem) => {
    setSelectedUpsells((prev) => {
      const groupName = group.name;
      const isSingle = group.type === "single_choice";
      const exists = prev.find((u) => u.id === addonItem.id && u.addon_group === groupName);

      if (exists) {
        return prev.filter((u) => !(u.id === addonItem.id && u.addon_group === groupName));
      } else {
        const itemPrice = parseFloat(addonItem.price || 0);
        const newItem = {
          id: addonItem.id,
          name: addonItem.item_name || addonItem.name,
          price: itemPrice,
          selectedPrice: itemPrice,
          img: addonItem.img || addonItem.image,
          addon_group: groupName,
          is_addon_mapping: true,
        };

        if (isSingle) {
          const filtered = prev.filter((u) => u.addon_group !== groupName);
          return [...filtered, newItem];
        } else {
          return [...prev, newItem];
        }
      }
    });
  };

  // Fetch optional ingredients
  const { data: optionalIngredients = [] } = useQuery({
    queryKey: ["product_optional_ingredients", item?.id],
    queryFn: async () => {
      if (!item?.id || isDeal) return [];
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_product_ingredients.php?id=${item.id}`);
        const data = await res.json();
        return Array.isArray(data) ? data.filter((i) => i.is_optional == 1 || i.is_optional == "1") : [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!item?.id && !isDeal,
  });

  const toggleDealAddon = (addon) => {
    setSelectedDealAddons((prev) =>
      prev.find((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    );
  };

  const toggleRemovable = (invId) =>
    setExcludedIds((prev) => (prev.includes(invId) ? prev.filter((id) => id !== invId) : [...prev, invId]));

  const toggleAddon = (addon) =>
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    );

  const toggleUpsell = (upsellItem) => {
    setSelectedUpsells((prev) => {
      const exists = prev.find((u) => u.id === upsellItem.id);
      if (exists) {
        return prev.filter((u) => u.id !== upsellItem.id);
      } else {
        const itemPrice =
          upsellItem.variants && upsellItem.variants.length > 0
            ? parseFloat(upsellItem.variants[0].price)
            : parseFloat(upsellItem.price || 0);

        const itemSize =
          upsellItem.variants && upsellItem.variants.length > 0 ? upsellItem.variants[0].size : "Regular";

        return [
          ...prev,
          {
            ...upsellItem,
            selectedPrice: itemPrice,
            selectedSize: itemSize,
          },
        ];
      }
    });
  };

  // Price Calculation
  const basePrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(price || 0);
  const originalPrice = item?.original_price ? parseFloat(item.original_price) : null;
  const savings = originalPrice && originalPrice > basePrice ? originalPrice - basePrice : 0;
  const savingsPercent = originalPrice && originalPrice > basePrice ? Math.round((savings / originalPrice) * 100) : 0;

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + parseFloat(a.addon_price || 0), 0);
  const upsellsTotal = selectedUpsells.reduce((sum, u) => sum + parseFloat(u.selectedPrice || u.price || 0), 0);

  const singleUnitTotal = basePrice + (isDeal ? 0 : addonsTotal) + upsellsTotal;
  const grandTotal = singleUnitTotal * quantity;
  const finalTotal = grandTotal;

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Add To Cart Dispatch
  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();

    if (isDeal) {
      const comboSummary = comboItems.map((c) => `${c.qty} ${c.name}`).join(", ");
      const addonsSummary = selectedUpsells.map((a) => a.name).join(", ");
      let noteParts = [];
      if (hasPizzaInCombo) noteParts.push(`Pizza: ${selectedPizza}`);
      if (hasFriesInCombo) noteParts.push(`Fries: ${selectedFries}`);
      if (hasDrinkInCombo) noteParts.push(`Drink: ${selectedDrink}`);
      if (addonsSummary) noteParts.push(`Addons: ${addonsSummary}`);
      if (specialNote) noteParts.push(`Note: ${specialNote}`);

      addToCart({
        id: item?.id ? (item.id.toString().startsWith("deal-") ? item.id : `deal-${item.id}`) : `deal-${Date.now()}`,
        title: title || item?.name || item?.title || "Combo Deal",
        price: singleUnitTotal,
        qty: quantity,
        size: "Combo",
        is_deal: true,
        image: finalImage,
        deal_items: comboItems,
        selectedFlavors: {
          pizza: hasPizzaInCombo ? selectedPizza : null,
          fries: hasFriesInCombo ? selectedFries : null,
          drink: hasDrinkInCombo ? selectedDrink : null,
          addOns: selectedUpsells,
        },
        addons: selectedUpsells,
        upsell_items: selectedUpsells,
        note: `Combo: ${comboSummary}${noteParts.length ? ` | ${noteParts.join(" | ")}` : ""}`,
      });
    } else {
      const excludedNames = excludedIds
        .map((id) => {
          const ing = optionalIngredients.find((i) => i.inventory_id === id);
          return ing ? ing.ingredient_name : null;
        })
        .filter(Boolean)
        .join(", ");

      let finalNote = specialNote;
      if (excludedNames) {
        finalNote = specialNote ? `Without: ${excludedNames} | ${specialNote}` : `Without: ${excludedNames}`;
      }

      addToCart({
        id: item?.id || Date.now(),
        title: title || item?.name,
        price: singleUnitTotal,
        qty: quantity,
        size: selectedVariant ? selectedVariant.size : "Regular",
        is_deal: false,
        image: finalImage,
        excluded_ingredients: excludedIds,
        selected_addons: selectedAddons,
        upsell_items: selectedUpsells,
        note: finalNote,
      });
    }

    handleCloseModal();
  };

  const handleCloseModal = (e) => {
    if (e) e.stopPropagation();
    if (closePopup) closePopup();
    document.body.style.overflow = "auto";
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
  };

  const finalImage = resolveImageUrl(
    image || item?.image || item?.img || item?.image_url || item?.photo || "",
    800
  );

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleCloseModal}
    >
      <div
        className="relative w-full max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[92vh] lg:h-[82vh] lg:max-h-[720px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col lg:flex-row-reverse shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ 1. RIGHT COLUMN (Desktop Visual & Purchase Area) / TOP BANNER (Mobile) ═══ */}
        <div className="relative w-full lg:w-[380px] xl:w-[420px] bg-gradient-to-b from-gray-100 to-white dark:from-neutral-800/80 dark:to-neutral-900 flex flex-col justify-between p-4 sm:p-6 lg:p-6 overflow-hidden flex-shrink-0 lg:border-l lg:border-gray-200/80 dark:lg:border-neutral-800">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-amber-400/10 dark:bg-amber-400/5 blur-xl pointer-events-none" />

          {/* Floating Close Button */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute top-3 right-3 z-50 p-2 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md cursor-pointer border-none transition-all active:scale-90 flex items-center justify-center shadow-md"
            aria-label="Close modal"
          >
            <FaTimes className="text-xs sm:text-sm" />
          </button>

          {/* Food Cutout Image Container with Ambient Radial Amber Glow on Hover */}
          <div className="relative group/glow flex items-center justify-center my-auto w-full h-36 min-[400px]:h-44 sm:h-52 lg:h-64 p-4 select-none">
            {/* Soft subtle amber radial glow behind image */}
            <div className="absolute inset-0 m-auto w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-amber-400/25 dark:bg-amber-500/20 blur-3xl opacity-0 group-hover/glow:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Product Image with smooth micro-scale on hover */}
            <img
              src={finalImage}
              alt={title || item?.name}
              className="relative z-10 w-32 h-32 sm:w-44 sm:h-44 lg:w-56 lg:h-56 object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover/glow:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x400?text=Food";
              }}
            />
          </div>

          {/* Desktop Purchase Action Block (Hidden on mobile, visible on lg+) */}
          <div className="hidden lg:flex flex-col gap-3.5 pt-4 border-t border-gray-200/80 dark:border-neutral-800 z-10">
            {/* Price Summary Row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 font-['Oswald',sans-serif]">
                Total Amount
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-500 dark:text-amber-400 font-['Oswald',sans-serif]">
                  Rs {grandTotal}
                </span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between bg-gray-100 dark:bg-neutral-800/90 p-1.5 rounded-xl border border-gray-200 dark:border-neutral-700">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 font-['Oswald',sans-serif] pl-2">
                Quantity
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black text-gray-800 dark:text-white flex items-center justify-center cursor-pointer border-none transition-all active:scale-90 shadow-xs"
                  aria-label="Decrease quantity"
                >
                  <FaMinus className="text-[10px]" />
                </button>
                <span className="text-sm font-black text-gray-900 dark:text-white min-w-[24px] text-center font-['Oswald',sans-serif]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black text-gray-800 dark:text-white flex items-center justify-center cursor-pointer border-none transition-all active:scale-90 shadow-xs"
                  aria-label="Increase quantity"
                >
                  <FaPlus className="text-[10px]" />
                </button>
              </div>
            </div>

            {/* Desktop Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-['Oswald',sans-serif] text-base tracking-wide flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer border-none transition-all"
            >
              <FaShoppingBag className="text-sm text-neutral-950" />
              <span>ADD TO CART &bull; RS {grandTotal}</span>
            </button>
          </div>
        </div>

        {/* ═══ 2. LEFT COLUMN (Desktop Scrollable Details) / BODY (Mobile) ═══ */}
        <div className="flex-1 overflow-y-auto flex flex-col justify-between [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="p-4 sm:p-6 space-y-4">
            {/* Header Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 font-['Oswald',sans-serif]">
                  {isDeal ? (item?.badge_tag || item?.tag ? `🔥 ${item?.badge_tag || item?.tag}` : "🔥 EXCLUSIVE DEAL") : "Customize Your Order"}
                </span>
                {isDeal && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Value Pack
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-gray-900 dark:text-white m-0 mt-0.5">
              {title || item?.name || (isDeal ? "Combo Deal" : "Product Customization")}
            </h3>
            {rawDesc && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed m-0">
                {rawDesc}
              </p>
            )}
          </div>

          {/* ═════════════════════════════════════════════════
              COMBO DEAL ITEMS ACCORDIONS (When isDeal === true)
          ═════════════════════════════════════════════════ */}
          {isDeal && (
            <>
              {/* 1. ACCORDION: COMBO INCLUDES */}
              <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => toggleSection("comboIncludes")}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-2.5">
                    <FaUtensils className="text-amber-500 text-sm" />
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                        Combo Includes ({comboItems.length} Items)
                      </h4>
                      <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                        Bundled dishes & sides in this package
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide bg-amber-400/10 px-2 py-0.5 rounded-full">
                      Included
                    </span>
                    <FaChevronDown
                      className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.comboIncludes ? "rotate-180" : "rotate-0"
                        }`}
                    />
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${openSections.comboIncludes ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-0 flex flex-col gap-2 border-t border-gray-200/60 dark:border-neutral-800/80">
                      {comboItems.map((cItem, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/80 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={cItem.image}
                              alt={cItem.name}
                              className="w-10 h-10 rounded-xl object-cover p-0.5 border border-amber-400/30 bg-amber-400/10 flex-shrink-0"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                {cItem.name}
                              </span>
                              <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                                Freshly prepared portion
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-black bg-amber-400 text-gray-950 px-2.5 py-1 rounded-lg font-['Oswald',sans-serif] tracking-wider uppercase flex-shrink-0 shadow-xs">
                            {cItem.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. ACCORDION: PIZZA FLAVOR SELECTOR */}
              {hasPizzaInCombo && (
                <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleSection("pizzaFlavor")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🍕</span>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                          Choose Pizza Flavor
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Selected: <span className="font-bold text-amber-500">{selectedPizza}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                        Free Choice
                      </span>
                      <FaChevronDown
                        className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.pizzaFlavor ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSections.pizzaFlavor ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-gray-200/60 dark:border-neutral-800/80">
                        {DEFAULT_PIZZA_FLAVORS.map((flavor) => {
                          const isSelected = selectedPizza === flavor;
                          return (
                            <button
                              key={flavor}
                              type="button"
                              onClick={() => setSelectedPizza(flavor)}
                              className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-center gap-1.5 ${isSelected
                                ? "bg-amber-400 text-gray-950 border-amber-500 shadow-sm font-black ring-1 ring-amber-400"
                                : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-amber-400"
                                }`}
                            >
                              {isSelected && <FaCheck className="text-[10px]" />}
                              <span>{flavor}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ACCORDION: FRIES FLAVOR SELECTOR */}
              {hasFriesInCombo && (
                <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleSection("friesFlavor")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🍟</span>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                          Choose Fries Flavor
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Selected: <span className="font-bold text-amber-500">{selectedFries}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                        Free Choice
                      </span>
                      <FaChevronDown
                        className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.friesFlavor ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSections.friesFlavor ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 grid grid-cols-3 gap-2 border-t border-gray-200/60 dark:border-neutral-800/80">
                        {DEFAULT_FRIES_FLAVORS.map((flavor) => {
                          const isSelected = selectedFries === flavor;
                          return (
                            <button
                              key={flavor}
                              type="button"
                              onClick={() => setSelectedFries(flavor)}
                              className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-center gap-1.5 ${isSelected
                                ? "bg-amber-400 text-gray-950 border-amber-500 shadow-sm font-black ring-1 ring-amber-400"
                                : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-amber-400"
                                }`}
                            >
                              {isSelected && <FaCheck className="text-[10px]" />}
                              <span>{flavor}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ACCORDION: DRINK FLAVOR SELECTOR */}
              {hasDrinkInCombo && (
                <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleSection("drinkFlavor")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <FaGlassMartiniAlt className="text-red-500 text-sm" />
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                          Choose Drink Flavor
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Selected: <span className="font-bold text-amber-500">{selectedDrink}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                        Free Choice
                      </span>
                      <FaChevronDown
                        className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.drinkFlavor ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSections.drinkFlavor ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-200/60 dark:border-neutral-800/80">
                        {DEFAULT_DRINK_FLAVORS.map((flavor) => {
                          const isSelected = selectedDrink === flavor;
                          return (
                            <button
                              key={flavor}
                              type="button"
                              onClick={() => setSelectedDrink(flavor)}
                              className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-center gap-1.5 ${isSelected
                                ? "bg-amber-400 text-gray-950 border-amber-500 shadow-sm font-black ring-1 ring-amber-400"
                                : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-amber-400"
                                }`}
                            >
                              {isSelected && <FaCheck className="text-[10px]" />}
                              <span>{flavor}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═════════════════════════════════════════════════
              REGULAR PRODUCT VARIANT SELECTOR (When !isDeal)
          ═════════════════════════════════════════════════ */}
          {!isDeal && fullItem?.variants && fullItem.variants.length > 1 && (
            <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl p-4 border border-gray-200/80 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 font-['Oswald',sans-serif]">
                  Choose An Option <span className="text-red-600">*</span>
                </span>
                <span className="text-[11px] font-semibold bg-red-600/10 text-red-600 dark:bg-red-600/20 px-2 py-0.5 rounded-full">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(fullItem.variants || []).map((v, idx) => {
                  const isSelected = selectedVariant?.size === v.size;
                  const isOutOfStock = v.inStock === false || v.inStock === 0 || v.inStock === "0";

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${isSelected
                        ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-sm ring-2 ring-amber-400"
                        : "bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-amber-400"
                        } ${isOutOfStock ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                    >
                      <span className="text-xs font-bold uppercase">{v.size}</span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1 font-['Oswald',sans-serif]">
                        {isOutOfStock ? "Out of Stock" : `Rs ${v.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════
              DYNAMIC MAPPED ADDON GROUPS (Deals & Products)
          ═════════════════════════════════════════════════ */}

              {/* 2. DYNAMIC MAPPED ADDON GROUPS */}
              {mappedAddonGroups.length > 0 &&
                mappedAddonGroups.map((group) => {
                  const sectionKey = `group_${group.id || group.name}`;
                  const isSectionOpen = openSections[sectionKey] ?? true;
                  const isSingle = group.type === "single_choice";
                  const groupItems = Array.isArray(group.items) ? group.items : [];

                  if (groupItems.length === 0) return null;

                  const groupKey = (group.group_id || group.name || "").toLowerCase();
                  const groupTitle =
                    group.group_title ||
                    group.title ||
                    (groupKey.includes("drink")
                      ? "COMPLETE WITH A DRINK"
                      : groupKey.includes("pair") || groupKey.includes("perfect")
                      ? "PERFECT PAIRINGS"
                      : groupKey.includes("sauc") || groupKey.includes("dip")
                      ? "ADD SOME DIPS"
                      : group.name);

                  const groupSubtitle =
                    group.subtitle ||
                    group.custom_label ||
                    (isSingle ? "Choose 1 option" : "Select any options");

                  return (
                    <div
                      key={group.id || group.name}
                      className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(sectionKey)}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                      >
                        <div className="flex items-center gap-2.5">
                          {getCategoryIcon(group.group_id || group.name)}
                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                              {groupTitle}
                            </h4>
                            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                              {groupSubtitle}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              group.is_required
                                ? "bg-red-600/10 text-red-600 dark:bg-red-600/20 font-bold"
                                : "bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {group.is_required ? "Required" : "Optional"}
                          </span>
                          <FaChevronDown
                            className={`text-xs text-gray-400 transition-transform duration-300 ${
                              isSectionOpen ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </div>
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isSectionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-200/50 dark:border-neutral-800/80">
                            {groupItems.map((addonItem) => {
                              const isSelected = Boolean(
                                selectedUpsells.find(
                                  (u) => u.id === addonItem.id && u.addon_group === group.name
                                )
                              );
                              const price = parseFloat(addonItem.price || 0);

                              return (
                                <button
                                  key={addonItem.id}
                                  type="button"
                                  onClick={() => toggleMappedAddon(group, addonItem)}
                                  className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                                    isSelected
                                      ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-xs ring-1 ring-amber-400"
                                      : "bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-amber-400"
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full mb-1 gap-1">
                                    <span className="text-xs font-bold truncate">
                                      {addonItem.item_name || addonItem.name}
                                    </span>
                                    {isSelected ? (
                                      <FaCheck className="text-[10px] text-amber-500 shrink-0" />
                                    ) : isSingle ? (
                                      <span className="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-neutral-600 shrink-0" />
                                    ) : (
                                      <FaPlus className="text-[10px] text-gray-400 shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between w-full mt-1">
                                    {addonItem.category && (
                                      <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 dark:text-neutral-500 truncate max-w-[80px]">
                                        {addonItem.category}
                                      </span>
                                    )}
                                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif] ml-auto">
                                      +Rs {price}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* 6. ACCORDION: CUSTOMIZE INGREDIENTS */}
              {!isDeal && optionalIngredients.length > 0 && (
                <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleSection("ingredients")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <FaSlidersH className="text-gray-500 text-sm" />
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                          Customize Ingredients
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Uncheck to remove ingredients from your meal
                        </span>
                      </div>
                    </div>
                    <FaChevronDown
                      className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.ingredients ? "rotate-180" : "rotate-0"
                        }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSections.ingredients ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-gray-200/50 dark:border-neutral-800/80">
                        {optionalIngredients.map((ing, idx) => {
                          const isExcluded = excludedIds.includes(ing.inventory_id);

                          return (
                            <label
                              key={idx}
                              className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${isExcluded
                                ? "bg-gray-100 dark:bg-neutral-800/50 text-gray-400 line-through border-gray-200 dark:border-neutral-800 opacity-60"
                                : "bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-neutral-700"
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={!isExcluded}
                                onChange={() => toggleRemovable(ing.inventory_id)}
                                className="accent-amber-400 cursor-pointer"
                              />
                              <span>{ing.ingredient_name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

          {/* Special Instructions Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 font-['Oswald',sans-serif] block mb-1.5">
              Special Instructions
            </label>
            <textarea
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="e.g. Extra crispy, sauce on the side..."
              rows={2}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-800 outline-none focus:border-amber-400 transition-colors duration-200 resize-none font-medium"
            />
          </div>
        </div>

        {/* ═══ 3. MOBILE STICKY BOTTOM CHECKOUT ACTION BAR (Hidden on lg+) ═══ */}
        <div className="lg:hidden sticky bottom-0 z-30 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-gray-200 dark:border-white/10 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 p-1 sm:p-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 shrink-0">
              <button
                type="button"
                onClick={decreaseQuantity}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black text-gray-800 dark:text-white flex items-center justify-center cursor-pointer border-none transition-all active:scale-90"
                aria-label="Decrease quantity"
              >
                <FaMinus className="text-[10px]" />
              </button>
              <span className="text-xs sm:text-sm md:text-base font-black text-gray-900 dark:text-white min-w-[18px] text-center font-['Oswald',sans-serif]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increaseQuantity}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black text-gray-800 dark:text-white flex items-center justify-center cursor-pointer border-none transition-all active:scale-90"
                aria-label="Increase quantity"
              >
                <FaPlus className="text-[10px]" />
              </button>
            </div>

            {/* Standalone Add to Cart Button with Full Price */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-['Oswald',sans-serif] text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer border-none transition-all"
            >
              <FaShoppingBag className="text-xs sm:text-sm text-neutral-950" />
              <span>ADD TO CART &bull; RS {grandTotal}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupCard;