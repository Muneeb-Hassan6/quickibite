import React from "react";
import { FaCheck } from "react-icons/fa";

export default function ComboChoiceItemList({
  flavors = [],
  selectedFlavor = "",
  onSelectFlavor,
  columnsClass = "grid-cols-2",
}) {
  return (
    <div className="overflow-hidden">
      <div
        className={`p-4 pt-0 grid ${columnsClass} gap-2 border-t border-gray-200/60 dark:border-neutral-800/80`}
      >
        {flavors.map((flavor) => {
          const isSelected = selectedFlavor === flavor;
          return (
            <button
              key={flavor}
              type="button"
              onClick={() => onSelectFlavor(flavor)}
              className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-center gap-1.5 ${
                isSelected
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
  );
}
