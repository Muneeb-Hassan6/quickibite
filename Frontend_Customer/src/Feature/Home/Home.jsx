import React, { useState, useEffect } from "react";
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

  // Centralized Modal Scroll Management
  useEffect(() => {
    if (selectedPopupItem) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    };
  }, [selectedPopupItem]);
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
          deal_id: deal.id,
          name: deal.title,
          title: deal.title,
          price: parseFloat(deal.price),
          original_price: deal.original_price ? parseFloat(deal.original_price) : null,
          badge_tag: deal.badge_tag || deal.tag || "HOT DEAL",
          tag: deal.badge_tag || deal.tag || "HOT DEAL",
          image: deal.img,
          img: deal.img,
          promo_banner_image: deal.promo_banner_image,
          is_featured_banner: deal.is_featured_banner == 1,
          items: deal.items || [],
          items_description: deal.items_description,
          description: deal.description || deal.items_description,
          isAvailable: true,
          is_deal: true,
          size: "Combo",
        }));
      }
      return [];
    }
  });

  const { data: homepageData = { hero: [], sections: [], featured_banners: [] }, isLoading: isHomeLoading } = useQuery({
    queryKey: ['homepage_data'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_homepage_data.php`);
      const data = await res.json();
      return data.success ? data.data : { hero: [], sections: [], featured_banners: [] };
    }
  });

  const isLoading = isMenuLoading || isDealsLoading || isHomeLoading;

  const handleOpenDealModal = async (deal) => {
    if (!deal) return;
    const dealId = deal.deal_id || deal.id;
    let fullDeal = comboDeals.find(d => d.id.toString() === dealId.toString());

    // If deal items are not loaded, fetch complete details from backend
    if (!fullDeal || !fullDeal.items || fullDeal.items.length === 0) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_deal_details.php?id=${dealId}`);
        const data = await res.json();
        if (data.success && data.deal) {
          fullDeal = {
            ...data.deal,
            id: data.deal.id,
            deal_id: data.deal.id,
            name: data.deal.title,
            title: data.deal.title,
            price: parseFloat(data.deal.price),
            original_price: data.deal.original_price ? parseFloat(data.deal.original_price) : null,
            image: data.deal.img,
            img: data.deal.img,
            is_deal: true,
            isAvailable: true,
            size: "Combo"
          };
        }
      } catch (e) {
        console.error("Error fetching deal details", e);
      }
    }

    const itemToOpen = fullDeal || deal;
    setSelectedPopupItem({
      ...itemToOpen,
      is_deal: true,
      name: itemToOpen.title || itemToOpen.name,
      desc: itemToOpen.description || itemToOpen.items_description
    });
  };

  const handleBannerClick = async (bannerOrUrl, extraBanner) => {
    console.log("Banner clicked payload:", bannerOrUrl, extraBanner);
    const banner = (typeof bannerOrUrl === 'object' && bannerOrUrl !== null) ? bannerOrUrl : extraBanner;
    const linkUrl = typeof bannerOrUrl === 'string' ? bannerOrUrl : (banner?.link || banner?.link_url);

    if (banner) {
      const isExplicitProduct = banner.type === 'product' || String(banner.id || '').startsWith('prod-') || Boolean(banner.category || banner.category_id);
      const isExplicitDeal = banner.type === 'deal' || banner.is_deal === true || String(banner.id || '').startsWith('deal-') || Boolean(banner.deal_id);

      if (isExplicitProduct && !isExplicitDeal) {
        // Menu Product -> Find full item from menuItems for complete variants (Small, Medium, Large) & addons
        const rawId = banner.target_id || (banner.raw_data && banner.raw_data.id) || String(banner.id).replace('prod-', '');
        const matchedItem = menuItems.find(item => item.id.toString() === rawId.toString());
        const fullProduct = matchedItem || banner.raw_data || banner;

        setSelectedPopupItem({
          ...fullProduct,
          is_deal: false,
          name: fullProduct.name || banner.title,
          title: fullProduct.name || banner.title,
          price: fullProduct.price || banner.price,
          image: fullProduct.img || fullProduct.image || banner.promo_banner_image || banner.image
        });
        return;
      }

      if (isExplicitDeal) {
        const rawId = banner.target_id || (banner.raw_data && (banner.raw_data.id || banner.raw_data.deal_id)) || String(banner.id).replace('deal-', '');
        const matchedDeal = comboDeals.find(d => d.id.toString() === rawId.toString());
        const fullDeal = matchedDeal || banner.raw_data || banner;
        await handleOpenDealModal(fullDeal);
        return;
      }
    }

    if (!linkUrl) return;
    
    // Check if it links to a product or deal
    if (linkUrl.startsWith('product:')) {
      const pId = linkUrl.split(':')[1];
      const foundItem = menuItems.find(item => item.id.toString() === pId.toString());
      if (foundItem) {
        setSelectedPopupItem({ ...foundItem, is_deal: false });
        return;
      }
    } else if (linkUrl.startsWith('deal:') || linkUrl.includes('selected=')) {
      let dId = linkUrl.startsWith('deal:') ? linkUrl.split(':')[1] : (linkUrl.match(/selected=([^&]+)/) || [])[1];
      if (dId) {
        await handleOpenDealModal({ id: dId, deal_id: dId });
        return;
      }
    }

    navigate(linkUrl);
  };

  // --- FILTERING DATA (Dynamic) ---
  const bestSellersData = menuItems.filter(
    (item) => item.isBestSeller === true && item.isAvailable === true,
  );

  // Menu items jo Top Deal hain
  const menuTopDeals = menuItems.filter(
    (item) => item.isTopDeal === true && item.isAvailable === true,
  );

  // Exclude deals promoted to Featured Banners from Top Deals Slider
  const sliderDeals = comboDeals.filter(
    (deal) => !deal.is_featured_banner
  );

  const allTopDeals = [...sliderDeals, ...menuTopDeals];

  return (
    <div className="bg-slate-50 dark:bg-[#0A0A0C] min-h-[100vh] text-gray-900 dark:text-white pb-[10vh] md:pb-[3.125rem] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] m-0 pt-0 transition-colors duration-300">
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
                const isDeals = section.content_data === 'filter:top_deals';
                if (section.content_data === 'filter:best_sellers') {
                  items = bestSellersData;
                } else if (isDeals) {
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
                  <div key={`prod-${section.id}`} className="relative pb-2">
                    <HomeProductSlider
                      title={isDeals ? (section.title || "TOP DEALS & COMBOS") : section.title}
                      items={items}
                      viewAllLink={isDeals ? "/deals" : (section.content_data === 'filter:best_sellers' ? "/menu" : (section.link_url || "/menu"))}
                    />
                  </div>
                );
              }

              if (section.section_type === 'banner') {
                let bannerItems = [];
                if (homepageData.featured_banners && homepageData.featured_banners.length > 0) {
                  bannerItems = homepageData.featured_banners;
                } else {
                  try {
                    if (section.content_data && section.content_data.startsWith('[')) {
                      const parsed = JSON.parse(section.content_data);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        bannerItems = parsed.map((item, idx) => ({
                          id: idx,
                          image: typeof item === 'object' ? (item.image_url || item.image) : item,
                          link: typeof item === 'object' ? (item.link_url || section.link_url) : section.link_url,
                          title: typeof item === 'object' ? (item.title || section.title) : section.title,
                        }));
                      }
                    }
                  } catch (e) {
                    console.error("Error parsing banner data", e);
                  }

                  if (bannerItems.length === 0 && section.image_url) {
                    bannerItems = [
                      {
                        id: 1,
                        image: section.image_url,
                        link: section.link_url || "/deals",
                        title: section.title || "Special Deals",
                      }
                    ];
                  }
                }

                if (bannerItems.length > 0) {
                  sectionComponent = (
                    <HomeBanners
                      key={`ban-${section.id}`}
                      banners={bannerItems}
                      onBannerClick={handleBannerClick}
                    />
                  );
                }
              }

              // Push section
              if (sectionComponent) {
                if (section.section_type === 'hero' || section.section_type === 'banner') {
                  elements.push(
                    <div key={`wrapper-${section.id}`} className="w-full">
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

      {/* ═══════════════════════════════════════════════════════════
          ROOT MODAL PORTAL: CUSTOMIZATION POPUP (DEALS & PRODUCTS)
      ═══════════════════════════════════════════════════════════ */}
      {selectedPopupItem &&
        ReactDOM.createPortal(
          <PopupCard
            item={selectedPopupItem}
            title={selectedPopupItem.title || selectedPopupItem.name}
            description={selectedPopupItem.description || selectedPopupItem.desc || selectedPopupItem.items_description}
            price={selectedPopupItem.price}
            image={selectedPopupItem.image || selectedPopupItem.img}
            closePopup={() => setSelectedPopupItem(null)}
          />,
          document.body
        )}
    </div>
  );
};

export default HomePage;
