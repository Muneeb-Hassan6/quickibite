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
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-box animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "650px" }}
      >
        <div className="modal-header rm-header">
          <div>
            <h3 className="modal-title">
              <span
                style={{
                  display: "inline-block",
                  width: "4px",
                  height: "20px",
                  background: "#f59e0b",
                  marginRight: "10px",
                }}
              ></span>
              SET RECIPE
            </h3>
            <p className="rm-item-title">{menuItem.name}</p>
          </div>
          <button onClick={onClose} className="btn-close-modal">
            <FaTimes />
          </button>
        </div>

        {menuItem.variants && menuItem.variants.length > 0 && (
          <div className="rm-variants-row">
            {menuItem.variants.map((variant, index) => (
              <button
                key={index}
                onClick={() => setSelectedVariant(variant.size)}
                className={`rm-variant-btn ${selectedVariant === variant.size ? "active" : "inactive"}`}
              >
                {variant.size}
              </button>
            ))}
          </div>
        )}

        <div className="rm-table-header">
          <div style={{ flex: 2 }}>Ingredient Name</div>
          <div style={{ flex: 1 }}>Quantity</div>
          <div style={{ flex: 0.8, textAlign: "center" }}>Optional?</div>
          <div style={{ width: "48px" }}></div>{" "}
          {/* Spacer for trash icon alignment */}
        </div>

        <div className="rm-table-body">
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
                <div key={index} className="rm-ingredient-row">
                  {/* Custom select class applied here */}
                  <select
                    className="rm-select-input"
                    value={ing.inventory_id}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "inventory_id",
                        e.target.value,
                      )
                    }
                  >
                    <option value="" disabled>
                      Select Ingredient
                    </option>
                    {inventoryItems &&
                      inventoryItems.map((invItem) => (
                        <option key={invItem.id} value={invItem.id}>
                          {invItem.name} ({invItem.stock} {invItem.unit})
                        </option>
                      ))}
                  </select>

                  <div className="rm-qty-box">
                    <input
                      type="number"
                      className="rm-qty-input"
                      placeholder="0.00"
                      value={ing.qty}
                      onChange={(e) =>
                        handleIngredientChange(index, "qty", e.target.value)
                      }
                      min="0"
                      step="0.01"
                    />
                    <span className="rm-unit-label">{unitLabel}</span>
                  </div>

                  <div
                    className={`rm-checkbox-box ${ing.is_removable ? "checked" : "unchecked"}`}
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
                    className="rm-btn-trash"
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
          <button onClick={addIngredientRow} className="rm-btn-add">
            <FaPlus /> Add Ingredient
          </button>
        )}

        <div
          className="modal-footer modal-actions"
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "15px",
          }}
        >
          <button className="btn-cancel" onClick={onClose} disabled={isSaving}>
            Close
          </button>
          <button
            className="btn-save"
            onClick={handleSaveRecipe}
            disabled={isSaving}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              minWidth: "160px",
            }}
          >
            {isSaving ? (
              <>
                <FaSpinner className="spin-animation" /> Saving...
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
