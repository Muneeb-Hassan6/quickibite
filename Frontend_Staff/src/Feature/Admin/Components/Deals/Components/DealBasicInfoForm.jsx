import React from "react";
import { FaTag } from "react-icons/fa";
import DealImageUploader from "./DealImageUploader";
import DealPricingControls from "./DealPricingControls";

export default function DealBasicInfoForm({
  dealForm = {},
  setDealForm,
  discountPercent = 0,
  dealPrice = 0,
  origPrice = 0,
  fileInputRef,
  handleLogoChange,
  logoPreview = "",
  isPermanent = true,
  setIsPermanent,
  startTime = "12:00",
  setStartTime,
  endTime = "16:00",
  setEndTime,
  isFeaturedBanner = false,
  setIsFeaturedBanner,
  promoFileInputRef,
  handlePromoBannerChange,
  promoBannerPreview = "",
  bannerOrder = 0,
  setBannerOrder,
}) {
  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <FaTag className="text-amber-500 text-sm" />
        <h3 className="m-0 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
          1. General Information & Pricing
        </h3>
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
          Deal Title *
        </label>
        <input
          type="text"
          value={dealForm.title}
          onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
          placeholder="e.g. Midnight Feast Combo, Family Mega Saver"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
          Description (Optional)
        </label>
        <textarea
          rows={2}
          value={dealForm.description}
          onChange={(e) =>
            setDealForm({ ...dealForm, description: e.target.value })
          }
          placeholder="Details, included servings, drinks, dipping sauces..."
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs resize-none focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Pricing & Ribbon Badge */}
      <DealPricingControls
        dealForm={dealForm}
        setDealForm={setDealForm}
        discountPercent={discountPercent}
        dealPrice={dealPrice}
        origPrice={origPrice}
      />

      {/* Image & Wide Promo Banner Uploads */}
      <DealImageUploader
        fileInputRef={fileInputRef}
        handleLogoChange={handleLogoChange}
        logoPreview={logoPreview}
        isFeaturedBanner={isFeaturedBanner}
        setIsFeaturedBanner={setIsFeaturedBanner}
        promoFileInputRef={promoFileInputRef}
        handlePromoBannerChange={handlePromoBannerChange}
        promoBannerPreview={promoBannerPreview}
        bannerOrder={bannerOrder}
        setBannerOrder={setBannerOrder}
      />

      {/* Timing Schedule */}
      <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] space-y-2.5">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={isPermanent}
            onChange={(e) => setIsPermanent(e.target.checked)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
          <span>Permanent Deal (Active 24/7)</span>
        </label>

        {!isPermanent && (
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200 dark:border-white/5">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
