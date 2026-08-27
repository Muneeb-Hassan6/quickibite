import React from "react";

export default function RecipeVariantTabs({
  variants = [],
  selectedVariant,
  setSelectedVariant,
}) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
      {variants.map((variant, index) => {
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
  );
}
