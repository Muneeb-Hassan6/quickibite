import React from "react";
import { useNavigate } from "react-router-dom";

const HomeBanners = () => {
  const navigate = useNavigate();

  // Mock banners data. You can replace images with your actual cloudinary URLs later.
  const banners = [
    {
      id: 1,
      title: "Midnight Craving Deal",
      subtitle: "Flat 30% OFF on all Burgers!",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
      btnText: "Order Now",
      link: "/menu"
    },
    {
      id: 2,
      title: "Family Combo Fiesta",
      subtitle: "Get a free drink with every family platter.",
      image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1200&auto=format&fit=crop",
      btnText: "Explore Combos",
      link: "/deals"
    }
  ];

  return (
    <div className="w-full flex flex-col gap-[1.25rem] md:gap-[1.874rem] p-[0.625rem_0.625rem_1.875rem_0.625rem] md:p-[1.25rem_0.625rem_2.501rem_0.625rem]">
      {banners.map((banner) => (
        <div 
          key={banner.id} 
          className="relative w-full h-[12.5rem] md:h-[28.126rem] rounded-[1rem] md:rounded-[1.25rem] bg-cover bg-center bg-no-repeat overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.4)] transition-all duration-400 ease-in-out hover:-translate-y-[0.313rem] hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
          style={{ backgroundImage: `url(${banner.image})` }}
        >
          {/* exact overlay gradient matching original css */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,15,15,0.95)] via-[rgba(15,15,15,0.7)] md:from-[rgba(15,15,15,0.9)] md:via-[rgba(15,15,15,0.5)] to-transparent flex items-center px-[1.25rem] md:px-[2.501rem]">
            <div className="max-w-[80%] md:max-w-[60%] text-white">
              <h2 className="font-['Oswald',sans-serif] text-[1.5rem] md:text-[2.25rem] font-[800] uppercase mb-[0.313rem] md:mb-[0.625rem] leading-[1.1] [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]">
                {banner.title}
              </h2>
              <p className="text-[0.875rem] md:text-[1rem] text-[#e0e0e0] mb-[0.937rem] md:mb-[1.562rem] font-[500]">
                {banner.subtitle}
              </p>
              <button 
                className="bg-[var(--brand-red,#ef4444)] text-[#ffffff] border-none py-[0.5rem] px-[1.125rem] md:py-[0.625rem] md:px-[1.5rem] rounded-[1.875rem] font-['Oswald',sans-serif] text-[0.875rem] md:text-[1rem] font-[700] uppercase cursor-pointer shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-all duration-300 ease-in-out hover:bg-[#dc2626] hover:scale-[1.05] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)]"
                onClick={() => navigate(banner.link)}
              >
                {banner.btnText}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeBanners;
