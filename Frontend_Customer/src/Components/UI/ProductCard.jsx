import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "../../Context/CartContext";
import { FaPlus } from "react-icons/fa";
import PopupCard from "./PopupCard";
import { optimizeCloudinaryImage } from "../../utils/imageOptimizer";

const ProductCard = ({
  image,
  title,
  description,
  price,
  item,
  isTopDeal,
  isBestSeller,
}) => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const finalTitle = title || item?.name || "Delicious Item";
  const finalDesc =
    description ||
    item?.desc ||
    "Spicy, crunchy, and freshly prepared for you.";
  const finalPrice = price || item?.price || 0;
  const finalImageRaw =
    image || item?.img || "https://placehold.co/600x400?text=No+Image";
  const finalImage = optimizeCloudinaryImage(finalImageRaw, 500);

  const openPopup = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closePopup = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <>
      <div className="bg-[var(--panel-bg,#181818)] rounded-[1rem] border border-[var(--border-color,#2a2a2a)] overflow-hidden flex flex-col h-full cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-[300ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] w-full hover:border-[var(--brand-red)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-[0.313rem] group" onClick={openPopup}>
        {/* 📸 IMAGE CONTAINER (KFC STYLE) */}
        <div className="relative overflow-hidden h-[12.5rem] w-full bg-transparent p-0 max-md:h-[8.749rem] max-[23.75rem]:h-[7.5rem]">
          <div className="absolute top-[0.937rem] left-0 z-10 flex flex-col gap-[0.375rem] items-start max-md:top-[0.5rem] max-md:gap-[0.251rem]">
            {isTopDeal && <span className="bg-[var(--brand-red,#ef4444)] text-[var(--btn-text,#ffffff)] p-[0.25rem_0.625rem_0.25rem_0.5rem] rounded-[0_0.75rem_0.75rem_0] text-[0.625rem] font-[800] uppercase tracking-[0.5px] shadow-[3px_2px_10px_rgba(0,0,0,0.2)] backdrop-blur-[0.25rem] max-md:text-[0.5rem] max-md:p-[2px_0.376rem_2px_0.251rem] max-md:font-[700] max-md:rounded-[0_0.5rem_0.5rem_0] max-md:tracking-0 max-[23.75rem]:text-[0.438rem] max-[23.75rem]:p-[2px_0.313rem_2px_0.188rem]">Top Deal</span>}
            {isBestSeller && <span className="bg-[var(--brand-yellow,#facc15)] text-[var(--panel-bg,#111111)] p-[0.25rem_0.625rem_0.25rem_0.5rem] rounded-[0_0.75rem_0.75rem_0] text-[0.625rem] font-[800] uppercase tracking-[0.5px] shadow-[3px_2px_10px_rgba(0,0,0,0.2)] max-md:text-[0.5rem] max-md:p-[2px_0.376rem_2px_0.251rem] max-md:font-[700] max-md:rounded-[0_0.5rem_0.5rem_0] max-md:tracking-0 max-[23.75rem]:text-[0.438rem] max-[23.75rem]:p-[2px_0.313rem_2px_0.188rem]">Best Seller</span>}
          </div>
          <img src={finalImage} alt={finalTitle} className="w-full h-full object-cover transition-transform duration-500 scale-100 group-hover:scale-110 max-md:rounded-t-[0.75rem]" />
        </div>

        {/* 📝 CARD DETAILS */}
        <div className="p-[1rem] flex flex-col grow max-md:p-[0.75rem] max-md:gap-[0.312rem]">
          <h5 className="text-[var(--text-main,#ffffff)] font-[800] text-[1.188rem] mb-[0.375rem] font-['Oswald',sans-serif] leading-[1.2] max-md:text-[0.938rem] max-md:mb-0 max-[23.75rem]:text-[0.812rem]">{finalTitle}</h5>
          <p className="text-[var(--text-muted,#a3a3a3)] text-[0.812rem] leading-[1.4] mb-[0.75rem] max-md:hidden display-[-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">{finalDesc}</p>

          {/* 💰 PRICE & ADD BUTTON IN ONE ROW */}
          <div className="flex justify-between items-center mt-auto pt-[0.625rem] max-md:pt-[0.5rem]">
            <span className="text-[var(--text-main,#ffffff)] font-[900] text-[1.375rem] m-0 font-['Oswald',sans-serif] max-md:text-[1rem]">
              <small className="text-[0.875rem] text-[var(--brand-red,#ef4444)] max-md:text-[0.688rem]">Rs</small> {finalPrice}
            </span>
            <button
              className="bg-[var(--brand-red,#ef4444)] text-[var(--btn-text,#ffffff)] border-none rounded-[1.875rem] p-[0.5rem_1.25rem] font-[800] text-[0.875rem] uppercase cursor-pointer flex items-center gap-[0.375rem] transition-all duration-200 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[var(--brand-red-dark,#dc2626)] hover:scale-105 max-md:p-[0.376rem_0.75rem] max-[23.75rem]:p-[0.313rem_0.625rem]"
              onClick={(e) => {
                e.stopPropagation();
                openPopup();
              }}
            >
              <FaPlus className="max-md:m-0 max-md:text-[0.75rem]" /> <span className="max-md:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {isOpen &&
        ReactDOM.createPortal(
          <PopupCard
            image={finalImage}
            title={finalTitle}
            description={finalDesc}
            price={finalPrice}
            item={item}
            closePopup={closePopup}
          />,
          document.body
        )}
    </>
  );
};

export default ProductCard;