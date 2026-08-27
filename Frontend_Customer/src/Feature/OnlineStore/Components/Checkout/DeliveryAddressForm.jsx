import React from "react";
import {
  LuBike,
  LuShoppingBag,
  LuUtensilsCrossed,
} from "react-icons/lu";
import AddressInputFields from "./AddressInputFields";
import DeliveryBranchSelector from "./DeliveryBranchSelector";

export default function DeliveryAddressForm({
  orderType = "delivery",
  setOrderType,
  baseDeliveryFee = 150,
  houseNo = "",
  setHouseNo,
  street = "",
  setStreet,
  area = "",
  setArea,
  tableNumber = "",
  setTableNumber,
  availableTables = [],
  errors = {},
  setErrors,
}) {
  return (
    <>
      {/* 1. Order Type Selection */}
      <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          1. Order Fulfillment Method
        </h3>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {[
            {
              id: "delivery",
              label: "Delivery",
              icon: <LuBike className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
              sub: `+Rs ${baseDeliveryFee}`,
            },
            {
              id: "takeaway",
              label: "Takeaway",
              icon: <LuShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
              sub: "Free Pickup",
            },
            {
              id: "dine_in",
              label: "Dine-In",
              icon: <LuUtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
              sub: "Table Service",
            },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setOrderType(opt.id)}
              className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 sm:gap-2 ${
                orderType === opt.id
                  ? "bg-amber-400/10 dark:bg-amber-400/15 border-amber-500 text-neutral-950 dark:text-white font-bold ring-2 ring-amber-400/30 shadow-xs"
                  : "bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-amber-400"
              }`}
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-xs">
                {opt.icon}
              </div>
              <span className="font-['Oswald',sans-serif] text-xs sm:text-sm uppercase tracking-wide truncate w-full">
                {opt.label}
              </span>
              <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 truncate w-full">
                {opt.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Address Details (Delivery) */}
      {orderType === "delivery" && (
        <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-['Oswald',sans-serif] font-bold text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
            3. Delivery Address
          </h3>

          <AddressInputFields
            houseNo={houseNo}
            setHouseNo={setHouseNo}
            street={street}
            setStreet={setStreet}
            area={area}
            setArea={setArea}
            errors={errors}
            setErrors={setErrors}
          />
        </div>
      )}

      {/* 3. Dine-In Table Selection */}
      {orderType === "dine_in" && (
        <DeliveryBranchSelector
          tableNumber={tableNumber}
          setTableNumber={setTableNumber}
          availableTables={availableTables}
          errors={errors}
          setErrors={setErrors}
        />
      )}
    </>
  );
}
