import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFire, FaArrowRight } from "react-icons/fa";
import DealCard from "../../../Components/UI/DealCard";
import { API_BASE } from "../../../config/api";

const HomeDealsSlider = () => {
  const [deals, setDeals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveDeals = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/get_active_deals.php`
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDeals(
            data.data.map((deal) => ({
              ...deal,
              id: `deal-${deal.id}`,
              is_deal: true,
              isTopDeal: true,
              isBestSeller: true,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load deals", error);
      }
    };
    fetchActiveDeals();
  }, []);

  if (deals.length === 0) return null;

  return (
    <div className="w-full mb-12 select-none">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6 px-4 md:px-6">
        <h3 className="text-gray-900 dark:text-white font-['Oswald',sans-serif] text-[1.375rem] md:text-[1.75rem] font-extrabold uppercase border-l-[0.313rem] border-red-600 pl-[0.937rem] m-0 tracking-[1px]">
          TOP DEALS & COMBOS
        </h3>

        <button
          onClick={() => navigate("/deals")}
          className="text-xs md:text-sm font-black uppercase text-neutral-800 dark:text-neutral-200 hover:text-amber-500 tracking-wider transition-colors font-['Oswald',sans-serif] flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
        >
          <span>VIEW ALL</span>
          <FaArrowRight className="text-xs" />
        </button>
      </div>

      {/* Horizontal Scrollable Deals Strip */}
      <div className="flex gap-6 overflow-x-auto px-4 md:px-6 pb-6 pt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] flex-none"
          >
            <DealCard deal={deal} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeDealsSlider;
