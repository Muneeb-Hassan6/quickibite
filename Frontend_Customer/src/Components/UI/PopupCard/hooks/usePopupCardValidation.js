import { useEffect } from "react";
import { resolveImageUrl } from "../../../../utils/imageOptimizer";

export function usePopupCardValidation({
  image,
  item,
  title,
  closePopup,
  addToCart,
}) {
  // Body Scroll Lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "unset";
      document.body.style.paddingRight = originalPaddingRight || "unset";
    };
  }, []);

  const finalImage = resolveImageUrl(
    image || item?.image || item?.img || item?.image_url || item?.photo || "",
    800
  );

  const handleCloseModal = (e) => {
    if (e) e.stopPropagation();
    if (closePopup) closePopup();
    document.body.style.overflow = "auto";
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
  };

  const buildAndAddToCart = ({
    isDeal,
    comboItems,
    selectedUpsells,
    hasPizzaInCombo,
    selectedPizza,
    hasFriesInCombo,
    selectedFries,
    hasDrinkInCombo,
    selectedDrink,
    specialNote,
    singleUnitTotal,
    quantity,
    excludedIds,
    optionalIngredients,
    selectedVariant,
    selectedAddons,
    e,
  }) => {
    if (e) e.stopPropagation();

    if (isDeal) {
      const comboSummary = comboItems
        .map((c) => `${c.qty} ${c.name}`)
        .join(", ");
      const addonsSummary = selectedUpsells.map((a) => a.name).join(", ");
      let noteParts = [];
      if (hasPizzaInCombo) noteParts.push(`Pizza: ${selectedPizza}`);
      if (hasFriesInCombo) noteParts.push(`Fries: ${selectedFries}`);
      if (hasDrinkInCombo) noteParts.push(`Drink: ${selectedDrink}`);
      if (addonsSummary) noteParts.push(`Addons: ${addonsSummary}`);
      if (specialNote) noteParts.push(`Note: ${specialNote}`);

      addToCart({
        id: item?.id
          ? item.id.toString().startsWith("deal-")
            ? item.id
            : `deal-${item.id}`
          : `deal-${Date.now()}`,
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
        note: `Combo: ${comboSummary}${
          noteParts.length ? ` | ${noteParts.join(" | ")}` : ""
        }`,
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
        finalNote = specialNote
          ? `Without: ${excludedNames} | ${specialNote}`
          : `Without: ${excludedNames}`;
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

  return {
    finalImage,
    handleCloseModal,
    buildAndAddToCart,
  };
}
