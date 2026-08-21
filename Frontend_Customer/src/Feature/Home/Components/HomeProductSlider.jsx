import React, { useRef, useState, useEffect } from "react";
import ProductCard from "../../../Components/UI/ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { EffectCards, EffectCoverflow, EffectFade, Pagination } from "swiper/modules";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";
import { sliderStyles } from "./SliderStyles";

const HomeProductSlider = ({ title, items, sliderType = "regular" }) => {
  const sliderRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false); // 🔥 Smart logic state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // 🔥 State for Cinematic Showcase
  const [activeDeal, setActiveDeal] = useState(items && items.length > 0 ? items[0] : null);

  useEffect(() => {
    if (items && items.length > 0) {
      setActiveDeal(items[0]);
    }
  }, [items]);

  // 🔥 Check karna ke scroll ki zaroorat hai ya nahi
  const checkOverflow = () => {
    if (sliderRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = sliderRef.current;
      setShowArrows(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      checkOverflow();
    };
    
    if (slider) {
      slider.addEventListener("scroll", checkOverflow);
    }
    checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (slider) slider.removeEventListener("scroll", checkOverflow);
    };
  }, [items]);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 350;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <style>{sliderStyles}</style>
      <div className="w-full overflow-hidden mb-10">
      <div className="flex justify-between items-center mb-5 px-2.5">
        <h3 className="text-[var(--text-main,#fff)] font-['Oswald',sans-serif] text-[1.375rem] md:text-[1.75rem] font-extrabold uppercase border-l-[0.313rem] border-red-500 pl-[0.937rem] m-0 tracking-[1px]">{title}</h3>
      </div>

      {/* 🔥 ALWAYS RENDER REGULAR HORIZONTAL SLIDER */}
      <div className="relative w-full flex items-center">
        {showArrows && canScrollLeft && (
          <button
            className="absolute top-[40%] -translate-y-1/2 z-10 bg-[var(--panel-bg,rgba(20,20,20,0.9))] text-white border border-[var(--border-color,#222)] w-[2.188rem] h-[2.188rem] md:w-[2.813rem] md:h-[2.813rem] rounded-full flex items-center justify-center text-[0.875rem] md:text-[1.126rem] cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.6)] left-[0.313rem] hover:bg-red-500 hover:border-red-500 hover:shadow-[0_6px_15px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-90"
            onClick={() => scroll("left")}
          >
            <FaChevronLeft />
          </button>
        )}

        <div className="flex gap-[1.25rem] overflow-x-auto px-[0.625rem] pt-[1.5rem] pb-[2.5rem] scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" ref={sliderRef}>
          {items.map((item) => (
            <div className="min-w-[14rem] max-w-[15rem] md:min-w-[18.75rem] md:max-w-[20rem] flex-none" key={item.id}>
              <ProductCard
                item={item}
                image={item.img}
                title={item.name}
                description={item.description}
                price={item.price}
                isTopDeal={item.isTopDeal}
                isBestSeller={item.isBestSeller}
              />
            </div>
          ))}
        </div>

        {showArrows && canScrollRight && (
          <button
            className="absolute top-[40%] -translate-y-1/2 z-10 bg-[var(--panel-bg,rgba(20,20,20,0.9))] text-white border border-[var(--border-color,#222)] w-[2.188rem] h-[2.188rem] md:w-[2.813rem] md:h-[2.813rem] rounded-full flex items-center justify-center text-[0.875rem] md:text-[1.126rem] cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.6)] right-[0.313rem] hover:bg-red-500 hover:border-red-500 hover:shadow-[0_6px_15px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-90"
            onClick={() => scroll("right")}
          >
            <FaChevronRight />
          </button>
        )}
      </div>
      </div>
    </>
  );
};

export default HomeProductSlider;
