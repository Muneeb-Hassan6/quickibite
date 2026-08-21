import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "../../Context/CartContext";
import { FaShoppingBasket, FaStar, FaRegStar, FaHeart } from "react-icons/fa";
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
      <div 
        className="bg-white rounded-[1.25rem] p-[0.625rem] flex flex-col h-full cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] w-full hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] group border border-[#f1f1f1]" 
        onClick={openPopup}
      >
        {/* 📸 IMAGE CONTAINER */}
        <div className="relative w-full h-[11.25rem] p-[0.625rem] flex justify-center items-center max-md:h-[9.375rem] rounded-[1rem] overflow-hidden">
          
          {/* Animated Full Background */}
          <div className="absolute inset-0 bg-[#faeed6] rounded-[1rem] overflow-hidden z-0">
            {/* Sweeping Background Layers */}
            <div className="absolute inset-0 bg-[#d32f2f] translate-y-full transition-transform duration-300 delay-100 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 group-hover:delay-0"></div>
            <div className="absolute inset-0 bg-[#ffba00] translate-y-full transition-transform duration-300 delay-0 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 group-hover:delay-150"></div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-[0.5rem] left-[0.5rem] z-20 flex gap-2">
            {isTopDeal && <span className="bg-[#111] text-white px-[0.625rem] py-[0.25rem] rounded-full text-[0.625rem] font-[800] uppercase tracking-[0.5px] shadow-sm">Sale!</span>}
            {isBestSeller && <span className="bg-[#ef4444] text-white px-[0.625rem] py-[0.25rem] rounded-full text-[0.625rem] font-[800] uppercase tracking-[0.5px] shadow-sm">Best</span>}
          </div>

          {/* Heart Icon */}
          <div className="absolute top-[0.5rem] right-[0.5rem] z-20 text-[#e5e7eb] group-hover:text-white transition-colors duration-300">
            <FaHeart className="w-[1.125rem] h-[1.125rem]" />
          </div>

          <img 
            src={finalImage} 
            alt={finalTitle} 
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)]" 
          />
        </div>

        {/* 📝 CARD DETAILS */}
        <div className="p-[0.625rem_0.313rem_0.313rem_0.313rem] flex flex-col grow">
          
          {/* Rating */}
          <div className="flex text-[#ffba00] text-[0.625rem] mb-[0.375rem] gap-[0.125rem]">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaRegStar className="text-[#e5e7eb]" />
          </div>

          <h5 className="text-[#222] font-[800] text-[1rem] mb-[0.25rem] font-['Segoe_UI',sans-serif] leading-[1.2] max-md:text-[0.938rem]">{finalTitle}</h5>
          <p className="text-[#9ca3af] text-[0.75rem] leading-[1.4] mb-[0.937rem] display-[-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">{finalDesc}</p>

          {/* 💰 PRICE & ADD BUTTON */}
          <div className="flex justify-between items-center mt-auto">
            <span className="text-[#ffba00] font-[800] text-[1.125rem]">
              <small className="text-[0.75rem] text-[#ffba00] mr-[2px]">Rs</small>{finalPrice}
            </span>
            <button
              className="bg-[#ffba00] text-[#111] border-none w-[2.25rem] h-[2.25rem] rounded-[0.625rem] flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:bg-[#eab308] hover:scale-110 hover:shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                openPopup();
              }}
            >
              <FaShoppingBasket size={14} />
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