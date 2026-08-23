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

const DEFAULT_DRINK_FLAVORS = ["Coca-Cola", "7Up", "Mountain Dew", "Sprite", "Fanta", "Diet Coke"];
const DEFAULT_PIZZA_FLAVORS = ["Chicken Tikka", "Chicken Fajita", "Peri Peri", "Supreme"];
const DEFAULT_FRIES_FLAVORS = ["Plain Salted", "Masala Fries", "Garlic Mayo Fries"];

const DEAL_ADDONS = [
  { id: "extra-garlic-mayo", name: "Extra Garlic Mayo Dip", price: 50 },
  { id: "extra-red-chilli", name: "Extra Red Chilli Dip", price: 50 },
  { id: "extra-cheese-slice", name: "Extra Cheese Slice", price: 60 },
  { id: "extra-dinner-roll", name: "Extra Warm Dinner Roll", price: 40 },
];

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
  const [selectedDealAddons, setSelectedDealAddons] = useState([]);

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

  // Fetch full menu items for upsells
  const { data: allMenuItems = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data.filter((i) => i.isAvailable) : [];
    },
  });

  // Category Detection
  const currentCat = (item?.category_name || item?.category || "").toLowerCase();
  const isDrinkItem = currentCat.includes("drink") || currentCat.includes("beverage");
  const isSauceItem = currentCat.includes("sause") || currentCat.includes("sauce") || currentCat.includes("dip");
  const isFriesItem = currentCat.includes("potato") || currentCat.includes("fries");

  // Filter Upsell Categories for Regular Items
  const drinksList = useMemo(() => {
    if (isDrinkItem || isDeal) return [];
    return allMenuItems
      .filter((i) => {
        const cat = (i.category || "").toLowerCase();
        return (cat === "drinks" || cat === "drink") && i.id !== item?.id;
      })
      .slice(0, 6);
  }, [allMenuItems, item, isDrinkItem, isDeal]);

  const friesList = useMemo(() => {
    if (isFriesItem || isDeal) return [];
    return allMenuItems
      .filter((i) => {
        const cat = (i.category || "").toLowerCase();
        return (cat.includes("potato") || cat.includes("fries")) && i.id !== item?.id;
      })
      .slice(0, 4);
  }, [allMenuItems, item, isFriesItem, isDeal]);

  const dipsList = useMemo(() => {
    if (isSauceItem || isDeal) return [];
    return allMenuItems
      .filter((i) => {
        const cat = (i.category || "").toLowerCase();
        return (cat.includes("sause") || cat.includes("sauce") || cat.includes("dip")) && i.id !== item?.id;
      })
      .slice(0, 6);
  }, [allMenuItems, item, isSauceItem, isDeal]);

  const pairingsList = useMemo(() => {
    if (isDeal) return [];
    const name = (item?.name || item?.title || "").toLowerCase();
    let keywords = [];

    if (name.includes("burger")) keywords = ["wings", "fries", "strips", "drink"];
    else if (name.includes("pizza")) keywords = ["wings", "bread", "drink", "dip"];
    else if (name.includes("broast") || name.includes("chicken")) keywords = ["roll", "fries", "dip", "drink"];
    else if (name.includes("wrap") || name.includes("shawarma")) keywords = ["fries", "drink", "dip"];
    else keywords = ["burger", "pizza", "wings", "fries"];

    return allMenuItems
      .filter((i) => {
        if (i.id === item?.id) return false;
        const iCat = (i.category || i.category_name || "").toLowerCase();
        if (currentCat && iCat && (currentCat === iCat || currentCat.includes(iCat) || iCat.includes(currentCat))) {
          return false;
        }
        const iName = (i.name || "").toLowerCase();
        return keywords.some((kw) => iName.includes(kw) || iCat.includes(kw));
      })
      .slice(0, 4);
  }, [allMenuItems, item, currentCat, isDeal]);

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
  const dealAddonsTotal = selectedDealAddons.reduce((sum, a) => sum + parseFloat(a.price || 0), 0);
  const upsellsTotal = selectedUpsells.reduce((sum, u) => sum + parseFloat(u.selectedPrice || 0), 0);

  const singleUnitTotal = isDeal ? basePrice + dealAddonsTotal : basePrice + addonsTotal + upsellsTotal;
  const grandTotal = singleUnitTotal * quantity;

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Add To Cart Dispatch
  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();

    if (isDeal) {
      const comboSummary = comboItems.map((c) => `${c.qty} ${c.name}`).join(", ");
      const addonsSummary = selectedDealAddons.map((a) => a.name).join(", ");
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
          addOns: selectedDealAddons,
        },
        addons: selectedDealAddons,
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
        className="relative w-full max-w-lg md:max-w-3xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ 1. TOP FOOD BANNER (Image First) ═══ */}
        <div className="relative w-full h-40 min-[400px]:h-44 sm:h-52 bg-gradient-to-b from-gray-100 to-white dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4 overflow-hidden flex-shrink-0">
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

          {/* Food Cutout Image */}
          <img
            src={finalImage}
            alt={title || item?.name}
            className="relative z-10 w-32 h-32 sm:w-44 sm:h-44 object-contain drop-shadow-2xl transition-transform duration-500 ease-out hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x400?text=Food";
            }}
          />
        </div>

        {/* ═══ 2. SINGLE SCROLLABLE CONTENT BODY ═══ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full">
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

              {/* 5. ACCORDION: OPTIONAL DEAL ADD-ONS */}
              <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => toggleSection("dealAddons")}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-2.5">
                    <FaPepperHot className="text-amber-500 text-sm" />
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                        Extra Add-ons & Sauces
                      </h4>
                      <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                        Add garlic mayo, cheese slice, or dinner rolls
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 bg-gray-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                    <FaChevronDown
                      className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.dealAddons ? "rotate-180" : "rotate-0"
                        }`}
                    />
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${openSections.dealAddons ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-gray-200/60 dark:border-neutral-800/80">
                      {DEAL_ADDONS.map((addon) => {
                        const isSelected = Boolean(selectedDealAddons.find((a) => a.id === addon.id));

                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => toggleDealAddon(addon)}
                            className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between ${isSelected
                              ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-xs"
                              : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-amber-400"
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${isSelected ? "bg-amber-400 text-gray-950 font-black" : "border border-gray-300 dark:border-neutral-600"
                                  }`}
                              >
                                {isSelected && <FaCheck />}
                              </div>
                              <span className="text-xs font-bold">{addon.name}</span>
                            </div>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
                              +Rs {addon.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════
              REGULAR PRODUCT CUSTOMIZER (When !isDeal)
          ═════════════════════════════════════════════════ */}
          {!isDeal && (
            <>
              {/* 1. PRIMARY VARIANT SELECTOR */}
              {fullItem?.variants && fullItem.variants.length > 1 && (
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

              {/* 2. ACCORDION: COMPLETE WITH A DRINK */}
              {drinksList.length > 0 && (
                <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleSection("drinks")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <FaGlassMartiniAlt className="text-red-600 text-sm" />
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                          Complete With a Drink
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Refreshing soft drinks & water
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                      <FaChevronDown
                        className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.drinks ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSections.drinks ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-200/50 dark:border-neutral-800/80">
                        {drinksList.map((drink) => {
                          const isSelected = Boolean(selectedUpsells.find((u) => u.id === drink.id));
                          const dPrice = drink.variants && drink.variants.length > 0 ? drink.variants[0].price : drink.price;

                          return (
                            <button
                              key={drink.id}
                              type="button"
                              onClick={() => toggleUpsell(drink)}
                              className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${isSelected
                                ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-xs"
                                : "bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-amber-400"
                                }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-xs font-bold truncate">{drink.name}</span>
                                {isSelected && <FaCheck className="text-[10px] text-amber-500" />}
                              </div>
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
                                +Rs {dPrice}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ACCORDION: DON'T FORGET THE FRIES */}
              {friesList.length > 0 && (
                <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleSection("fries")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <FaUtensils className="text-amber-500 text-sm" />
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                          Don't Forget the Fries!
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Crispy golden fries & potato wedges
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                      <FaChevronDown
                        className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.fries ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSections.fries ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-gray-200/50 dark:border-neutral-800/80">
                        {friesList.map((fry) => {
                          const isSelected = Boolean(selectedUpsells.find((u) => u.id === fry.id));
                          const fPrice = fry.variants && fry.variants.length > 0 ? fry.variants[0].price : fry.price;

                          return (
                            <button
                              key={fry.id}
                              type="button"
                              onClick={() => toggleUpsell(fry)}
                              className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${isSelected
                                ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-xs"
                                : "bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-amber-400"
                                }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-xs font-bold truncate">{fry.name}</span>
                                {isSelected && <FaCheck className="text-[10px] text-amber-500" />}
                              </div>
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
                                +Rs {fPrice}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ACCORDION: ADD SOME DIPS */}
              {dipsList.length > 0 && (
                <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleSection("dips")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <FaPepperHot className="text-red-500 text-sm" />
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                          Add Some Dips
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Garlic mayo, spicy dip & sauces
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                      <FaChevronDown
                        className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.dips ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSections.dips ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-200/50 dark:border-neutral-800/80">
                        {dipsList.map((dip) => {
                          const isSelected = Boolean(selectedUpsells.find((u) => u.id === dip.id));
                          const dPrice = dip.variants && dip.variants.length > 0 ? dip.variants[0].price : dip.price;

                          return (
                            <button
                              key={dip.id}
                              type="button"
                              onClick={() => toggleUpsell(dip)}
                              className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${isSelected
                                ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-xs"
                                : "bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-amber-400"
                                }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-xs font-bold truncate">{dip.name}</span>
                                {isSelected && <FaCheck className="text-[10px] text-amber-500" />}
                              </div>
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
                                +Rs {dPrice}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. ACCORDION: PERFECT PAIRINGS */}
              {pairingsList.length > 0 && (
                <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleSection("pairings")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <FaFire className="text-amber-500 text-sm" />
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                          Perfect Pairings
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Recommended favorites that go great together
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                      <FaChevronDown
                        className={`text-xs text-gray-400 transition-transform duration-300 ${openSections.pairings ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSections.pairings ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-gray-200/50 dark:border-neutral-800/80">
                        {pairingsList.map((pairing) => {
                          const isSelected = Boolean(selectedUpsells.find((u) => u.id === pairing.id));
                          const pPrice = pairing.variants && pairing.variants.length > 0 ? pairing.variants[0].price : pairing.price;

                          return (
                            <button
                              key={pairing.id}
                              type="button"
                              onClick={() => toggleUpsell(pairing)}
                              className={`p-3 rounded-xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between ${isSelected
                                ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-xs"
                                : "bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-amber-400"
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={resolveImageUrl(pairing.img || pairing.image, 100)}
                                  alt={pairing.name}
                                  className="w-9 h-9 rounded-lg object-contain bg-gray-50 dark:bg-neutral-800 p-0.5"
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold truncate max-w-[130px]">{pairing.name}</span>
                                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
                                    +Rs {pPrice}
                                  </span>
                                </div>
                              </div>
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isSelected ? "bg-amber-400 text-gray-950 font-black" : "bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300"
                                  }`}
                              >
                                {isSelected ? <FaCheck className="text-[10px]" /> : <FaPlus className="text-[10px]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. ACCORDION: CUSTOMIZE INGREDIENTS */}
              {optionalIngredients.length > 0 && (
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
            </>
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

        {/* ═══ 3. STICKY BOTTOM CHECKOUT ACTION BAR ═══ */}
        <div className="sticky bottom-0 z-30 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-gray-200 dark:border-white/10 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
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

        {/* Mobile Fixed Bottom Control */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 flex items-center justify-between gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
           <div className="flex items-center gap-4 bg-gray-100 rounded-xl px-4 py-3 shrink-0">
               <button className="border-none bg-transparent text-gray-600 font-bold p-1 cursor-pointer" onClick={decreaseQuantity}>
                 <FaMinus size={12} />
               </button>
               <span className="text-lg font-black text-black min-w-[20px] text-center">{quantity}</span>
               <button className="border-none bg-transparent text-[#e4002b] font-bold p-1 cursor-pointer" onClick={increaseQuantity}>
                 <FaPlus size={12} />
               </button>
           </div>
           
           <button
              className="flex-1 bg-[#e4002b] text-white border-none py-3 px-4 rounded-xl font-black text-base uppercase tracking-wide cursor-pointer hover:bg-[#c40022] transition-colors flex justify-between items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={selectedVariant && (selectedVariant.inStock === false || selectedVariant.inStock === 0 || selectedVariant.inStock === "0")}
            >
              <span>Add to bucket</span>
              <span>Rs {finalTotal}</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default PopupCard;