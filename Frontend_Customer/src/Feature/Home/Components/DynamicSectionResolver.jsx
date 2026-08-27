import React from "react";
import { FaBoxOpen } from "react-icons/fa";
import HomeHero from "./HomeHero";
import HomeProductSlider from "./HomeProductSlider";
import ExploreMenu from "../../Menu/Components/ExploreMenu";
import HomeBanners from "./HomeBanners";

export default function DynamicSectionResolver({
  homepageData,
  menuItems = [],
  bestSellersData = [],
  allTopDeals = [],
  handleBannerClick,
}) {
  const elements = [];
  const sections = homepageData?.sections || [];

  // Render Sections in Order
  sections.forEach((section) => {
    let sectionComponent = null;

    if (section.section_type === "hero") {
      sectionComponent = (
        <HomeHero
          slides={homepageData.hero_sliders || []}
          onBannerClick={handleBannerClick}
        />
      );
    }

    if (section.section_type === "explore_menu") {
      sectionComponent = (
        <ExploreMenu
          key={`exp-${section.id}`}
          title={section.title || "EXPLORE MENU"}
          subtitle={section.subtitle || "VIEW ALL"}
        />
      );
    }

    if (section.section_type === "product_slider") {
      let items = [];
      const isDeals = section.content_data === "filter:top_deals";
      if (section.content_data === "filter:best_sellers") {
        items = bestSellersData;
      } else if (isDeals) {
        items = allTopDeals;
      } else if (
        section.content_data &&
        section.content_data.startsWith("category:")
      ) {
        const categoryName = section.content_data.split(":")[1];
        items = menuItems.filter(
          (item) => item.category === categoryName && item.isAvailable === true
        );
      } else if (
        section.content_data &&
        section.content_data.startsWith("custom:")
      ) {
        const idsStr = section.content_data.split(":")[1];
        if (idsStr) {
          const ids = idsStr.split(",").map((id) => parseInt(id));
          items = menuItems.filter(
            (item) =>
              ids.includes(parseInt(item.id)) && item.isAvailable === true
          );
        }
      }

      sectionComponent = (
        <div key={`prod-${section.id}`} className="relative pb-2">
          <HomeProductSlider
            title={
              isDeals
                ? section.title || "TOP DEALS & COMBOS"
                : section.title
            }
            items={items}
            viewAllLink={
              isDeals
                ? "/deals"
                : section.content_data === "filter:best_sellers"
                ? "/menu"
                : section.link_url || "/menu"
            }
          />
        </div>
      );
    }

    if (section.section_type === "banner") {
      let bannerItems = [];
      if (
        homepageData.featured_banners &&
        homepageData.featured_banners.length > 0
      ) {
        bannerItems = homepageData.featured_banners;
      } else {
        try {
          if (
            section.content_data &&
            section.content_data.startsWith("[")
          ) {
            const parsed = JSON.parse(section.content_data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              bannerItems = parsed.map((item, idx) => ({
                id: idx,
                image:
                  typeof item === "object"
                    ? item.image_url || item.image
                    : item,
                link:
                  typeof item === "object"
                    ? item.link_url || section.link_url
                    : section.link_url,
                title:
                  typeof item === "object"
                    ? item.title || section.title
                    : section.title,
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
            },
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

    // Push section container
    if (sectionComponent) {
      if (
        section.section_type === "hero" ||
        section.section_type === "banner"
      ) {
        elements.push(
          <div key={`wrapper-${section.id}`} className="w-full">
            {sectionComponent}
          </div>
        );
      } else {
        elements.push(
          <div
            key={`wrapper-${section.id}`}
            className="w-full px-4 md:px-12 pt-4 pb-2"
          >
            {sectionComponent}
          </div>
        );
      }
    }
  });

  // Empty state fallback
  if (elements.length === 0) {
    elements.push(
      <div
        key="empty"
        className="w-full px-4 md:px-12 py-12 min-h-[50vh] flex items-center justify-center"
      >
        <div className="text-center animate-pulse">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              marginBottom: "20px",
              animation: "bounceIcon 2s infinite ease-in-out",
            }}
          >
            <FaBoxOpen size={40} />
          </div>
          <h3 className="text-white mb-2.5 font-semibold tracking-wide">
            Nothing Here Yet!
          </h3>
          <p className="text-slate-400 max-w-[25rem] mx-auto leading-relaxed">
            {homepageData.settings?.empty_homepage_message ||
              "We are currently updating our menu and offers. Please check back soon!"}
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
}
