import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaCheckSquare,
  FaRegSquare,
  FaSpinner,
  FaBookOpen,
} from "react-icons/fa";

const RecipeModal = ({ isOpen, onClose, menuItem, inventoryItems }) => {
  const [ingredients, setIngredients] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState("");

  useEffect(() => {
    if (isOpen && menuItem) {
      if (menuItem.variants && menuItem.variants.length > 0) {
        setSelectedVariant(menuItem.variants[0].size);
      } else {
        setSelectedVariant("Regular");
      }
    } else {
      setIngredients([]);
      setSelectedVariant("");
    }
  }, [isOpen, menuItem]);

  useEffect(() => {
    if (isOpen && menuItem && selectedVariant) {
      const fetchExistingRecipe = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${menuItem.id}&variant_name=${selectedVariant}`,
          );
          const data = await response.json();

          if (
            response.ok &&
            data.status === "success" &&
            data.ingredients.length > 0
          ) {
            const existingIngredients = data.ingredients.map((ing) => ({
              inventory_id: ing.inventory_id,
              qty: ing.qty,
              is_removable: ing.is_removable == 1,
            }));
            setIngredients(existingIngredients);
          } else {
            setIngredients([
              { inventory_id: "", qty: "", is_removable: false },
            ]);
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          setIngredients([{ inventory_id: "", qty: "", is_removable: false }]);
        } finally {
          setIsFetching(false);
        }
      };

      fetchExistingRecipe();
    }
  }, [isOpen, menuItem, selectedVariant]);

  if (!isOpen || !menuItem) return null;

  const addIngredientRow = () => {
    setIngredients([
      ...ingredients,
      { inventory_id: "", qty: "", is_removable: false },
    ]);
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async () => {
    const validIngredients = ingredients.filter(
      (ing) => ing.inventory_id !== "" && Number(ing.qty) > 0,
    );

    if (validIngredients.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "Empty Recipe",
        text: "Please add at least one valid ingredient with quantity greater than 0.",
        background: "#171717",
        color: "#fff",
      });
    }

    const payload = {
      menu_item_id: menuItem.id,
      variant_name: selectedVariant,
      ingredients: validIngredients,
    };

    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/save_recipe.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Recipe Saved!",
          text: `Recipe for ${menuItem.name} (${selectedVariant}) updated successfully.`,
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        onClose();
      } else {
        throw new Error(data.message || "Failed to save recipe");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save recipe.",
        background: "#171717",
        color: "#fff",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-2xl bg-[var(--admin-panel,#171717)] border border-[var(--admin-border,rgba(255,255,255,0.08))] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[88vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              <h3 className="m-0 text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] font-['Oswald',sans-serif] uppercase tracking-wide">
                Inventory Portion Recipe
              </h3>
            </div>
            <p className="text-xs text-amber-400 font-bold mt-1 m-0">
              Product: {menuItem.name}
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--admin-muted,#888)] hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={onClose}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Variant Tabs */}
        {menuItem.variants && menuItem.variants.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {menuItem.variants.map((variant, index) => {
              const isSelected = selectedVariant === variant.size;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedVariant(variant.size)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all border-none ${
                    isSelected
                      ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                      : "bg-white/5 text-[var(--admin-muted,#888)] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
        )}

        {/* Ingredients Rows */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {isFetching ? (
            <div className="py-12 flex flex-col justify-center items-center text-amber-400 gap-2 font-bold text-xs">
              <FaSpinner className="animate-spin text-xl" />
              <span>Loading ingredient recipe...</span>
            </div>
          ) : (
            <>
              {ingredients.map((ing, index) => {
                const selectedItemData = inventoryItems?.find(
                  (item) => item.id == ing.inventory_id
                );
                const unitLabel = selectedItemData ? selectedItemData.unit : "Unit";

                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-[var(--admin-border,rgba(255,255,255,0.06))] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center hover:border-amber-500/20 transition-all"
                  >
                    {/* Ingredient Select */}
                    <div className="flex-1 min-w-[160px]">
                      <label className="text-[10px] text-[var(--admin-muted,#888)] font-extrabold uppercase tracking-wider block mb-1">
                        Raw Inventory Item *
                      </label>
                      <select
                        className="w-full p-2.5 text-xs bg-black/40 border border-white/10 text-white rounded-xl focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                        value={ing.inventory_id}
                        onChange={(e) =>
                          handleIngredientChange(index, "inventory_id", e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select Raw Ingredient
                        </option>
                        {inventoryItems &&
                          inventoryItems.map((invItem) => (
                            <option key={invItem.id} value={invItem.id}>
                              {invItem.name} ({invItem.stock} {invItem.unit})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Quantity Input */}
                    <div className="w-full sm:w-32">
                      <label className="text-[10px] text-[var(--admin-muted,#888)] font-extrabold uppercase tracking-wider block mb-1">
                        Quantity ({unitLabel})
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={ing.qty}
                        onChange={(e) =>
                          handleIngredientChange(index, "qty", e.target.value)
                        }
                        className="w-full p-2.5 text-xs bg-black/40 border border-white/10 text-white rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                      />
                    </div>

                    {/* Removable Toggle */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleIngredientChange(
                            index,
                            "is_removable",
                            !ing.is_removable
                          )
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border-none ${
                          ing.is_removable
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-white/5 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {ing.is_removable ? (
                          <FaCheckSquare className="text-amber-400 text-xs" />
                        ) : (
                          <FaRegSquare className="text-xs" />
                        )}
                        <span className="text-[11px]">Optional</span>
                      </button>

                      {/* Remove Row Button */}
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
                        title="Remove Ingredient"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addIngredientRow}
                className="w-full py-2.5 bg-transparent text-amber-400 hover:text-amber-300 border border-dashed border-amber-500/30 hover:border-amber-500 rounded-2xl cursor-pointer font-bold text-xs flex justify-center items-center gap-2 transition-all mt-2"
              >
                <FaPlus className="text-[10px]" />
                <span>Add Ingredient to Recipe</span>
              </button>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--admin-border,rgba(255,255,255,0.06))]">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[var(--admin-muted,#888)] hover:text-white border border-[var(--admin-border,rgba(255,255,255,0.08))] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer transition-all flex items-center gap-2"
            onClick={handleSaveRecipe}
            disabled={isSaving}
          >
            {isSaving && <FaSpinner className="animate-spin text-xs" />}
            <span>Save Recipe</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
