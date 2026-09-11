import React from "react";
import { FaUtensils, FaGlassMartiniAlt } from "react-icons/fa";
import {
  DEFAULT_DRINK_FLAVORS,
  DEFAULT_PIZZA_FLAVORS,
  DEFAULT_FRIES_FLAVORS,
} from "../comboHelpers";
import ComboTierHeader from "./ComboTierHeader";
import ComboIncludedList from "./ComboIncludedList";
import ComboChoiceItemList from "./ComboChoiceItemList";

export default function DealComboMatrix({
  isDeal = false,
  comboItems = [],
  openSections = {},
  toggleSection,
  hasPizzaInCombo = false,
  selectedPizza = "Chicken Tikka",
  setSelectedPizza,
  hasFriesInCombo = false,
  selectedFries = "Masala Fries",
  setSelectedFries,
  hasDrinkInCombo = false,
  selectedDrink = "Coca-Cola",
  setSelectedDrink,
}) {
  if (!isDeal || comboItems.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* 1. ACCORDION: COMBO INCLUDES */}
      <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
        <ComboTierHeader
          icon={<FaUtensils className="text-amber-500 text-sm" />}
          title={`Combo Includes (${comboItems.length} Items)`}
          subtitle="Bundled dishes & sides in this package"
          badgeText="Included"
          badgeColorClass="text-amber-600 dark:text-amber-400 bg-amber-400/10"
          isOpen={openSections.comboIncludes}
          onToggle={() => toggleSection("comboIncludes")}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            openSections.comboIncludes
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <ComboIncludedList comboItems={comboItems} />
        </div>
      </div>

      {/* 2. ACCORDION: PIZZA FLAVOR SELECTOR */}
      {hasPizzaInCombo && (
        <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
          <ComboTierHeader
            icon="🍕"
            title="Choose Pizza Flavor"
            subtitle={
              <>
                Selected:{" "}
                <span className="font-bold text-amber-500">{selectedPizza}</span>
              </>
            }
            isOpen={openSections.pizzaFlavor}
            onToggle={() => toggleSection("pizzaFlavor")}
          />

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              openSections.pizzaFlavor
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
          >
            <ComboChoiceItemList
              flavors={DEFAULT_PIZZA_FLAVORS}
              selectedFlavor={selectedPizza}
              onSelectFlavor={setSelectedPizza}
              columnsClass="grid-cols-2"
            />
          </div>
        </div>
      )}

      {/* 3. ACCORDION: FRIES FLAVOR SELECTOR */}
      {hasFriesInCombo && (
        <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
          <ComboTierHeader
            icon="🍟"
            title="Choose Fries Flavor"
            subtitle={
              <>
                Selected:{" "}
                <span className="font-bold text-amber-500">{selectedFries}</span>
              </>
            }
            isOpen={openSections.friesFlavor}
            onToggle={() => toggleSection("friesFlavor")}
          />

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              openSections.friesFlavor
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
          >
            <ComboChoiceItemList
              flavors={DEFAULT_FRIES_FLAVORS}
              selectedFlavor={selectedFries}
              onSelectFlavor={setSelectedFries}
              columnsClass="grid-cols-3"
            />
          </div>
        </div>
      )}

      {/* 4. ACCORDION: DRINK FLAVOR SELECTOR */}
      {hasDrinkInCombo && (
        <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
          <ComboTierHeader
            icon={<FaGlassMartiniAlt className="text-red-500 text-sm" />}
            title="Choose Drink Flavor"
            subtitle={
              <>
                Selected:{" "}
                <span className="font-bold text-amber-500">{selectedDrink}</span>
              </>
            }
            isOpen={openSections.drinkFlavor}
            onToggle={() => toggleSection("drinkFlavor")}
          />

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              openSections.drinkFlavor
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
          >
            <ComboChoiceItemList
              flavors={DEFAULT_DRINK_FLAVORS}
              selectedFlavor={selectedDrink}
              onSelectFlavor={setSelectedDrink}
              columnsClass="grid-cols-2 sm:grid-cols-3"
            />
          </div>
        </div>
      )}
    </div>
  );
}
