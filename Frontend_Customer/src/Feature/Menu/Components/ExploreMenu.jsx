import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";

const ExploreMenu = ({ title = "EXPLORE MENU", subtitle = "VIEW ALL" }) => {
  const navigate = useNavigate();

  // Arrow Scroll State
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide arrows
  const checkForScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  useEffect(() => {
    checkForScrollPosition();
    window.addEventListener("resize", checkForScrollPosition);
    return () => window.removeEventListener("resize", checkForScrollPosition);
  }, [categories]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Distance to scroll per click
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Timeout allows smooth scrolling to finish before rechecking
      setTimeout(checkForScrollPosition, 350);
    }
  };


  return (
    <div className="pt-[1.875rem] bg-[var(--home-bg,#0c0c0e)]">
      <div className="flex justify-between items-center px-[1.25rem] mb-[1.25rem] md:mb-[1.562rem]">
        <h3 className="color-[var(--text-main,#fff)] text-white font-['Oswald',sans-serif] text-[1.5rem] md:text-[1.75rem] font-[800] uppercase border-b-[0.25rem] border-[var(--brand-red,#d32f2f)] pb-[0.375rem] m-0 tracking-[1.5px]">{title}</h3>
        <button className="bg-transparent text-[var(--text-main,#fff)] border-none border-b-[0.188rem] border-[var(--brand-red,#d32f2f)] pb-[0.25rem] cursor-pointer text-[0.875rem] md:text-[1rem] font-[800] uppercase transition-all duration-300 font-['Oswald',sans-serif] hover:text-[var(--brand-red,#d32f2f)] hover:tracking-[1px]" onClick={() => navigate("/menu")}>
          {subtitle}
        </button>
      </div>

      <div className="relative w-full">
        {isLoading ? (
          <div className="flex justify-center p-[1.25rem]">
            <div className="flex gap-[0.313rem]">
              <div className="w-[0.625rem] h-[0.625rem] bg-[var(--brand-red,#d32f2f)] rounded-full animate-bounce" style={{animationDelay: '-0.32s'}}></div>
              <div className="w-[0.625rem] h-[0.625rem] bg-[var(--brand-red,#d32f2f)] rounded-full animate-bounce" style={{animationDelay: '-0.16s'}}></div>
              <div className="w-[0.625rem] h-[0.625rem] bg-[var(--brand-red,#d32f2f)] rounded-full animate-bounce"></div>
            </div>
          </div>
        ) : categories.length > 0 ? (
          <div className="relative w-full">
            {canScrollLeft && (
              <button
                className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-[0.313rem] bg-[var(--panel-bg,#1a1a1a)] text-white border-2 border-white/10 w-[2.5rem] h-[2.5rem] rounded-full justify-center items-center cursor-pointer z-10 shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-300 text-[1rem] hover:bg-[var(--brand-red,#d32f2f)] hover:border-[var(--brand-red,#d32f2f)] hover:scale-110"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
              >
                <FaChevronLeft />
              </button>
            )}

            <div 
              className="grid grid-cols-3 auto-rows-[7.5rem] gap-[0.5rem] p-[0.313rem_0.625rem_1.25rem_0.625rem] overflow-x-hidden md:flex md:gap-[1.25rem] md:p-[1.25rem_1.25rem_1.874rem_1.25rem] md:overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*:nth-child(10n+1)]:row-span-2 [&>*:nth-child(10n+1)]:col-start-1 [&>*:nth-child(10n+8)]:row-span-2 [&>*:nth-child(10n+8)]:col-start-3 md:[&>*:nth-child(10n+1)]:row-span-1 md:[&>*:nth-child(10n+8)]:row-span-1" 
              ref={scrollRef}
              onScroll={checkForScrollPosition}
            >
            {categories.map((cat) => (
              <div
                key={cat.id || cat.name}
                className="group/card w-full h-full relative rounded-[0.375rem] md:min-w-[16.25rem] md:h-[17.5rem] md:mt-[4.375rem] md:rounded-none md:flex md:flex-col md:items-center cursor-pointer transition-transform duration-300 md:hover:-translate-y-[0.313rem]"
                onClick={() =>
                  navigate("/menu", { state: { category: cat.name } })
                }
              >
                <div className="w-full h-full rounded-[0.375rem] bg-[var(--panel-bg,#f4f6f8)] border border-dashed border-[#94a3b8] p-[0.5rem] flex flex-col justify-center items-center relative overflow-hidden md:border-none md:bg-white md:rounded-[1rem] md:shadow-[0_4px_15px_rgba(0,0,0,0.05)] md:transition-colors md:duration-300 md:justify-end md:pb-[1.5rem] md:group-hover/card:shadow-[0_15px_35px_rgba(255,186,0,0.3)]">
                  
                  {/* Sweeping Background Layers */}
                  <div className="hidden md:block absolute inset-0 bg-[#d32f2f] translate-y-full transition-transform duration-300 delay-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:group-hover/card:translate-y-0 md:group-hover/card:delay-0 z-0 rounded-[1rem]"></div>
                  <div className="hidden md:block absolute inset-0 bg-[#ffba00] translate-y-full transition-transform duration-300 delay-0 ease-[cubic-bezier(0.4,0,0.2,1)] md:group-hover/card:translate-y-0 md:group-hover/card:delay-200 z-0 rounded-[1rem]"></div>

                  {/* Circular Image wrapper to fix square images */}
                  <div className="w-full max-w-[6.25rem] aspect-square rounded-full overflow-hidden relative m-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] md:w-[10rem] md:max-w-none md:h-[10rem] md:relative md:mt-[1.25rem] md:drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] md:transition-transform md:duration-400 md:z-10 md:border-[0.25rem] md:border-white bg-white">
                    <img
                      className="w-full h-full object-cover"
                      src={optimizeCloudinaryImage(cat.img, 300)}
                      alt={cat.name}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                  </div>
                  
                  {/* Desktop Content */}
                  <div className="hidden md:flex flex-col items-center mt-auto w-full relative z-10">
                    <span className="text-[1.25rem] font-['Oswald',sans-serif] font-[800] uppercase text-[#222] tracking-[0.5px]">
                      {cat.name}
                    </span>
                    <div className="w-[2.5rem] h-[0.188rem] bg-[#d32f2f] my-[0.375rem] transition-colors duration-300 delay-0 md:group-hover/card:bg-white md:group-hover/card:delay-200"></div>
                    <span className="text-[#d32f2f] font-[700] text-[0.875rem] transition-colors duration-300 delay-0 md:group-hover/card:text-[#222] md:group-hover/card:delay-200">
                      Explore
                    </span>
                  </div>

                  {/* Mobile Content */}
                  <span className="md:hidden relative z-10 text-[var(--text-main,#111)] font-[900] text-center leading-[1.2] mt-auto w-full text-[0.687rem] font-['Oswald',sans-serif] uppercase">
                    {cat.name}
                  </span>
                </div>
              </div>
            ))}
            </div>

            {canScrollRight && (
              <button
                className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[0.313rem] bg-[var(--panel-bg,#1a1a1a)] text-white border-2 border-white/10 w-[2.5rem] h-[2.5rem] rounded-full justify-center items-center cursor-pointer z-10 shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-300 text-[1rem] hover:bg-[var(--brand-red,#d32f2f)] hover:border-[var(--brand-red,#d32f2f)] hover:scale-110"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-[#64748b]">
            No categories found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExploreMenu;
