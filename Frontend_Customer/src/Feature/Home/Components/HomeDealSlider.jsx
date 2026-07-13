import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useCart } from "../../../Context/CartContext";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";

const HomeDealsSlider = () => {
  const [deals, setDeals] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchActiveDeals = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_active_deals.php`,
        );
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setDeals(data.data);
        }
      } catch (error) {
        console.error("Failed to load deals", error);
      }
    };
    fetchActiveDeals();
  }, []);

  const handleAddDealToCart = (deal) => {
    addToCart({
      id: `deal-${deal.id}`,
      title: deal.title,
      price: parseFloat(deal.price),
      qty: 1,
      size: "Deal",
      is_deal: true,
      image: deal.img,
    });

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Deal Added to Cart!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  if (deals.length === 0) return null;

  return (
    <div className="w-full mb-[5vh] overflow-hidden">
      <div className="flex justify-between items-center mb-[3vh] px-[1.075rem] md:px-[1.8rem]">
        <h2 className="text-[1.612rem] md:text-3xl text-white font-['Oswald',sans-serif] uppercase font-extrabold flex items-center gap-2 m-0">
          🔥 Super Saver <span className="text-red-500">Deals</span>
        </h2>
        <button
          className="bg-transparent text-red-500 border-2 border-red-500 py-[1vh] px-[1.075rem] md:px-6 rounded-full font-bold text-[0.806rem] md:text-sm cursor-pointer whitespace-nowrap transition-all duration-300 hover:bg-red-500 hover:text-white"
          onClick={() => navigate("/deals")}
        >
          VIEW ALL DEALS
        </button>
      </div>

      <div className="flex gap-[1.075rem] md:gap-5 overflow-x-auto px-[1.075rem] md:px-[1.8rem] pb-[3vh] scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {deals.map((deal) => (
          <div key={deal.id} className="min-w-[18.813rem] max-w-[18.813rem] md:min-w-[18rem] md:max-w-[18rem] bg-[var(--panel-bg,#141417)] rounded-[1.075rem] md:rounded-2xl overflow-hidden shadow-lg border border-[var(--border-color,#2a2a30)] flex-none transition-transform duration-300 hover:-translate-y-2">
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <img
                src={optimizeCloudinaryImage(deal.img || "https://placehold.co/400x300", 500)}
                alt={deal.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute top-2 left-2 bg-red-500 text-white text-[0.672rem] md:text-xs font-bold px-[0.538rem] py-[0.5vh] md:px-3 md:py-1 rounded-full uppercase">Save Big</div>
            </div>
            <div className="p-[0.806rem] md:p-4">
              <h3 className="text-[1.209rem] md:text-lg text-white font-['Oswald',sans-serif] uppercase m-0 mb-[2vh] line-clamp-1">{deal.title}</h3>
              <div className="flex justify-between items-center border-t border-[var(--border-color,#2a2a30)] pt-[2vh]">
                <span className="text-[1.344rem] md:text-xl font-bold text-red-500 flex items-center">
                  <small className="text-[0.806rem] md:text-xs text-red-400 mr-1 mt-1">Rs</small> {deal.price}
                </span>
                <button
                  className="bg-transparent text-red-500 border border-red-500 w-[2.688rem] h-[2.688rem] md:w-auto md:h-auto md:px-4 md:py-1.5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white"
                  onClick={() => handleAddDealToCart(deal)}
                >
                  <FaCartPlus className="text-[1.075rem] md:text-sm" /> 
                  <span className="hidden md:inline font-bold uppercase text-xs">ADD</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeDealsSlider;
