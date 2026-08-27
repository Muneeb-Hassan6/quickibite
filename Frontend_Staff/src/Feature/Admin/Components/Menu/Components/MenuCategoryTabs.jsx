import React from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function MenuCategoryTabs({
  categories = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-4 animate-slide-up">
      <div
        className="border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/[0.03] transition-all flex flex-col items-center justify-center min-h-[140px] cursor-pointer text-slate-500 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 group p-4"
        onClick={onAddCategory}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors mb-2">
          <FaPlus className="text-sm" />
        </div>
        <p className="m-0 text-xs font-bold uppercase tracking-wider text-center">
          Add Category
        </p>
      </div>

      {categories.map((cat) => (
        <div
          key={cat.id}
          className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-[#161616] group transition-all min-h-[140px] flex items-center justify-center shadow-sm hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-lg"
        >
          <img
            src={cat.img}
            alt={cat.name}
            className="absolute inset-0 w-full h-full object-cover z-[1] opacity-70 dark:opacity-50 transition-all duration-500 group-hover:scale-110 group-hover:opacity-30"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150?text=No+Image";
            }}
          />
          <div
            className="relative z-[2] font-black text-sm text-white uppercase tracking-wider text-center px-3 transition-opacity duration-300 group-hover:opacity-0 group-hover:invisible"
            style={{
              textShadow:
                "0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)",
            }}
          >
            {cat.name}
          </div>
          <div className="absolute inset-0 bg-black/75 flex justify-center items-center gap-3 opacity-0 transition-opacity duration-300 z-10 group-hover:opacity-100 p-2">
            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-blue-500/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Edit Category"
              onClick={(e) => {
                e.stopPropagation();
                onEditCategory(cat);
              }}
            >
              <FaEdit className="text-xs" />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Delete Category"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCategory(cat.id);
              }}
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
