import React from "react";

export default function AddressInputFields({
  houseNo = "",
  setHouseNo,
  street = "",
  setStreet,
  area = "",
  setArea,
  errors = {},
  setErrors,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            House / Flat / Building No. *
          </label>
          <input
            type="text"
            value={houseNo}
            onChange={(e) => {
              setHouseNo(e.target.value);
              if (errors.houseNo && setErrors)
                setErrors({ ...errors, houseNo: "" });
            }}
            placeholder="e.g. House 42, Floor 2"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
              errors.houseNo
                ? "border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
          {errors.houseNo && (
            <span className="text-xs text-red-500">{errors.houseNo}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Street / Block *
          </label>
          <input
            type="text"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              if (errors.street && setErrors)
                setErrors({ ...errors, street: "" });
            }}
            placeholder="e.g. Street 9, Block B"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
              errors.street
                ? "border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
          {errors.street && (
            <span className="text-xs text-red-500">{errors.street}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
          Area / Landmark *
        </label>
        <input
          type="text"
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            if (errors.area && setErrors) setErrors({ ...errors, area: "" });
          }}
          placeholder="e.g. Gulberg III near City Mall"
          className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
            errors.area
              ? "border-red-500"
              : "border-gray-200 dark:border-neutral-700"
          }`}
        />
        {errors.area && (
          <span className="text-xs text-red-500">{errors.area}</span>
        )}
      </div>
    </div>
  );
}
