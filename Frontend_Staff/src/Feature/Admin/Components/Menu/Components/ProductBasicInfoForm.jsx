import React from "react";
import ProductImageDropzone from "./ProductImageDropzone";
import ProductMetadataFields from "./ProductMetadataFields";

export default function ProductBasicInfoForm({
  menuForm,
  setMenuForm,
  categories = [],
  fileInputRef,
  promoFileInputRef,
  handleImageChange,
}) {
  return (
    <>
      {/* LEFT COLUMN: Image Upload & Visibility Settings */}
      <div className="w-full md:w-5/12 flex flex-col gap-4">
        <ProductImageDropzone
          menuForm={menuForm}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
        />

        <ProductMetadataFields
          menuForm={menuForm}
          setMenuForm={setMenuForm}
          promoFileInputRef={promoFileInputRef}
        />
      </div>

      {/* RIGHT COLUMN: General Info */}
      <div className="w-full md:w-7/12 flex flex-col gap-4">
        <div>
          <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider mb-1.5 block">
            Item Title *
          </label>
          <input
            type="text"
            className="w-full p-3 bg-white/5 border border-[var(--admin-border,rgba(255,255,255,0.08))] text-[var(--admin-text,#fff)] rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold"
            value={menuForm.name}
            onChange={(e) =>
              setMenuForm({ ...menuForm, name: e.target.value })
            }
            placeholder="e.g. Gourmet Beef Burger, Margherita Pizza..."
          />
        </div>

        <div>
          <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider mb-1.5 block">
            Category *
          </label>
          <select
            className="w-full p-3 bg-white/5 border border-[var(--admin-border,rgba(255,255,255,0.08))] text-[var(--admin-text,#fff)] rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold cursor-pointer"
            value={menuForm.category}
            onChange={(e) =>
              setMenuForm({ ...menuForm, category: e.target.value })
            }
          >
            <option className="bg-[var(--admin-panel,#171717)]" value="" disabled>
              Select Category
            </option>
            {categories.map((cat) => (
              <option
                className="bg-[var(--admin-panel,#171717)]"
                key={cat.id}
                value={cat.name}
              >
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider mb-1.5 block">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            className="w-full p-3 bg-white/5 border border-[var(--admin-border,rgba(255,255,255,0.08))] text-[var(--admin-text,#fff)] rounded-xl focus:outline-none focus:border-amber-500 text-sm resize-none"
            value={menuForm.description || ""}
            onChange={(e) =>
              setMenuForm({ ...menuForm, description: e.target.value })
            }
            placeholder="Key ingredients, culinary notes, portion size..."
          />
        </div>
      </div>
    </>
  );
}
