import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import SearchBar from "./Components/SearchBar";
import MenuContent from "./Components/MenuContent";
import Footer from "../OnlineStore/Components/Footer";
// import "./styles/index.css"; // Removing CSS import as we migrate to Tailwind

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [expandedCategory, setExpandedCategory] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchBoxRef = useRef(null);
  const contentRef = useRef(null);

  // --- API FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const catRes = await fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`);
        const catData = await catRes.json();
        const catNames = Array.isArray(catData) ? catData.map((c) => c.name) : [];
        setCategories(catNames);

        const menuRes = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
        const menuData = await menuRes.json();
        setMenuItems(Array.isArray(menuData) ? menuData.filter(i => i.isAvailable) : []);

        if (catNames.length > 0) {
          setActiveCategory(catNames[0]);
          setExpandedCategory(catNames[0]);
        }
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  // --- HELPER SCROLL FUNCTION ---
  const performScroll = (el, offset = 160) => {
    if (!el) return;
    const isDesktop = window.innerWidth >= 992;
    if (isDesktop && contentRef.current) {
      const container = contentRef.current;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const relativeTop = elRect.top - containerRect.top;
      const targetScroll = container.scrollTop + relativeTop - 70; // 4.375rem offset for sticky search bar inside main content container
      container.scrollTo({
        top: targetScroll,
        behavior: "smooth"
      });
    } else {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: "smooth"
      });
    }
  };

  // --- HANDLE CATEGORY REDIRECT FROM OTHER PAGES ---
  useEffect(() => {
    if (!isLoading && location.state?.category && categories.length > 0) {
      const targetCategory = location.state.category;
      const matchedCat = categories.find(
        (cat) => cat.toLowerCase() === targetCategory.toLowerCase()
      );
      if (matchedCat) {
        setActiveCategory(matchedCat);
        setExpandedCategory(matchedCat);
        setSearchTerm("");

        // Wait a small delay for content to render, then scroll to section
        setTimeout(() => {
          const el = document.getElementById(matchedCat);
          performScroll(el);
        }, 150);

        // Clear location state to prevent scrolling again on page refreshes
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, isLoading, categories, navigate]);

  // --- HANDLE SEARCH QUERY REDIRECT ---
  useEffect(() => {
    if (!isLoading) {
      const params = new URLSearchParams(location.search);
      const searchQuery = params.get("search");
      if (searchQuery) {
        setSearchTerm(searchQuery);
      }
    }
  }, [location.search, isLoading]);

  // --- LOGIC FUNCTIONS ---
  const scrollToCategory = (catName) => {
    setActiveCategory(catName);
    setSearchTerm("");
    setExpandedCategory(expandedCategory === catName ? "" : catName);
    const el = document.getElementById(catName);
    performScroll(el);
  };

  const scrollToProduct = (productName) => {
    setSearchTerm("");
    setIsSidebarOpen(false);
    const el = document.getElementById(`product-${productName}`);
    performScroll(el);
  };

  const searchResults = menuItems.filter(i =>
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center items-center h-[60vh] text-[#ef4444] gap-[0.937rem] font-bold text-[1.125rem] tracking-[1px]"><span>Loading Delicious Food...</span></div>;

  return (
    <div className="bg-[var(--home-bg,#0a0a0c)] min-h-[100vh] pb-[3.125rem] text-[var(--text-main,#fff)] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] lg:h-[calc(100vh-4.75rem)] lg:overflow-hidden lg:flex lg:flex-col">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-[0.313rem] z-[10000] animate-[fadeIn_0.3s_ease]" onClick={() => setIsSidebarOpen(false)}></div>}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        expandedCategory={expandedCategory}
        menuItems={menuItems}
        onCategoryClick={scrollToCategory}
        onProductClick={scrollToProduct}
      />

      <div className="max-w-[84.375rem] mx-auto flex gap-[2.188rem] p-[0.937rem] lg:p-[1.874rem_1.25rem] items-start lg:h-full lg:overflow-hidden w-full box-border">
        <aside className="hidden lg:block">
          <Sidebar
            isDesktop={true}
            categories={categories}
            activeCategory={activeCategory}
            expandedCategory={expandedCategory}
            menuItems={menuItems}
            onCategoryClick={scrollToCategory}
            onProductClick={scrollToProduct}
          />
        </aside>

        <main className="flex-1 w-full lg:h-full lg:overflow-y-auto lg:pr-[0.938rem]" ref={contentRef}>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            searchBoxRef={searchBoxRef}
            onFilterOpen={() => setIsSidebarOpen(true)}
          />

          <MenuContent
            searchTerm={searchTerm}
            searchResults={searchResults}
            categories={categories}
            menuItems={menuItems}
          />

          {/* 4. Footer */}
        <div className="mt-10">
          <Footer />
        </div>
        </main>
      </div>
    </div>
  );
};

export default MenuPage;