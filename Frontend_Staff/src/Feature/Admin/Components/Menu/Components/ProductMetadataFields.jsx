import React from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function ProductMetadataFields({
  menuForm,
  setMenuForm,
  promoFileInputRef,
}) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5 bg-white/[0.02] border border-[var(--admin-border,rgba(255,255,255,0.06))] rounded-2xl">
      <h4 className="m-0 text-[11px] uppercase tracking-widest text-[var(--admin-muted,#888)] font-extrabold">
        Badges & Visibility
      </h4>

      <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-300 cursor-pointer p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
        <input
          type="checkbox"
          checked={menuForm.isAvailable !== false}
          onChange={(e) =>
            setMenuForm({ ...menuForm, isAvailable: e.target.checked })
          }
          className="w-4 h-4 cursor-pointer accent-amber-500"
        />
        <span>Available in Store</span>
      </label>

      <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-300 cursor-pointer p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
        <input
          type="checkbox"
          checked={menuForm.isTopDeal || false}
          onChange={(e) =>
            setMenuForm({ ...menuForm, isTopDeal: e.target.checked })
          }
          className="w-4 h-4 cursor-pointer accent-amber-500"
        />
        <span>Mark as Top Deal</span>
      </label>

      <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-300 cursor-pointer p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
        <input
          type="checkbox"
          checked={menuForm.isBestSeller || false}
          onChange={(e) =>
            setMenuForm({ ...menuForm, isBestSeller: e.target.checked })
          }
          className="w-4 h-4 cursor-pointer accent-amber-500"
        />
        <span>Mark as Best Seller</span>
      </label>

      {/* Spice Selection Control */}
      <div className="my-0.5 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]" />
      <h4 className="m-0 text-[11px] uppercase tracking-widest text-amber-500 font-extrabold flex items-center gap-1.5">
        Customizer Controls
      </h4>

      <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-300 cursor-pointer p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
        <input
          type="checkbox"
          checked={menuForm.has_spice_option !== false && menuForm.has_spice_option !== 0}
          onChange={(e) =>
            setMenuForm({ ...menuForm, has_spice_option: e.target.checked })
          }
          className="w-4 h-4 cursor-pointer accent-amber-500"
        />
        <span>Enable Spice Level Selection (Mild / Medium / Hot)</span>
      </label>

      {/* Promo Banner Feature */}
      <div className="my-0.5 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]" />
      <label
        className={`flex items-center gap-2.5 text-xs font-bold cursor-pointer p-2 rounded-xl transition-colors ${
          menuForm.is_featured_banner
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            : "bg-white/[0.02] text-neutral-400"
        }`}
      >
        <input
          type="checkbox"
          checked={menuForm.is_featured_banner || false}
          onChange={(e) =>
            setMenuForm({
              ...menuForm,
              is_featured_banner: e.target.checked,
            })
          }
          className="w-4 h-4 cursor-pointer accent-amber-500"
        />
        <span>Homepage Hero Banner</span>
      </label>

      {menuForm.is_featured_banner && (
        <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-xl border border-white/5 mt-1">
          <label className="text-[10px] text-amber-400 font-bold uppercase block">
            Wide Promo Banner (1200x500px)
          </label>
          <div
            onClick={() => promoFileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl h-20 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-white/[0.02] hover:border-amber-400 group"
          >
            <input
              type="file"
              accept="image/*"
              ref={promoFileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file)
                  setMenuForm({
                    ...menuForm,
                    promo_banner_image: file,
                  });
              }}
            />
            {menuForm.promo_banner_image ? (
              <>
                <img
                  src={
                    typeof menuForm.promo_banner_image === "string"
                      ? menuForm.promo_banner_image
                      : URL.createObjectURL(menuForm.promo_banner_image)
                  }
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold">
                    Change Banner
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-neutral-400 text-center p-1">
                <FaCloudUploadAlt className="text-sm text-amber-400 mb-0.5" />
                <span className="text-[10px] font-bold">
                  Upload Wide Banner
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 font-bold block mb-1">
              Banner Sort Order (0 = First)
            </label>
            <input
              type="number"
              min="0"
              value={menuForm.banner_order ?? 0}
              onChange={(e) =>
                setMenuForm({
                  ...menuForm,
                  banner_order: e.target.value,
                })
              }
              className="w-full p-2 text-xs bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
