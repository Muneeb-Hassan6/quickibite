import React from "react";
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaUtensils } from "react-icons/fa";
import Swal from "sweetalert2";

export default function ProductAddonsDirectory({
  productAddonsList = [],
  onEditProductAddons,
  onRefresh,
}) {
  const handleDeleteAddon = async (productId, productName) => {
    if (
      await Swal.fire({
        title: "Remove All Add-ons?",
        text: `Clear all custom add-ons for "${productName}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Clear",
        confirmButtonColor: "#ef4444",
      }).then((res) => res.isConfirmed)
    ) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/admin_manage_addons.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_product_addons",
              menu_item_id: productId,
              addons: [],
            }),
          }
        );
        const data = await res.json();
        if (data.success) {
          Swal.fire("Cleared", "Product add-ons removed.", "success");
          if (onRefresh) onRefresh();
        }
      } catch (e) {
        Swal.fire("Error", "Failed to clear add-ons.", "error");
      }
    }
  };

  return (
    <div className="mt-10 space-y-4 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full shrink-0" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Product-Specific Custom Add-ons Directory
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-neutral-400 mt-0.5 m-0">
            Direct upgrades configured per menu item (e.g., extra cheese, sauces, special toppings).
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEditProductAddons && onEditProductAddons(null)}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
        >
          <FaPlus className="text-[10px]" />
          <span>Add Product Add-on</span>
        </button>
      </div>

      {productAddonsList.length === 0 ? (
        <div className="p-8 text-center bg-zinc-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-zinc-300 dark:border-neutral-800 text-zinc-500 dark:text-neutral-400 text-xs">
          No product-specific custom add-ons configured yet. Click above to add some!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
          {productAddonsList.map((item) => (
            <div
              key={item.menu_item_id}
              className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-amber-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <FaUtensils className="text-xs" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide truncate m-0">
                        {item.product_name}
                      </h4>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                        {item.product_category || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditProductAddons(item)}
                      className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-500/20 cursor-pointer transition-all text-xs"
                      title="Edit Product Add-ons"
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAddon(item.menu_item_id, item.product_name)
                      }
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 cursor-pointer transition-all text-xs"
                      title="Delete Product Add-ons"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Sub-addons pill list */}
                <div className="mt-3 space-y-1.5">
                  {item.addons?.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex flex-col gap-0.5 text-xs py-1.5 px-2.5 rounded-lg bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200 dark:border-neutral-700/60 text-zinc-700 dark:text-gray-300 font-medium"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-white truncate">{addon.title}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold font-['Oswald',sans-serif] ml-2 shrink-0">
                          +Rs {parseFloat(addon.price || 0).toLocaleString()}
                        </span>
                      </div>
                      {addon.inventory_name && (
                        <div className="text-[10px] text-zinc-500 dark:text-gray-400 flex items-center justify-between">
                          <span className="truncate">📦 Raw: {addon.inventory_name} (-{addon.qty_to_deduct} {addon.inventory_unit})</span>
                          {addon.inventory_stock !== null && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold shrink-0 ml-1">
                              Stock: {addon.inventory_stock} {addon.inventory_unit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 text-[10px] text-zinc-500 dark:text-gray-400 flex items-center justify-between border-t border-zinc-100 dark:border-neutral-800">
                <span>{item.addons?.length || 0} active add-ons</span>
                <span className="text-emerald-500 font-bold">● Active in Store</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
