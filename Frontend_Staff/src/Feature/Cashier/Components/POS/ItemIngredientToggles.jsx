import React from "react";
import { FaCheckSquare, FaRegSquare } from "react-icons/fa";

export default function ItemIngredientToggles({
  optionalIngredients = [],
  excludedIds = [],
  toggleIngredient,
}) {
  if (!optionalIngredients || optionalIngredients.length === 0) return null;

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 font-mono">
        Ingredients (Click to remove)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {optionalIngredients.map((ing) => {
          const isExcluded = excludedIds.includes(ing.inventory_id);
          return (
            <button
              key={ing.inventory_id}
              type="button"
              onClick={() => toggleIngredient(ing.inventory_id)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer ${
                isExcluded
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/30 font-semibold"
                  : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {isExcluded ? (
                <FaRegSquare className="text-rose-500 shrink-0" />
              ) : (
                <FaCheckSquare className="text-amber-500 shrink-0" />
              )}
              <span className="truncate">{ing.item_name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
