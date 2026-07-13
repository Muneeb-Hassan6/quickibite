import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";

const ExploreMenu = ({ title = "EXPLORE MENU", subtitle = "VIEW ALL" }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_categories.php`,
        );
        const data = await response.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

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
              className="grid grid-cols-3 auto-rows-[7.5rem] gap-[0.5rem] p-[0.313rem_0.625rem_1.25rem_0.625rem] overflow-x-hidden md:flex md:gap-[1.25rem] md:p-[0.625rem_1.25rem_1.874rem_1.25rem] md:overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*:nth-child(10n+1)]:row-span-2 [&>*:nth-child(10n+1)]:col-start-1 [&>*:nth-child(10n+8)]:row-span-2 [&>*:nth-child(10n+8)]:col-start-3 md:[&>*:nth-child(10n+1)]:row-span-1 md:[&>*:nth-child(10n+8)]:row-span-1" 
              ref={scrollRef}
              onScroll={checkForScrollPosition}
            >
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group w-full h-full relative rounded-[0.375rem] md:min-w-[13.751rem] md:h-[13.751rem] md:mt-[2.813rem] md:rounded-none md:flex md:flex-col md:items-center cursor-pointer transition-transform duration-300 md:hover:-translate-y-[0.313rem]"
                onClick={() =>
                  navigate("/menu", { state: { category: cat.name } })
                }
              >
                <div className="w-full h-full rounded-[0.375rem] bg-[var(--panel-bg,#f4f6f8)] border border-dashed border-[#94a3b8] p-[0.5rem] flex flex-col justify-center items-center relative overflow-hidden md:overflow-visible md:border-solid md:border-[#ffba00] md:rounded-[0.75rem] md:shadow-[0_4px_10px_rgba(0,0,0,0.05)] md:transition-all md:duration-400 md:justify-end md:pb-[1.25rem] md:group-hover:border-[var(--brand-red,#ef4444)] md:group-hover:shadow-[0_12px_25px_rgba(239,68,68,0.15)]">
                  <img
                    className="w-full h-full max-h-[6.25rem] object-contain relative m-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] md:w-[11.875rem] md:h-[11.875rem] md:max-h-none md:rounded-[0.5rem] md:absolute md:top-[-1.562rem] md:drop-shadow-[0_8px_12px_rgba(0,0,0,0.15)] md:transition-transform md:duration-400 md:z-5 md:group-hover:scale-110 md:group-hover:-translate-y-[0.937rem]"
                    src={optimizeCloudinaryImage(cat.img, 300)}
                    alt={cat.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                  <span className="relative z-2 text-[var(--text-main,#111)] font-[900] text-center leading-[1.2] mt-auto w-full text-[0.687rem] font-['Oswald',sans-serif] uppercase md:text-[0.938rem] md:font-[700] md:text-[var(--text-main,#333)] md:tracking-[0.5px] md:transition-colors md:duration-300 md:group-hover:text-[var(--brand-red,#ef4444)]">{cat.name}</span>
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
