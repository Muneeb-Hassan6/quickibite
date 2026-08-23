import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaFire, FaUtensils, FaStar, FaBolt } from "react-icons/fa";
import Sidebar, { getCategoryIcon } from "./Components/Sidebar";
import SearchBar from "./Components/SearchBar";
import MenuContent from "./Components/MenuContent";
import Footer from "../OnlineStore/Components/Footer";
import heroMenuFoodImg from "../../assets/products/friedchicken1-removebg-preview.png";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [expandedCategory, setExpandedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(false); // Default hidden / collapsed
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchBoxRef = useRef(null);

  // --- API FETCHING USING REACT QUERY ---
  const { data: rawCategories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_categories.php`
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data.filter((i) => i.isAvailable !== false) : [];
    },
  });

  // Normalize categories to pure string names for clean state & UI matching
  const categories = useMemo(() => {
    if (!Array.isArray(rawCategories)) return [];
    return rawCategories
      .map((c) => (typeof c === "string" ? c : c?.name || ""))
      .filter(Boolean);
  }, [rawCategories]);

  const isLoading = isCatLoading || isMenuLoading;

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
      setExpandedCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // --- HELPER SCROLL FUNCTION ---
  const performScroll = (el, offset = 140) => {
    if (!el) return;
    const topPos = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: topPos,
      behavior: "smooth",
    });
  };

  // --- HANDLE CATEGORY REDIRECT FROM OTHER PAGES (location.state) ---
  useEffect(() => {
    const rawTarget = location.state?.category;
    const targetCategory =
      typeof rawTarget === "object" ? rawTarget?.name : rawTarget;

    if (!isLoading && targetCategory && categories.length > 0) {
      const matchedCat = categories.find(
        (cat) => cat.toLowerCase() === targetCategory.toLowerCase()
      );
      if (matchedCat) {
        setActiveCategory(matchedCat);
        setExpandedCategory(matchedCat);
        setSearchTerm("");

        setTimeout(() => {
          const el = document.getElementById(matchedCat);
          performScroll(el);
        }, 150);

        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, isLoading, categories, navigate]);

  // --- HANDLE SEARCH & CATEGORY QUERY PARAMS (?search=... or ?category=...) ---
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      const params = new URLSearchParams(location.search);
      const searchQuery = params.get("search");
      const categoryQuery = params.get("category");

      if (searchQuery) {
        setSearchTerm(searchQuery);
      } else if (categoryQuery) {
        const normalizedQuery = categoryQuery.toLowerCase().replace(/[-_]/g, " ").trim();
        const matchedCat = categories.find((c) => {
          const catLower = c.toLowerCase();
          return (
            catLower === normalizedQuery ||
            catLower.includes(normalizedQuery) ||
            normalizedQuery.includes(catLower) ||
            (normalizedQuery.includes("wrap") &&
              (catLower.includes("wrap") ||
                catLower.includes("shawarma") ||
                catLower.includes("roll"))) ||
            (normalizedQuery.includes("potato") &&
              (catLower.includes("potato") || catLower.includes("fries"))) ||
            (normalizedQuery.includes("fries") &&
              (catLower.includes("potato") || catLower.includes("fries"))) ||
            (normalizedQuery.includes("pizza") && catLower.includes("pizza")) ||
            (normalizedQuery.includes("burger") && catLower.includes("burger"))
          );
        });

        if (matchedCat) {
          setActiveCategory(matchedCat);
          setExpandedCategory(matchedCat);
          setSearchTerm("");

          setTimeout(() => {
            const el = document.getElementById(matchedCat);
            performScroll(el);
          }, 150);
        }
      }
    }
  }, [location.search, isLoading, categories]);

  // Filter menu items by search query across names and descriptions
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems;
    const lower = searchTerm.toLowerCase();
    return menuItems.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(lower)) ||
        (item.description && item.description.toLowerCase().includes(lower)) ||
        (item.category && item.category.toLowerCase().includes(lower))
    );
  }, [menuItems, searchTerm]);

  // Search Results for autocomplete dropdown
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return filteredMenuItems.slice(0, 8);
  }, [filteredMenuItems, searchTerm]);

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    setExpandedCategory(cat);
    setSearchTerm("");
    const element = document.getElementById(cat);
    performScroll(element);
  };

  const scrollToProduct = (item) => {
    setActiveCategory(item.category);
    setExpandedCategory(item.category);
    setSearchTerm("");
    setTimeout(() => {
      const element = document.getElementById(`product-${item.id}`);
      performScroll(element, 160);
    }, 100);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-amber-500 gap-3 font-bold text-lg tracking-wide font-['Oswald',sans-serif]">
        <div className="w-4 h-4 bg-amber-400 rounded-full animate-bounce" />
        <div
          className="w-4 h-4 bg-amber-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="w-4 h-4 bg-amber-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        />
        <span className="ml-2">Loading Delicious Menu...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0a0a0c] min-h-screen text-gray-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Mobile Drawer Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        expandedCategory={expandedCategory}
        menuItems={menuItems}
        onCategoryClick={(c) => {
          scrollToCategory(c);
          setIsSidebarOpen(false);
        }}
        onProductClick={scrollToProduct}
      />

      {/* ═════════════════════════════════════════════════════════
          1. CLEAN & BOLD 3D MENU HERO HEADER (Responsive Stacking)
      ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-8 sm:pt-12 sm:pb-14 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-[350px] sm:w-[450px] h-[250px] sm:h-[300px] bg-amber-400/15 dark:bg-amber-400/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between text-center lg:text-left gap-6 sm:gap-8">
            {/* Left Column: Typography & Headline */}
            <div className="flex-1 flex flex-col items-center lg:items-start max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2">
                <span>HANDCRAFTED TASTE &bull; FRESHLY PREPARED</span>
              </div>
              <h1 className="font-['Oswald',sans-serif] font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-neutral-950 dark:text-white uppercase leading-[1.08] m-0">
                FLAVORS THAT{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  HIT DIFFERENT
                </span>
              </h1>

              {/* Subtitle Text */}
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm md:text-base max-w-lg mt-2 sm:mt-3 font-medium leading-relaxed">
                Explore handcrafted gourmet burgers, cheesy pizzas, crispy broast, wraps, and savory sides freshly prepared on order.
              </p>
            </div>

            {/* Right Column: 3D Floating Fried Chicken Showcase */}
            <div className="overflow-visible relative flex items-center justify-center shrink-0">
              <div className="relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 flex items-center justify-center group cursor-pointer select-none overflow-visible">
                {/* Ambient Golden Glow Backdrop */}
                <div className="absolute inset-0 bg-radial from-amber-400/25 via-amber-500/10 to-transparent rounded-full blur-2xl group-hover:scale-120 transition-transform duration-700 ease-out pointer-events-none" />

                {/* 3D Interactive Food Image with enhanced tilt */}
                <img
                  src={heroMenuFoodImg}
                  alt="BigBite Specialty Menu"
                  className="relative z-10 w-full h-full object-contain transition-all duration-500 ease-out transform 
                             group-hover:-translate-y-4 group-hover:rotate-[-5deg] group-hover:scale-108 
                             drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] group-hover:drop-shadow-[0_30px_50px_rgba(245,158,11,0.35)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          2. FIXED / STICKY TOP CONTROL BAR (Never Scrolls Away)
      ═════════════════════════════════════════════════════════ */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={searchResults}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        searchBoxRef={searchBoxRef}
        onFilterToggle={() => {
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(true);
          } else {
            setIsDesktopSidebarVisible((prev) => !prev);
          }
        }}
        isFilterActive={isDesktopSidebarVisible || isSidebarOpen}
      />

      {/* ═════════════════════════════════════════════════════════
          3. MAIN CONTENT WITH SMOOTH ANIMATED STICKY SIDEBAR
      ═════════════════════════════════════════════════════════ */}
      <div className="flex items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {/* Category Sticky Sidebar with smooth slide-in/out transition */}
        <aside
          className={`hidden lg:block sticky top-36 self-start max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden custom-sidebar-scroll rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 transition-all duration-300 ease-in-out flex-shrink-0 ${
            isDesktopSidebarVisible
              ? "w-64 opacity-100 p-4 translate-x-0 mr-6 shadow-sm"
              : "w-0 opacity-0 p-0 -translate-x-10 mr-0 pointer-events-none overflow-hidden border-0"
          }`}
        >
          <div className="w-56 min-w-[224px] overflow-x-hidden">
            <div className="pb-3 mb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="font-['Oswald',sans-serif] text-lg font-black text-gray-900 dark:text-white uppercase tracking-wide m-0">
                Categories
              </h3>
            </div>

            <div className="flex flex-col gap-1 overflow-x-hidden">
              {categories.map((cat, idx) => {
                const catName = typeof cat === "string" ? cat : cat?.name || "";
                const catKey =
                  typeof cat === "string"
                    ? cat
                    : cat?.id || cat?.name || `cat-${idx}`;
                if (!catName) return null;

                const isActive =
                  (activeCategory || "").toLowerCase() === catName.toLowerCase();
                const isExpanded =
                  (expandedCategory || "").toLowerCase() === catName.toLowerCase();
                const catItems = (menuItems || []).filter(
                  (i) => (i.category || "").toLowerCase() === catName.toLowerCase()
                );

                return (
                  <div key={catKey} className="overflow-x-hidden">
                    <button
                      type="button"
                      className={`flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer transition-all duration-200 border-none text-left font-['Oswald',sans-serif] uppercase text-sm ${
                        isActive
                          ? "bg-amber-400 text-gray-950 font-bold shadow-sm"
                          : "bg-transparent text-gray-700 dark:text-neutral-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800/60 font-medium"
                      }`}
                      onClick={() => scrollToCategory(catName)}
                    >
                      <span className="text-base flex-shrink-0">
                        {getCategoryIcon(catName)}
                      </span>
                      <span className="truncate tracking-wide">{catName}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Dynamic Menu Product Grid Content */}
        <main className="flex-1 min-w-0">
          <MenuContent
            searchTerm={searchTerm}
            searchResults={searchResults}
            categories={categories}
            menuItems={menuItems}
            isExpanded={!isDesktopSidebarVisible}
          />
        </main>
      </div>
    </div>
  );
};

export default MenuPage;