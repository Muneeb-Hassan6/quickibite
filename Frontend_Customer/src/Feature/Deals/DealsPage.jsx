import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaPercentage } from "react-icons/fa";
import { LuSlidersHorizontal } from "react-icons/lu";
import DealsSidebar from "./Components/DealsSidebar";
import DealCard from "./Components/DealCard";
import heroPizzaImg from "../../assets/deals-hero-pizza.png";

const DealsPage = () => {
  const [activeCategory, setActiveCategory] = useState("All Deals");
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ⚙️ FETCH DEALS & COMBOS VIA REACT QUERY
  const { data: combosData = [], isLoading: isCombosLoading } = useQuery({
    queryKey: ["active_deals"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_active_deals.php`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data.map((deal) => ({
          id: `deal-${deal.id}`,
          deal_id: deal.id,
          name: deal.title || deal.name,
          title: deal.title || deal.name,
          price: parseFloat(deal.price),
          original_price: deal.original_price
            ? parseFloat(deal.original_price)
            : null,
          badge_tag: deal.badge_tag || deal.tag || "HOT DEAL",
          tag: deal.badge_tag || deal.tag || "HOT DEAL",
          img: deal.img || deal.image,
          image: deal.img || deal.image,
          is_deal: true,
          isTopDeal: true,
          isBestSeller: true,
          items: deal.items || [],
          items_description: deal.items_description,
          description:
            deal.items_description ||
            deal.description ||
            "Exclusive combo deal packed with your favorites.",
          is_permanent: deal.is_permanent,
        }));
      }
      return [];
    },
  });

  // Fetch Menu Items (Optional Fallback for items flagged as top deal)
  const { data: menuData = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const isLoading = isMenuLoading || isCombosLoading;

  // Combine & Normalize Deals
  const allDeals = useMemo(() => {
    const menuTopDeals = menuData
      .filter((item) => item.isTopDeal === true && item.isAvailable !== false)
      .map((item) => ({
        ...item,
        is_deal: true,
        badge_tag: item.tag || "SPECIAL DEAL",
        items_description: item.description || item.name,
      }));

    return [...combosData, ...menuTopDeals];
  }, [combosData, menuData]);

  // 🏷️ Dynamically extract unique badge categories from active deals
  const dynamicCategories = useMemo(() => {
    const set = new Set(["All Deals"]);
    allDeals.forEach((deal) => {
      const tag = deal.badge_tag || deal.tag;
      if (tag && typeof tag === "string" && tag.trim()) {
        set.add(tag.trim().toUpperCase());
      }
    });
    return Array.from(set);
  }, [allDeals]);

  // Helper category matcher
  const matchesCategory = (deal, category) => {
    if (!category || category === "All Deals") return true;

    const dealTag = (deal.badge_tag || deal.tag || "").toLowerCase().trim();
    const catLower = category.toLowerCase().trim();
    if (dealTag === catLower) return true;

    const title = (deal.title || deal.name || "").toLowerCase();
    const desc = (
      deal.description ||
      deal.items_description ||
      ""
    ).toLowerCase();

    if (catLower.includes("burger") && (title.includes("burger") || desc.includes("burger"))) return true;
    if (catLower.includes("pizza") && (title.includes("pizza") || desc.includes("pizza"))) return true;
    if (catLower.includes("broast") && (title.includes("broast") || desc.includes("broast") || title.includes("chicken"))) return true;
    if (catLower.includes("wrap") && (title.includes("wrap") || desc.includes("wrap") || title.includes("shawarma"))) return true;

    return false;
  };

  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => matchesCategory(deal, activeCategory));
  }, [allDeals, activeCategory]);

  return (
    <div className="bg-slate-50 dark:bg-[#0a0a0c] min-h-screen text-gray-900 dark:text-neutral-100 transition-colors duration-300 pb-24">
      {/* ═════════════════════════════════════════════════════════
          1. CLEAN & BOLD HERO SHOWCASE WITH 3D PIZZA LIFTOFF
      ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-8 sm:pt-12 sm:pb-14 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        {/* Glow Accent */}
        <div className="absolute top-0 right-1/4 w-[350px] sm:w-[450px] h-[250px] sm:h-[300px] bg-amber-400/15 dark:bg-amber-400/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between text-center lg:text-left gap-6 sm:gap-8">
            {/* Left Column: Bold, Minimalist Typography */}
            <div className="flex-1 flex flex-col items-center lg:items-start max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2">
                <span>EXCLUSIVE VALUE COMBOS &bull; SAVINGS GUARANTEED</span>
              </div>
              <h1 className="font-['Oswald',sans-serif] font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-neutral-950 dark:text-white uppercase leading-[1.08] m-0">
                CRAVE MORE,{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  SAVE MORE
                </span>
              </h1>

              {/* Subtitle Text */}
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm md:text-base max-w-lg mt-2 sm:mt-3 font-medium leading-relaxed">
                Handcrafted bundled feasts, secret flavor combos & exclusive meal discounts freshly prepared for you.
              </p>
            </div>

            {/* Right Column: Unified 3D Floating Hero Showcase */}
            <div className="overflow-visible relative flex items-center justify-center shrink-0">
              <div className="relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 flex items-center justify-center group cursor-pointer select-none overflow-visible">
                <div className="absolute inset-0 bg-radial from-amber-400/25 via-amber-500/10 to-transparent rounded-full blur-2xl group-hover:scale-115 transition-transform duration-700 ease-out pointer-events-none" />

                <img
                  src={heroPizzaImg}
                  alt="Special BigBite Deals Pizza"
                  className="relative z-10 w-full h-full object-contain transition-all duration-500 ease-out transform 
                             group-hover:-translate-y-4 group-hover:rotate-[-3deg] group-hover:scale-105 
                             drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] group-hover:drop-shadow-[0_30px_45px_rgba(245,158,11,0.3)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          2. STICKY SIDEBAR + DYNAMIC ADAPTIVE DEALS GRID
      ═════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-start">
          {/* Left Categories Sidebar (Desktop Smooth Transition) */}
          <aside
            className={`hidden lg:block sticky top-24 self-start w-72 lg:w-80 shrink-0 max-h-[calc(100vh-7rem)] overflow-y-auto z-30 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all duration-300 ease-in-out flex-shrink-0 ${
              isDesktopSidebarVisible
                ? "opacity-100 translate-x-0 mr-6"
                : "w-0 opacity-0 -translate-x-10 mr-0 pointer-events-none overflow-hidden"
            }`}
          >
            <div className="w-72 lg:w-80">
              <DealsSidebar
                categories={dynamicCategories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </div>
          </aside>

          {/* Right Deals Content Area */}
          <div className="flex-1 min-w-0">
            {/* Header / Active Category Bar */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-gray-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <h2 className="text-lg sm:text-2xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-gray-900 dark:text-white m-0">
                  {activeCategory}
                </h2>

                {/* Desktop Sidebar Toggle */}
                <button
                  type="button"
                  onClick={() => setIsDesktopSidebarVisible((prev) => !prev)}
                  className="hidden lg:flex items-center justify-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400 shadow-xs transition-all active:scale-95 cursor-pointer"
                  title={isDesktopSidebarVisible ? "Hide Filters" : "Show Filters"}
                >
                  <LuSlidersHorizontal className="text-xs sm:text-sm" />
                </button>

                {/* Mobile Filter Trigger */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400 shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Filter Deals"
                >
                  <LuSlidersHorizontal className="text-xs" />
                </button>
              </div>

              <p className="hidden sm:block text-xs text-gray-500 dark:text-neutral-400 m-0">
                Click any combo deal to customize flavor options & sides
              </p>
            </div>

            {/* Deals Grid / States */}
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-[35vh] gap-3">
                <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs sm:text-sm font-bold font-['Oswald',sans-serif] tracking-wider uppercase text-gray-600 dark:text-neutral-400">
                  Loading Delicious Combo Deals...
                </span>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-300 dark:border-neutral-800 shadow-sm max-w-md mx-auto my-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <FaPercentage className="text-xl" />
                </div>
                <h3 className="text-lg font-black font-['Oswald',sans-serif] uppercase text-gray-900 dark:text-white mb-1.5">
                  No Deals in "{activeCategory}"
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">
                  Please explore our other categories or view all active meal combos.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory("All Deals")}
                  className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider shadow-md active:scale-95 transition-all cursor-pointer border-none"
                >
                  Reset & View All Deals
                </button>
              </div>
            ) : (
              /* Elevated Deals Grid with Dynamic 2-Column Mobile Baseline */
              <div
                className={`grid gap-2.5 sm:gap-4 md:gap-6 transition-all duration-300 ${
                  isDesktopSidebarVisible
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {filteredDeals.map((deal, idx) => (
                  <div key={deal.id || idx} className="w-full">
                    <DealCard deal={deal} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 📱 Mobile Categories Filter Drawer Modal */}
      <DealsSidebar
        isMobileDrawer={true}
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        categories={dynamicCategories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
    </div>
  );
};

export default DealsPage;
