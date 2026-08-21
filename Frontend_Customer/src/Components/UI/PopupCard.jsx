import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../../Context/CartContext";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { optimizeCloudinaryImage } from "../../utils/imageOptimizer";

const PopupCard = ({ image, title, description, price, item, closePopup }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [excludedIds, setExcludedIds] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedGroupAddons, setSelectedGroupAddons] = useState({});
  const [openAccordion, setOpenAccordion] = useState("variants");

  useEffect(() => {
    if (item?.variants && item.variants.length > 0) {
      const firstAvailableVariant =
        item.variants.find((v) => v.inStock !== false && v.inStock !== 0) ||
        item.variants[0];
      setSelectedVariant(firstAvailableVariant);
    }
  }, [item]);

  const { data: optionalIngredients = [], isLoading: isRecipeLoading } = useQuery({
    queryKey: ['recipe', item?.id, selectedVariant?.size],
    queryFn: async () => {
      if (!item || !selectedVariant) return [];
      const recipeRes = await fetch(`${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${item.id}&variant_name=${selectedVariant.size}`);
      const recipeData = await recipeRes.json();
      if (recipeRes.ok && recipeData.status === "success") {
        return recipeData.ingredients.filter((ing) => ing.is_removable == 1);
      }
      return [];
    },
    enabled: Boolean(item?.id && selectedVariant?.size),
  });

  const { data: addonsList = [], isLoading: isAddonsLoading } = useQuery({
    queryKey: ['addons', item?.id],
    queryFn: async () => {
      if (!item) return [];
      const addonsRes = await fetch(`${import.meta.env.VITE_API_BASE}/get_addons.php?menu_item_id=${item.id}`);
      const addonsData = await addonsRes.json();
      if (addonsRes.ok && addonsData.status === "success" && addonsData.addons) {
        return addonsData.addons;
      }
      return [];
    },
    enabled: Boolean(item?.id),
  });

  const { data: addonGroups = [] } = useQuery({
    queryKey: ['addonGroups', item?.category],
    queryFn: async () => {
      if (!item?.category) return [];
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/addon_groups.php?action=get_for_product&category=${item.category}`);
      const data = await res.json();
      if (data.status === "success" && data.addon_groups) {
        return data.addon_groups;
      }
      return [];
    },
    enabled: Boolean(item?.category),
  });

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

  const toggleGroupAddon = (group, gItem) => {
    setSelectedGroupAddons((prev) => {
      const currentSelected = prev[group.id] || [];
      if (group.type === 'single_choice') {
        return { ...prev, [group.id]: [gItem.id] };
      } else {
        const isSelected = currentSelected.includes(gItem.id);
        if (isSelected) {
          return { ...prev, [group.id]: currentSelected.filter(id => id !== gItem.id) };
        } else {
          return { ...prev, [group.id]: [...currentSelected, gItem.id] };
        }
      }
    });
  };

  const currentPrice = selectedVariant ? parseInt(selectedVariant.price) : parseInt(price);
  
  const oldAddonsTotal = selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.addon_price), 0);
  
  const groupedAddonsTotal = addonGroups.reduce((sum, group) => {
    const selectedIds = selectedGroupAddons[group.id] || [];
    const groupSum = selectedIds.reduce((s, id) => {
      const gItem = group.items.find(i => i.id === id);
      return s + (gItem ? parseFloat(gItem.price) : 0);
    }, 0);
    return sum + groupSum;
  }, 0);

  const finalTotal = (currentPrice + oldAddonsTotal + groupedAddonsTotal) * quantity;

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => { if (quantity > 1) setQuantity(quantity - 1); };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    // Validation for required groups
    const missingRequired = addonGroups.find(g => g.is_required == 1 && (!selectedGroupAddons[g.id] || selectedGroupAddons[g.id].length === 0));
    if (missingRequired) {
      setOpenAccordion(`group-${missingRequired.id}`);
      alert(`Please select an option for: ${missingRequired.name}`);
      return;
    }

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

    // Old Addons
    selectedAddons.forEach((addon) => {
      addToCart({
        id: `addon-${addon.id}-${item.id}`,
        title: addon.addon_name,
        price: parseFloat(addon.addon_price),
        size: "Extra",
        note: `For ${title || item.name || "Item"}`,
        is_addon: true,
        addon_data: { inventory_id: addon.inventory_id, qty: addon.qty_to_deduct },
        qty: quantity,
      });
    });

    // New Grouped Addons
    addonGroups.forEach(group => {
      const selectedIds = selectedGroupAddons[group.id] || [];
      selectedIds.forEach(id => {
        const gItem = group.items.find(i => i.id === id);
        if (gItem) {
          addToCart({
            id: `grouped-addon-${gItem.id}-${item.id}`,
            title: gItem.item_name,
            price: parseFloat(gItem.price),
            size: "Regular", // Must be Regular to match default recipe variants
            note: `Addon for ${title || item.name || "Item"}`,
            menuItemId: gItem.id, // Backend will treat this as a standard menu item
            qty: quantity,
          });
        }
      });
    });

    closePopup();
  };

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? "" : id);
  };

  const AccordionHeader = ({ id, title, isRequired }) => {
    const isOpen = openAccordion === id;
    return (
      <button 
        onClick={() => toggleAccordion(id)}
        className={`w-full flex justify-between items-center px-4 py-3 border-none cursor-pointer text-white font-bold text-lg transition-colors ${isOpen ? 'bg-[#e4002b]' : 'bg-[#e4002b] hover:bg-[#c40022]'}`}
      >
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {!isRequired && <span className="text-sm font-normal opacity-90">(Optional)</span>}
          {isOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex justify-center items-center md:p-6" onClick={closePopup}>
      {/* KFC Style Modal: Full page on mobile, large centered box on desktop */}
      <div 
        className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[1000px] md:rounded-2xl shadow-2xl flex flex-col md:flex-row relative overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={closePopup}
          className="absolute top-4 right-4 bg-[#e4002b] text-white w-10 h-10 rounded-md flex justify-center items-center z-50 hover:bg-[#c40022] transition-colors border-none cursor-pointer"
        >
          <FaTimes size={20} />
        </button>

        {/* Mobile: Image on top */}
        <div className="md:hidden w-full h-[250px] bg-gray-100 relative shrink-0">
          <img src={optimizeCloudinaryImage(image || "https://placehold.co/600x400?text=No+Image", 600)} alt={title} className="w-full h-full object-contain p-4" />
        </div>

        {/* Left Side: Options (Scrollable) */}
        <div className="w-full md:w-[60%] h-full overflow-y-auto p-4 md:p-8 flex flex-col gap-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
          
          <div className="md:hidden mb-4">
            <h2 className="text-3xl font-black text-black uppercase leading-tight mb-2">{title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>

          {/* Variants */}
          {item?.variants && item.variants.length > 1 && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <AccordionHeader id="variants" title="Choose an option" isRequired={true} />
              {openAccordion === "variants" && (
                <div className="bg-gray-50 flex flex-col">
                  {item.variants.map((variant, index) => {
                    const isOutOfStock = variant.inStock === false || variant.inStock === 0 || variant.inStock === "0";
                    const isSelected = selectedVariant?.size === variant.size;
                    return (
                      <label key={index} className={`flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#e4002b]' : 'border-gray-400'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-[#e4002b] rounded-full"></div>}
                          </div>
                          <span className="text-black font-semibold text-base">{variant.size} {isOutOfStock && "(Sold Out)"}</span>
                        </div>
                        <span className="text-gray-600 text-sm">+Rs {variant.price}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Groups from API */}
          {addonGroups.map(group => (
            <div key={group.id} className="rounded-lg overflow-hidden border border-gray-200">
              <AccordionHeader id={`group-${group.id}`} title={group.custom_label || group.name} isRequired={group.is_required == 1} />
              {openAccordion === `group-${group.id}` && (
                <div className="bg-gray-50 flex flex-col">
                  {group.items.map((gItem) => {
                    const isSelected = (selectedGroupAddons[group.id] || []).includes(gItem.id);
                    const inputType = group.type === 'single_choice' ? 'radio' : 'checkbox';
                    
                    return (
                      <label key={gItem.id} className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          {inputType === 'radio' ? (
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#e4002b]' : 'border-gray-400'}`}>
                               {isSelected && <div className="w-2.5 h-2.5 bg-[#e4002b] rounded-full"></div>}
                             </div>
                          ) : (
                             <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center ${isSelected ? 'border-[#e4002b] bg-[#e4002b]' : 'border-gray-400 bg-white'}`}>
                               {isSelected && <FaPlus color="white" size={10} style={{ transform: 'rotate(45deg)' }} />}
                             </div>
                          )}
                          <span className="text-black font-semibold text-base">{gItem.item_name}</span>
                        </div>
                        <span className="text-gray-600 text-sm">{gItem.price > 0 ? `+Rs ${gItem.price}` : 'Free'}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Old Addons Fallback */}
          {addonsList.length > 0 && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <AccordionHeader id="old_addons" title="Extra Add-ons" isRequired={false} />
              {openAccordion === "old_addons" && (
                <div className="bg-gray-50 flex flex-col">
                  {addonsList.map((addon) => {
                    const isSelected = selectedAddons.find(a => a.id === addon.id);
                    return (
                      <label key={addon.id} className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                           <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center ${isSelected ? 'border-[#e4002b] bg-[#e4002b]' : 'border-gray-400 bg-white'}`}>
                             {isSelected && <FaPlus color="white" size={10} style={{ transform: 'rotate(45deg)' }} />}
                           </div>
                          <span className="text-black font-semibold text-base">{addon.addon_name}</span>
                        </div>
                        <span className="text-gray-600 text-sm">+Rs {addon.addon_price}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Ingredients */}
          {optionalIngredients.length > 0 && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <AccordionHeader id="ingredients" title="Remove Ingredients" isRequired={false} />
              {openAccordion === "ingredients" && (
                <div className="bg-gray-50 flex flex-col">
                  {optionalIngredients.map((ing) => {
                    const isExcluded = excludedIds.includes(ing.inventory_id);
                    return (
                      <label key={ing.inventory_id} className={`flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${isExcluded ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-3">
                           <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center ${!isExcluded ? 'border-[#e4002b] bg-[#e4002b]' : 'border-gray-400 bg-white'}`}>
                             {!isExcluded && <FaPlus color="white" size={10} style={{ transform: 'rotate(45deg)' }} />}
                           </div>
                          <span className={`text-black font-semibold text-base ${isExcluded ? 'line-through' : ''}`}>{ing.ingredient_name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Special Instructions */}
          <div className="mt-4">
             <h4 className="text-black font-bold text-lg mb-2">Special Instructions</h4>
             <textarea
               className="w-full bg-gray-50 text-black border border-gray-300 rounded-lg p-3 text-sm outline-none resize-none focus:border-[#e4002b]"
               placeholder="e.g. Cut in half, extra crispy..."
               rows="2"
               value={specialNote}
               onChange={(e) => setSpecialNote(e.target.value)}
             ></textarea>
          </div>
          
          {/* Spacer for mobile fixed bottom bar */}
          <div className="h-[120px] md:hidden w-full"></div>
        </div>

        {/* Right Side: Image & Cart Controls (Desktop) */}
        <div className="hidden md:flex w-[40%] bg-white flex-col border-l border-gray-200">
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="w-full aspect-square mb-6">
              <img src={optimizeCloudinaryImage(image || "https://placehold.co/600x400?text=No+Image", 600)} alt={title} className="w-full h-full object-contain filter drop-shadow-xl" />
            </div>
            <h2 className="text-3xl font-black text-black uppercase leading-tight mb-2 text-center">{title}</h2>
            <p className="text-gray-600 text-sm text-center leading-relaxed">{description}</p>
          </div>
          
          {/* Desktop Fixed Bottom Control */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex justify-center items-center gap-6 mb-4">
               <button className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex justify-center items-center cursor-pointer hover:border-[#e4002b] hover:text-[#e4002b]" onClick={decreaseQuantity}>
                 <FaMinus size={12} />
               </button>
               <span className="text-2xl font-black text-black">{quantity}</span>
               <button className="w-10 h-10 rounded-full border-2 border-[#e4002b] bg-[#e4002b] text-white flex justify-center items-center cursor-pointer hover:bg-[#c40022]" onClick={increaseQuantity}>
                 <FaPlus size={12} />
               </button>
            </div>
            <button
              className="w-full bg-[#e4002b] text-white border-none py-4 rounded-xl font-black text-lg uppercase tracking-wide cursor-pointer hover:bg-[#c40022] transition-colors flex justify-between items-center px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={selectedVariant && (selectedVariant.inStock === false || selectedVariant.inStock === 0 || selectedVariant.inStock === "0")}
            >
              <span>Add to bucket</span>
              <span>Rs {finalTotal}</span>
            </button>
          </div>
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