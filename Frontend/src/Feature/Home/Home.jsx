import React, { useState, useEffect } from "react";
import HomeHero from "./Components/HomeHero";
import HomeProductSlider from "./Components/HomeProductSlider";
import ExploreMenu from "../Menu/Components/ExploreMenu";
import HomeBanners from "./Components/HomeBanners"; // 🔥 Imported Banners

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./styles/index.css";
import { useNavigate } from "react-router-dom"; // 🔥 Yeh add karein
import { FaArrowRight } from "react-icons/fa"; // 🔥 Yeh icon add karein
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
      {/* 1. Hero Banner */}
      <HomeHero slides={homepageData.hero_sliders || []} onBannerClick={handleBannerClick} />

      {/* 2. Dynamic Homepage Sections */}
      <div className="container-fluid px-3 px-md-5 py-4">
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "50px 0" }}>
            <div className="dot-loader">
              <div className="dot" style={{ width: "12px", height: "12px" }}></div>
              <div className="dot" style={{ width: "12px", height: "12px" }}></div>
              <div className="dot" style={{ width: "12px", height: "12px" }}></div>
            </div>
          </div>
        ) : (
          <>
            {homepageData.sections.map((section, index) => {
              if (section.section_type === 'explore_menu') {
                return <ExploreMenu key={section.id} />;
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

                if (items.length === 0) return null;

                return (
                  <div key={section.id} style={{ position: "relative", paddingBottom: "20px" }}>
                    <HomeProductSlider title={section.title} items={items} sliderType={section.slider_type || 'regular'} />
                    {section.content_data === 'filter:top_deals' && (
                      <div style={{ textAlign: "center", marginTop: "15px" }}>
                        <button onClick={() => navigate("/deals")} className="btn-view-all-deals">
                          Explore All Deals <FaArrowRight style={{ marginLeft: "8px" }} />
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
                  return (
                    <div className="home-banners-container" key={section.id} style={{ margin: '30px 0' }}>
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
                          const bgImage = isObject ? slide.image_url : slide;
                          const title = isObject ? (slide.title || section.title) : section.title;
                          const subtitle = isObject ? (slide.subtitle || section.subtitle) : section.subtitle;
                          const linkUrl = isObject ? (slide.link_url || section.link_url) : section.link_url;

                          return (
                            <SwiperSlide key={idx} onClick={() => linkUrl && handleBannerClick(linkUrl)}>
                              <div 
                                className="promo-banner-card"
                                style={{ backgroundImage: `url(${bgImage})`, cursor: linkUrl ? 'pointer' : 'default', height: '100%', margin: 0 }}
                              >
                                {/* User requested to hide content and overlay so they can use text embedded in the image */}
                                {/* <div className="banner-overlay">
                                  <div className="banner-content">
                                    <h2 className="banner-title">{title}</h2>
                                    <p className="banner-subtitle">{subtitle}</p>
                                    {linkUrl && (
                                      <button className="banner-action-btn">
                                        Explore
                                      </button>
                                    )}
                                  </div>
                                </div> */}
                              </div>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
                    </div>
                  );
                }

                // Default static banner
                return (
                  <div className="home-banners-container" key={section.id} style={{ margin: '30px 0' }}>
                    <div 
                      className="promo-banner-card"
                      style={{ backgroundImage: `url(${section.image_url})`, cursor: section.link_url ? 'pointer' : 'default' }}
                      onClick={() => section.link_url && handleBannerClick(section.link_url)}
                    >
                      {/* User requested to hide content and overlay so they can use text embedded in the image */}
                      {/* <div className="banner-overlay">
                        <div className="banner-content">
                          <h2 className="banner-title">{section.title}</h2>
                          <p className="banner-subtitle">{section.subtitle}</p>
                          {section.link_url && (
                            <button className="banner-action-btn">
                              Explore
                            </button>
                          )}
                        </div>
                      </div> */}
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {homepageData.sections.length === 0 && (
              <p style={{ textAlign: "center", color: "#64748b", marginTop: "20px" }}>
                Homepage is currently empty. Add sections from the Admin Panel.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
