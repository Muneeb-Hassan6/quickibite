import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaCheckSquare,
  FaRegSquare,
  FaSpinner,
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
      (ing) => ing.inventory_id !== "" && ing.qty > 0,
    );

    if (validIngredients.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "Empty Recipe",
        text: "Please add at least one valid ingredient.",
        background: "#141414",
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
          text: `Recipe for ${menuItem.name} (${selectedVariant}) updated.`,
          timer: 1500,
          showConfirmButton: false,
          background: "#141414",
          color: "#fff",
        });
        // 🔥 FIX: Modal ab save hone ke baad band ho jayega
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save recipe.",
        background: "#141414",
        color: "#fff",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[9999]" onClick={onClose}>
      <div
        className="w-[90%] max-w-[40.625rem] bg-[var(--admin-bg,#141414)] border border-[var(--admin-border,#222)] rounded-[1rem] p-[1.563rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-[1.563rem] w-full">
          <div>
            <h3 className="uppercase flex items-center gap-[0.625rem] text-white m-0 text-[1.25rem] font-black">
              <span
                className="inline-block w-[0.25rem] h-[1.25rem] bg-[#f59e0b]"
              ></span>
              SET RECIPE
            </h3>
            <p className="text-[#ef4444] text-[0.875rem] font-bold mt-[0.313rem] mb-0 capitalize">{menuItem.name}</p>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-[#949191] text-[1.25rem] cursor-pointer transition-colors duration-300 hover:text-white static !m-0 self-start mt-[0.313rem]">
            <FaTimes />
          </button>
        </div>

        {menuItem.variants && menuItem.variants.length > 0 && (
          <div className="flex gap-[0.625rem] mb-[1.25rem] overflow-x-auto pb-[0.313rem]">
            {menuItem.variants.map((variant, index) => (
              <button
                key={index}
                onClick={() => setSelectedVariant(variant.size)}
                className={`px-[1.25rem] py-[0.5rem] rounded-[1.25rem] border border-[#333] cursor-pointer font-bold text-[0.813rem] text-white transition-all duration-200 ${selectedVariant === variant.size ? "bg-[#ef4444] border-[#ef4444]" : "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"}`}
              >
                {variant.size}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-[0.75rem] mb-[0.625rem] pr-[0.313rem] text-[0.75rem] text-[#888] font-bold uppercase">
          <div style={{ flex: 2 }}>Ingredient Name</div>
          <div style={{ flex: 1 }}>Quantity</div>
          <div style={{ flex: 0.8, textAlign: "center" }}>Optional?</div>
          <div style={{ width: "3rem" }}></div>{" "}
          {/* Spacer for trash icon alignment */}
        </div>

        <div className="max-h-[18.75rem] overflow-y-auto pr-[0.313rem]">
          {isFetching ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#888" }}
            >
              Loading recipe...
            </div>
          ) : (
            ingredients.map((ing, index) => {
              const selectedItemData = inventoryItems?.find(
                (item) => item.id == ing.inventory_id,
              );
              const unitLabel = selectedItemData
                ? selectedItemData.unit
                : "Qty";

              return (
                <div key={index} className="flex gap-[0.75rem] mb-[0.938rem] items-center">
                  {/* Custom select class applied here */}
                  <select
                    className="flex-[2] bg-[#111] border border-[#333] text-white px-[0.938rem] rounded-[0.5rem] text-[0.875rem] outline-none h-[3rem] cursor-pointer"
                    value={ing.inventory_id}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "inventory_id",
                        e.target.value,
                      )
                    }
                  >
                    <option className="bg-[#111] text-white" value="" disabled>
                      Select Ingredient
                    </option>
                    {inventoryItems &&
                      inventoryItems.map((invItem) => (
                        <option className="bg-[#111] text-white" key={invItem.id} value={invItem.id}>
                          {invItem.name} ({invItem.stock} {invItem.unit})
                        </option>
                      ))}
                  </select>

                  <div className="flex-1 flex items-center bg-[#111] rounded-[0.5rem] border border-[#333] pr-[0.938rem] h-[3rem]">
                    <input
                      type="number"
                      className="border-none bg-transparent w-full text-white px-[0.938rem] outline-none text-[0.875rem] h-full"
                      placeholder="0.00"
                      value={ing.qty}
                      onChange={(e) =>
                        handleIngredientChange(index, "qty", e.target.value)
                      }
                      min="0"
                      step="0.01"
                    />
                    <span className="text-[#ef4444] text-[0.813rem] font-bold">{unitLabel}</span>
                  </div>

                  <div
                    className={`flex-[0.8] flex justify-center items-center cursor-pointer transition-transform duration-200 hover:scale-110 ${ing.is_removable ? "text-[#ef4444]" : "text-[#888]"}`}
                    onClick={() =>
                      handleIngredientChange(
                        index,
                        "is_removable",
                        !ing.is_removable,
                      )
                    }
                  >
                    {ing.is_removable ? (
                      <FaCheckSquare size={24} />
                    ) : (
                      <FaRegSquare size={24} />
                    )}
                  </div>

                  <button
                    onClick={() => removeIngredient(index)}
                    className="bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[#ef4444] w-[3rem] h-[3rem] rounded-[0.5rem] cursor-pointer flex justify-center items-center transition-all duration-200 text-[1rem] hover:bg-[#ef4444] hover:text-white hover:-translate-y-[2px]"
                    title="Remove Item"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {!isFetching && (
          <button onClick={addIngredientRow} className="w-full p-[0.75rem] bg-[rgba(255,255,255,0.02)] text-[#888] border border-dashed border-[#888] rounded-[0.5rem] cursor-pointer font-bold flex justify-center items-center gap-[0.5rem] mt-[0.625rem] transition-all duration-300 hover:bg-[rgba(239,68,68,0.1)] hover:border-[#ef4444] hover:text-[#ef4444] hover:-translate-y-[2px]">
            <FaPlus /> Add Ingredient
          </button>
        )}

        <div
          className="flex justify-end gap-[0.938rem] mt-[1.563rem]"
        >
          <button className="bg-transparent text-white border border-[#333] p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)]" onClick={onClose} disabled={isSaving}>
            Close
          </button>
          <button
            className="bg-[var(--brand-red,#ef4444)] text-white border-none p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)] flex justify-center items-center gap-[0.5rem] min-w-[10rem]"
            onClick={handleSaveRecipe}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin" /> Saving...
              </>
            ) : (
              `Save for ${selectedVariant}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
