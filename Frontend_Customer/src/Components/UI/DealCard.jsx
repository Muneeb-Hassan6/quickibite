import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FaFire, FaShoppingBag } from "react-icons/fa";
import PopupCard from "./PopupCard";
import { resolveImageUrl } from "../../utils/imageOptimizer";

const DealCard = ({ deal }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!deal) return null;

  const title = deal.title || deal.name || "Special Combo Deal";
  const dealPrice = parseFloat(deal.price || 0);
  const originalPrice = deal.original_price
    ? parseFloat(deal.original_price)
    : null;

  const savings =
    originalPrice && originalPrice > dealPrice ? originalPrice - dealPrice : 0;
  const savingsPct =
    originalPrice && originalPrice > dealPrice
      ? Math.round((savings / originalPrice) * 100)
      : 0;

  const rawImage =
    deal.img || deal.image || deal.image_url || deal.photo || "";
  const finalImage = resolveImageUrl(rawImage, 600);

  const openPopup = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(true);
  };

  const closePopup = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      <div
        onClick={openPopup}
        className="group relative bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 shadow-md cursor-pointer select-none"
      >
        {/* 📸 IMAGE CONTAINER */}
        <div className="w-full h-28 min-[400px]:h-32 sm:h-40 md:h-44 flex items-center justify-center overflow-hidden my-1 relative rounded-lg sm:rounded-xl bg-gray-50 dark:bg-neutral-800/60 transition-colors duration-300 group-hover:bg-amber-400/10 dark:group-hover:bg-amber-400/5">
          {/* Animated Bottom-to-Top Amber Background Layer */}
          <div className="absolute inset-0 bg-amber-400 dark:bg-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0 pointer-events-none rounded-lg sm:rounded-xl" />

          {/* Badges Overlay */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-wrap gap-1 items-center pointer-events-none">
            <span className="inline-flex items-center gap-1 backdrop-blur-md bg-red-600/95 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs border border-white/20 tracking-wide uppercase">
              <FaFire className="text-[8px] text-amber-300" />
              {deal.badge_tag || deal.tag || "DEAL"}
            </span>
            {savings > 0 && (
              <span className="inline-flex items-center backdrop-blur-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md">
                -{savingsPct}%
              </span>
            )}
          </div>

          {/* Food Cutout Image */}
          <img
            src={finalImage}
            alt={title}
            className="relative z-10 w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105 p-1"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x300?text=Combo+Deal";
            }}
          />
        </div>

        {/* 📝 TITLE */}
        <h5
          className="text-xs sm:text-base font-bold font-['Oswald',sans-serif] tracking-wide text-gray-900 dark:text-white uppercase line-clamp-1 mt-1 text-left group-hover:text-amber-500 transition-colors m-0"
          title={title}
        >
          {title}
        </h5>

        {/* 💰 BOTTOM BAR (PRICE & ACTION) */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 dark:border-white/5">
          {/* Price */}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-[10px] sm:text-xs font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-tight font-['Oswald',sans-serif]">
              Rs
            </span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-amber-500 dark:text-amber-400 font-['Oswald',sans-serif]">
              {dealPrice}
            </span>
            {originalPrice && originalPrice > dealPrice && (
              <span className="text-[9px] sm:text-xs text-gray-400 dark:text-neutral-500 line-through font-semibold font-['Oswald',sans-serif] ml-0.5">
                {Math.round(originalPrice)}
              </span>
            )}
          </div>

          {/* Add Button */}
          <button
            type="button"
            className="w-7 h-7 sm:w-9 sm:h-9 bg-amber-500 hover:bg-amber-400 text-black rounded-lg sm:rounded-xl flex items-center justify-center font-bold shadow-sm active:scale-95 cursor-pointer border-none transition-all"
            onClick={openPopup}
            aria-label="Customize deal"
          >
            <FaShoppingBag className="text-[10px] sm:text-xs text-neutral-950" />
          </button>
        </div>
      </div>

      {/* 🚀 MODAL PORTAL */}
      {isOpen &&
        ReactDOM.createPortal(
          <PopupCard
            item={{
              ...deal,
              is_deal: true,
            }}
            image={finalImage}
            title={title}
            description={deal.description || deal.items_description}
            price={dealPrice}
            isDeal={true}
            closePopup={closePopup}
          />,
          document.body
        )}
    </>
  );
};

export default DealCard;
