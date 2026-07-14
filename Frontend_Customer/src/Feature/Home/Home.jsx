import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HomeHero from "./Components/HomeHero";
import HomeProductSlider from "./Components/HomeProductSlider";
import ExploreMenu from "../Menu/Components/ExploreMenu";
import HomeBanners from "./Components/HomeBanners"; // 🔥 Imported Banners
import { optimizeCloudinaryImage } from "../../utils/imageOptimizer";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";


import { useNavigate } from "react-router-dom"; // 🔥 Yeh add karein
import { FaArrowRight, FaBoxOpen } from "react-icons/fa"; // 🔥 Yeh icon add karein
import ReactDOM from "react-dom";
import PopupCard from "../../Components/UI/PopupCard";

const HomePage = () => {
  // --- STATES ---
  const navigate = useNavigate();
  const [selectedPopupItem, setSelectedPopupItem] = useState(null);
  // --- FETCH DATA FROM API USING REACT QUERY ---
  const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: comboDeals = [], isLoading: isDealsLoading } = useQuery({
    queryKey: ['active_deals'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_active_deals.php`);
      const data = await res.json();
      if (data.success && data.data) {
        return data.data.map((deal) => ({
          id: deal.id,
          name: deal.title,
          title: deal.title,
          price: parseFloat(deal.price),
          image: deal.img,
          img: deal.img,
          items_description: deal.items_description,
          isAvailable: true,
          is_deal: true,
          size: "Combo",
        }));
      }
      return [];
    }
  });

  const { data: homepageData = { hero: [], sections: [] }, isLoading: isHomeLoading } = useQuery({
    queryKey: ['homepage_data'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_homepage_data.php`);
      const data = await res.json();
      return data.success ? data.data : { hero: [], sections: [] };
    }
  });

  const isLoading = isMenuLoading || isDealsLoading || isHomeLoading;

  const handleBannerClick = (linkUrl) => {
    if (!linkUrl) return;
    
    if (linkUrl.startsWith('product:')) {
      const id = linkUrl.split(':')[1];
      const foundItem = menuItems.find(item => item.id.toString() === id);
      if (foundItem) {
        setSelectedPopupItem(foundItem);
        document.body.style.overflow = "hidden";
      }
    } else if (linkUrl.startsWith('deal:')) {
      const id = linkUrl.split(':')[1];
      const foundDeal = comboDeals.find(deal => deal.id.toString() === id);
      if (foundDeal) {
        setSelectedPopupItem({ ...foundDeal, is_deal: true, name: foundDeal.title, desc: foundDeal.description });
        document.body.style.overflow = "hidden";
      }
    } else {
      navigate(linkUrl);
    }
  };

  // --- FILTERING DATA (Dynamic) ---
  const bestSellersData = menuItems.filter(
    (item) => item.isBestSeller === true && item.isAvailable === true,
  );

  // Menu items jo Top Deal hain
  const menuTopDeals = menuItems.filter(
    (item) => item.isTopDeal === true && item.isAvailable === true,
  );

  // 🔥 Yahan humne naye Combos aur Purani menu Top Deals dono ko mila diya!
  const allTopDeals = [...comboDeals, ...menuTopDeals];

  return (
    <div className="bg-[var(--home-bg,#0a0a0c)] min-h-[100vh] text-[var(--text-main,#fff)] pb-[10vh] md:pb-[3.125rem] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] m-0 pt-0">
      {isLoading ? (
        <div className="w-full px-4 md:px-12 py-6">
          <div className="flex justify-center py-[3.125rem]">
            <div className="dot-loader">
              <div className="dot w-3 h-3"></div>
              <div className="dot w-3 h-3"></div>
              <div className="dot w-3 h-3"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {(() => {
            const elements = [];

            // Render Sections in Order
            homepageData.sections.forEach((section, index) => {
              let sectionComponent = null;

              if (section.section_type === 'hero') {
                sectionComponent = <HomeHero slides={homepageData.hero_sliders || []} onBannerClick={handleBannerClick} />;
              }

              if (section.section_type === 'explore_menu') {
                sectionComponent = <ExploreMenu key={`exp-${section.id}`} title={section.title || "EXPLORE MENU"} subtitle={section.subtitle || "VIEW ALL"} />;
              }

              if (section.section_type === 'product_slider') {
                // Determine which data to pass
                let items = [];
                if (section.content_data === 'filter:best_sellers') {
                  items = bestSellersData;
                } else if (section.content_data === 'filter:top_deals') {
                  items = allTopDeals;
                } else if (section.content_data && section.content_data.startsWith('category:')) {
                  const categoryName = section.content_data.split(':')[1];
                  items = menuItems.filter(item => item.category === categoryName && item.isAvailable === true);
                } else if (section.content_data && section.content_data.startsWith('custom:')) {
                  const idsStr = section.content_data.split(':')[1];
                  if (idsStr) {
                    const ids = idsStr.split(',').map(id => parseInt(id));
                    items = menuItems.filter(item => ids.includes(parseInt(item.id)) && item.isAvailable === true);
                  }
                }

                sectionComponent = (
                  <div key={`prod-${section.id}`} className="relative pb-5">
                    <HomeProductSlider title={section.title} items={items} sliderType={section.slider_type || 'regular'} />
                    {section.content_data === 'filter:top_deals' && (
                      <div className="text-center mt-[0.938rem]">
                        <button onClick={() => navigate("/deals")} className="bg-transparent border-2 border-red-500 text-red-500 px-6 py-2 rounded-full font-['Oswald',sans-serif] font-bold tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300 inline-flex items-center justify-center">
                          {section.subtitle || "Explore All Deals"} <FaArrowRight className="ml-2" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              if (section.section_type === 'banner') {
                let isSlider = false;
                let slideUrls = [];
                
                try {
                  if (section.content_data && section.content_data.startsWith('[')) {
                    slideUrls = JSON.parse(section.content_data);
                    if (Array.isArray(slideUrls) && slideUrls.length > 1) {
                      isSlider = true;
                    }
                  }
                } catch (e) {
                  console.error("Error parsing banner slider data", e);
                }

                if (isSlider) {
                  sectionComponent = (
                    <div className="home-banners-container my-[1.875rem]" key={`ban-${section.id}`}>
                      <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={0}
                        slidesPerView={1}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        navigation={true}
                        className="banner-swiper"
                        style={{ borderRadius: '15px', overflow: 'hidden' }}
                      >
                        {slideUrls.map((slide, idx) => {
                          const isObject = typeof slide === 'object' && slide !== null;
                          const bgImage = optimizeCloudinaryImage(isObject ? slide.image_url : slide, 1200);
                          const title = isObject ? (slide.title || section.title) : section.title;
                          const subtitle = isObject ? (slide.subtitle || section.subtitle) : section.subtitle;
                          const linkUrl = isObject ? (slide.link_url || section.link_url) : section.link_url;

                          return (
                            <SwiperSlide key={idx} onClick={() => linkUrl && handleBannerClick(linkUrl)}>
                              <div 
                                className="w-full h-[11.25rem] md:h-[18.75rem] bg-cover bg-center bg-no-repeat rounded-[0.937rem] transition-transform duration-300 hover:scale-[1.02]"
                                style={{ backgroundImage: `url(${bgImage})`, cursor: linkUrl ? 'pointer' : 'default', margin: 0 }}
                              >
                              </div>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
                    </div>
                  );
                } else {
                  // Default static banner
                  sectionComponent = (
                    <div className="home-banners-container my-[1.875rem]" key={`ban-${section.id}`}>
                      <div 
                        className="w-full h-[11.25rem] md:h-[18.75rem] bg-cover bg-center bg-no-repeat rounded-[0.937rem] shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                        style={{ backgroundImage: `url(${optimizeCloudinaryImage(section.image_url, 1200)})`, cursor: section.link_url ? 'pointer' : 'default' }}
                        onClick={() => section.link_url && handleBannerClick(section.link_url)}
                      >
                      </div>
                    </div>
                  );
                }
              }

              // Push section
              if (sectionComponent) {
                if (section.section_type === 'hero') {
                  elements.push(
                    <div key={`wrapper-${section.id}`} className="w-full mb-2 mt-2">
                      {sectionComponent}
                    </div>
                  );
                } else {
                  elements.push(
                    <div key={`wrapper-${section.id}`} className="w-full px-4 md:px-12 pt-4 pb-2">
                      {sectionComponent}
                    </div>
                  );
                }
              }
            });

            // Empty state message
            if (elements.length === 0) {
              elements.push(
                <div key="empty" className="w-full px-4 md:px-12 py-12 min-h-[50vh] flex items-center justify-center">
                  <div className="text-center animate-pulse">
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      marginBottom: "20px",
                      animation: "bounceIcon 2s infinite ease-in-out"
                    }}>
                      <FaBoxOpen size={40} />
                    </div>
                    <h3 className="text-white mb-2.5 font-semibold tracking-wide">Nothing Here Yet!</h3>
                    <p className="text-slate-400 max-w-[25rem] mx-auto leading-relaxed">
                      {homepageData.settings?.empty_homepage_message || "We are currently updating our menu and offers. Please check back soon!"}
                    </p>
                  </div>
                  <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes bounceIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                  `}</style>
                </div>
              );
            }

            return elements;
          })()}
        </>
      )}
    </div>
  );
};

export default HomePage;
