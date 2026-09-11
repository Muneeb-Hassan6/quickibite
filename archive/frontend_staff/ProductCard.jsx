import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "../../Context/CartContext";
import { FaPlus } from "react-icons/fa";
import PopupCard from "./PopupCard";

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
  const finalImage =
    image || item?.img || "https://placehold.co/600x400?text=No+Image";

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
      <div className="group bg-[var(--panel-bg,#181818)] rounded-[16px] border border-[var(--border-color,#2a2a2a)] overflow-hidden flex flex-col h-full cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] translate-y-0 w-full hover:border-[var(--brand-red)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-[5px]" onClick={openPopup}>
        {/* 📸 IMAGE CONTAINER (KFC STYLE) */}
        <div className="relative overflow-hidden h-[200px] w-full bg-transparent p-0 max-md:h-[140px] max-[380px]:h-[120px]">
          <div className="absolute top-[15px] left-0 z-10 flex flex-col gap-[6px] items-start max-md:top-[8px] max-md:gap-[4px]">
            {isTopDeal && <span className="bg-[var(--brand-red,#ef4444)] text-[var(--btn-text,#ffffff)] px-[10px] py-[4px] pl-[8px] rounded-[0_12px_12px_0] text-[10px] font-extrabold uppercase tracking-[0.5px] shadow-[3px_2px_10px_rgba(0,0,0,0.2)] backdrop-blur-[4px] max-md:text-[8px] max-md:px-[6px] max-md:py-[2px] max-md:pl-[4px] max-md:font-bold max-md:rounded-[0_8px_8px_0] max-md:tracking-normal max-md:transform-none max-[380px]:text-[7px] max-[380px]:px-[5px] max-[380px]:py-[2px] max-[380px]:pl-[3px]">Top Deal</span>}
            {isBestSeller && <span className="bg-[var(--brand-yellow,#facc15)] text-[var(--panel-bg,#111111)] px-[10px] py-[4px] pl-[8px] rounded-[0_12px_12px_0] text-[10px] font-extrabold uppercase tracking-[0.5px] shadow-[3px_2px_10px_rgba(0,0,0,0.2)] max-md:text-[8px] max-md:px-[6px] max-md:py-[2px] max-md:pl-[4px] max-md:font-bold max-md:rounded-[0_8px_8px_0] max-md:tracking-normal max-md:transform-none max-[380px]:text-[7px] max-[380px]:px-[5px] max-[380px]:py-[2px] max-[380px]:pl-[3px]">Best Seller</span>}
          </div>
          <img src={finalImage} alt={finalTitle} className="w-full h-full object-cover transition-transform duration-500 ease-in-out scale-100 group-hover:scale-110 max-md:rounded-t-[12px]" />
        </div>

        {/* 📝 CARD DETAILS */}
        <div className="p-[16px] flex flex-col grow max-md:p-[12px] max-md:gap-[5px]">
          <h5 className="text-[var(--text-main,#ffffff)] font-extrabold text-[19px] mb-[6px] font-['Oswald',sans-serif] leading-[1.2] max-md:text-[15px] max-md:mb-0 max-[380px]:text-[13px]">{finalTitle}</h5>
          <p className="text-[var(--text-muted,#a3a3a3)] text-[13px] leading-[1.4] mb-[12px] line-clamp-2 max-md:hidden">{finalDesc}</p>

          {/* 💰 PRICE & ADD BUTTON IN ONE ROW */}
          <div className="flex justify-between items-center mt-auto pt-[10px] max-md:pt-[8px]">
            <span className="text-[var(--text-main,#ffffff)] font-black text-[22px] m-0 font-['Oswald',sans-serif] max-md:text-[16px]">
              <small className="text-[14px] text-[var(--brand-red,#ef4444)] max-md:text-[11px]">Rs</small> {finalPrice}
            </span>
            <button
              className="bg-[var(--brand-red,#ef4444)] text-[var(--btn-text,#ffffff)] border-none rounded-[30px] px-[20px] py-[8px] font-extrabold text-[14px] uppercase cursor-pointer flex items-center gap-[6px] transition-all duration-200 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[var(--brand-red-dark,#dc2626)] hover:scale-105 max-md:px-[12px] max-md:py-[6px] max-[380px]:px-[10px] max-[380px]:py-[5px]"
              onClick={(e) => {
                e.stopPropagation();
                openPopup();
              }}
            >
              <FaPlus className="block max-md:m-0 max-md:text-[12px]" /> <span className="block max-md:hidden">Add</span>
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