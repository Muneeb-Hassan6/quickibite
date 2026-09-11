import React from "react";
import { LuQrCode } from "react-icons/lu";

export default function DeliveryBranchSelector({
  tableNumber = "",
  setTableNumber,
  availableTables = [],
  errors = {},
  setErrors,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
      <h3 className="font-['Oswald',sans-serif] font-bold text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
        3. Select Dine-In Table
      </h3>

      <div className="flex flex-col gap-1.5 max-w-sm">
        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <LuQrCode className="w-4 h-4 text-amber-500" />
          <span>Table Number / QR Code *</span>
        </label>

        {availableTables.length > 0 ? (
          <select
            value={tableNumber}
            onChange={(e) => {
              setTableNumber(e.target.value);
              if (errors.tableNumber && setErrors)
                setErrors({ ...errors, tableNumber: "" });
            }}
            className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {availableTables.map((t) => (
              <option key={t.id} value={t.table_name || t.id}>
                {t.table_name || `Table #${t.id}`}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => {
              setTableNumber(e.target.value);
              if (errors.tableNumber && setErrors)
                setErrors({ ...errors, tableNumber: "" });
            }}
            placeholder="e.g. Table 4 or T-02"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 ${
              errors.tableNumber
                ? "border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
        )}
        {errors.tableNumber && (
          <span className="text-xs text-red-500">{errors.tableNumber}</span>
        )}
      </div>
    </div>
  );
}
