import React, { useState, useEffect } from "react";
import { FaCartPlus, FaFire, FaPercentage } from "react-icons/fa";
import Swal from "sweetalert2";
import { useCart } from "../../../Context/CartContext";

// 🔥 Yahan hum ne ProductCard ki CSS link kar di hai taake same styling apply ho


const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // ==========================================
  // ⚙️ BACKEND API & LOGIC (100% UNTOUCHED)
  // ==========================================
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAllDeals = async () => {
      try {
        const [menuRes, combosRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`),
          fetch(`${import.meta.env.VITE_API_BASE}/get_active_deals.php`),
        ]);

        const menuData = await menuRes.json();
        const combosData = await combosRes.json();

        let combinedDeals = [];

        if (Array.isArray(menuData)) {
          const menuTopDeals = menuData.filter(
            (item) => item.isTopDeal === true && item.isAvailable === true,
          );
          combinedDeals = [...combinedDeals, ...menuTopDeals];
        }

        if (combosData.success && combosData.data) {
          const formattedCombos = combosData.data.map((deal) => ({
            id: deal.id,
            title: deal.title,
            price: deal.price,
            img: deal.img,
            is_deal: true,
            items_description: deal.items_description,
            is_permanent: deal.is_permanent,
          }));
          combinedDeals = [...combinedDeals, ...formattedCombos];
        }

        setDeals(combinedDeals);
      } catch (error) {
        console.error("Deals Page: Fetch error", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDeals();
  }, []);

  const handleAddDealToCart = (deal) => {
    addToCart({
      id: deal.is_deal ? `combo-${deal.id}` : deal.id,
      title: deal.title || deal.name,
      price: parseFloat(deal.price),
      qty: 1,
      size: deal.is_deal ? "Combo" : "Regular",
      is_deal: deal.is_deal || false,
      image: deal.img || deal.image,
      note: deal.items_description
        ? `Items: ${deal.items_description}`
        : deal.is_deal
          ? "Combo Deal"
          : "",
    });

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Added to Cart!",
      showConfirmButton: false,
      timer: 1500,
      background: "#141414",
      color: "#fff",
    });
  };

  // ==========================================
  // 🎨 UPDATED HTML STRUCTURE (KFC STYLE)
  // ==========================================
  return (
    <div className="bg-transparent min-h-screen">
      <div className="pt-[1.875rem] pb-[5rem] px-[0.938rem] md:px-[3.125rem]">
        <div className="text-center mb-[2.5rem] mt-[1.25rem]">
          <h1 className="font-['Oswald',sans-serif] text-[2.25rem] text-white font-black uppercase tracking-[1px] m-0 flex items-center justify-center gap-2">
            <FaPercentage className="text-red-500" /> EXCLUSIVE{" "}
            <span className="text-red-500">DEALS</span>
          </h1>
          <p className="text-[#888] text-[1rem] mt-2">
            Grab your favorite combos and top deals before they're gone!
          </p>
        </div>

        {isLoading ? (
          <div className="text-center p-[3.125rem]">
            <div className="flex justify-center items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
            </div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-[6.25rem] px-5">
            <FaFire className="text-[#333] text-[3.125rem] mx-auto" />
            <h3 className="text-[#555] mt-[0.938rem] text-xl">
              No active deals right now. Check back soon!
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1.25rem] px-[0.938rem]">
            {deals.map((deal, index) => (
              <div key={index} className="bg-[var(--panel-bg,#1a1a1a)] border border-[#333] rounded-[0.938rem] overflow-hidden flex flex-col h-full shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(239,68,68,0.2)] animate-fade-in group">

                {/* 📸 IMAGE CONTAINER */}
                <div className="w-full relative pt-[75%] bg-[#0f0f0f] overflow-hidden">
                  <div className="absolute top-[0.625rem] left-[0.625rem] z-10 flex gap-[0.313rem]">
                    {deal.is_deal && !deal.is_permanent ? (
                      <span className="bg-red-500 text-white text-[0.75rem] font-bold py-[0.25rem] px-[0.625rem] rounded-[0.25rem] uppercase tracking-[1px] shadow-[0_2px_5px_rgba(239,68,68,0.5)]">Limited Time</span>
                    ) : (
                      <span className="bg-red-500 text-white text-[0.75rem] font-bold py-[0.25rem] px-[0.625rem] rounded-[0.25rem] uppercase tracking-[1px] shadow-[0_2px_5px_rgba(239,68,68,0.5)]">Top Deal</span>
                    )}
                  </div>
                  <img
                    src={
                      deal.img ||
                      deal.image ||
                      "https://placehold.co/400x300?text=Delicious+Deal"
                    }
                    alt={deal.title || deal.name}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-80"
                  />
                </div>

                {/* 📝 CARD BODY */}
                <div className="p-[1.25rem] flex flex-col flex-grow">
                  <h5 className="text-[1.375rem] font-['Oswald',sans-serif] font-bold text-white uppercase tracking-[0.5px] m-0 mb-[0.625rem]">{deal.title || deal.name}</h5>
                  <p className="text-[#aaa] text-[0.875rem] leading-[1.4] mb-[1.25rem] flex-grow hidden md:block">
                    {deal.items_description || "Grab this amazing deal before it's gone!"}
                  </p>

                  {/* 💰 PRICE & BUTTON ROW */}
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-[1.5rem] font-['Oswald',sans-serif] font-bold text-red-500">
                      <small className="text-[1rem] mr-[0.125rem]">Rs</small> {deal.price}
                    </span>
                    <button
                      className="bg-transparent text-white border-2 border-red-500 px-[0.938rem] py-[0.313rem] rounded-[1.875rem] font-['Oswald',sans-serif] font-bold uppercase tracking-[1px] text-[0.875rem] flex items-center justify-center gap-[0.313rem] transition-all duration-300 hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      onClick={() => handleAddDealToCart(deal)}
                    >
                      <FaCartPlus />{" "}
                      <span>Add</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;