import React, { useState, useEffect } from "react";
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

import "./styles/index.css";
import { useNavigate } from "react-router-dom"; // 🔥 Yeh add karein
import { FaArrowRight, FaBoxOpen } from "react-icons/fa"; // 🔥 Yeh icon add karein
import ReactDOM from "react-dom";
import PopupCard from "../../Components/UI/PopupCard";

const HomePage = () => {
  // --- STATES ---
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [comboDeals, setComboDeals] = useState([]);
  const [homepageData, setHomepageData] = useState({ hero: [], sections: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPopupItem, setSelectedPopupItem] = useState(null);

  // --- FETCH DATA FROM API ---
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // 🔥 Promise.all use kia hy taa k dono APIs ek sath hit hon (Speed fast rahay)
        const [menuResponse, dealsResponse, homepageResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`),
          fetch(`${import.meta.env.VITE_API_BASE}/get_active_deals.php`),
          fetch(`${import.meta.env.VITE_API_BASE}/get_homepage_data.php`),
        ]);

        const menuData = await menuResponse.json();
        const dealsData = await dealsResponse.json();
        const homeData = await homepageResponse.json();

        // 1. Homepage Dynamic Data
        if (homeData.success) {
          setHomepageData(homeData.data);
        }

        // 2. Menu Data Set
        if (Array.isArray(menuData)) {
          setMenuItems(menuData);
        }

        // 2. Deals Data Set (Format kr rahy hain taa k Slider isy easily show kr saky)
        if (dealsData.success && dealsData.data) {
          const formattedDeals = dealsData.data.map((deal) => ({
            id: deal.id,
            name: deal.title,
            title: deal.title,
            price: parseFloat(deal.price),
            image: deal.img,
            img: deal.img,
            items_description: deal.items_description, // 🔥 Yeh add karna hai
            isAvailable: true,
            is_deal: true,
            size: "Combo",
          }));
          setComboDeals(formattedDeals);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

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
    <div className="home-container home-page-wrapper">
      {isLoading ? (
        <div className="container-fluid px-3 px-md-5 py-4">
          <div style={{ display: "flex", justifyContent: "center", padding: "50px 0" }}>
            <div className="dot-loader">
              <div className="dot" style={{ width: "12px", height: "12px" }}></div>
              <div className="dot" style={{ width: "12px", height: "12px" }}></div>
              <div className="dot" style={{ width: "12px", height: "12px" }}></div>
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

                const viewAllBtn = section.content_data === 'filter:top_deals' ? (
                  <button onClick={() => navigate("/deals")} className="btn-view-all-deals" style={{ padding: '4px 14px', fontSize: '12px' }}>
                    {section.subtitle || "Explore All Deals"} <FaArrowRight style={{ marginLeft: "6px" }} />
                  </button>
                ) : null;

                sectionComponent = (
                  <div key={`prod-${section.id}`} style={{ position: "relative", paddingBottom: "5px" }}>
                    <HomeProductSlider title={section.title} items={items} sliderType={section.slider_type || 'regular'} actionButton={viewAllBtn} />
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
                    <div className="home-banners-container" key={`ban-${section.id}`} style={{ margin: '15px 0' }}>
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
                                className="promo-banner-card"
                                style={{ backgroundImage: `url(${bgImage})`, cursor: linkUrl ? 'pointer' : 'default', height: '100%', margin: 0 }}
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
                    <div className="home-banners-container" key={`ban-${section.id}`} style={{ margin: '15px 0' }}>
                      <div 
                        className="promo-banner-card"
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
                    <div key={`wrapper-${section.id}`} className="w-100 mb-2 mt-2">
                      {sectionComponent}
                    </div>
                  );
                } else {
                  elements.push(
                    <div key={`wrapper-${section.id}`} className="container-fluid px-3 px-md-5 py-2">
                      {sectionComponent}
                    </div>
                  );
                }
              }
            });

            // Empty state message
            if (elements.length === 0) {
              elements.push(
                <div key="empty" className="container-fluid px-3 px-md-5 py-5" style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", animation: "fadeIn 1s ease-out" }}>
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
                    <h3 style={{ color: "#fff", marginBottom: "10px", fontWeight: "600", letterSpacing: "1px" }}>Nothing Here Yet!</h3>
                    <p style={{ color: "#94a3b8", maxWidth: "400px", margin: "0 auto", lineHeight: "1.6" }}>
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
