import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFire, FaShoppingCart, FaMapMarkerAlt, FaSun, FaMoon, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "../../../Context/CartContext";
import { useTheme } from "../../../Context/ThemeContext";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";

const OnlineNavbar = () => {
  const navigate = useNavigate();
  const { cartItems, toggleCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isMenuPage = location.pathname.toLowerCase() === "/menu";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = React.useRef(null);

  // 🔥 Database se Logo Fetch karna via React Query
  const { data: storeLogo = "" } = useQuery({
    queryKey: ['store_settings_logo'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return (result.success && result.data.store_logo) ? result.data.store_logo : "";
    }
  });

  // Fetch Menu for Dynamic Search via React Query
  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const result = await response.json();
      if (Array.isArray(result)) return result;
      if (result.success && result.data) return result.data;
      return [];
    }
  });

  // Handle outside click for search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchFocused(false);
    if (searchTerm.trim()) {
      navigate(`/menu?search=${searchTerm.trim()}`);
    } else {
      navigate(`/menu`);
    }
  };

  const filteredItems = searchTerm.trim() 
    ? menuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const cartCount = cartItems
    ? cartItems.reduce((total, item) => total + (item.qty || 1), 0)
    : 0;

  return (
    <>
      <header className="sticky top-0 z-[1100] bg-[var(--bg-body,#0a0a0c)] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-5 h-[4.375rem]">
          {/* BRAND LOGO */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            {storeLogo ? (
              <img
                src={optimizeCloudinaryImage(storeLogo, 300)}
                alt="Restaurant Logo"
                className="h-[2.5rem] w-auto"
              />
            ) : (
              <>
                <div className="bg-red-500 text-white p-2 rounded-lg text-lg">
                  <FaFire />
                </div>
                <h1 className="font-['Oswald',sans-serif] text-2xl text-[var(--text-main,#ffffff)] m-0 tracking-wide">
                  Big<span className="text-red-500">Bite</span>
                </h1>
              </>
            )}
          </div>

          {/* DYNAMIC SEARCH BOX - RESPONSIVE (DESKTOP & MOBILE) */}
          {!isMenuPage && (
            <div className="relative hidden md:flex justify-center flex-1 mx-10" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className={`relative flex items-center transition-all duration-300 w-full max-w-[37.5rem] ${isSearchFocused ? 'opacity-100' : 'opacity-70'}`}>
                <FaSearch className={`absolute left-4 text-sm z-10 pointer-events-none transition-colors ${isSearchFocused ? 'text-red-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search your favorite food..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className={`w-full py-2.5 pr-4 pl-10 rounded-full outline-none text-[var(--text-main,#fff)] text-sm transition-all duration-300 ${isSearchFocused ? 'bg-[var(--panel-bg,#141417)] border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                />
              </form>

              {/* Dynamic Search Dropdown */}
              {isSearchFocused && searchTerm.trim() !== "" && (
                <div className="absolute top-[3.438rem] left-1/2 -translate-x-1/2 w-full max-w-[37.5rem] bg-[var(--panel-bg,#111)] border border-[var(--border-color,#333)] rounded-xl max-h-[21.875rem] overflow-y-auto shadow-2xl z-[1000] animate-[slideDown_0.2s_ease-out]">
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-center p-3 border-b border-[var(--border-color,#222)] cursor-pointer transition-colors duration-200 hover:bg-white/5 last:border-b-0"
                        onClick={() => {
                          setSearchTerm("");
                          setIsSearchFocused(false);
                          navigate(`/menu?search=${encodeURIComponent(item.name)}`);
                        }}
                      >
                        <img className="w-12 h-12 rounded-lg object-cover mr-4" src={optimizeCloudinaryImage(item.img, 100)} alt={item.name} />
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium mb-1">{item.name}</span>
                          <span className="text-red-500 text-sm font-bold">Rs {Number(item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">No products found...</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* USER ACTIONS */}
          <div className="flex items-center gap-4 md:gap-5">
            {/* THEME TOGGLE (Hidden on Mobile) */}
            <button
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-color,#333)] text-yellow-500 bg-transparent cursor-pointer transition-colors duration-300 hover:bg-yellow-500/10 hover:border-yellow-500"
              onClick={toggleTheme}
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            {/* TRACK ORDER BUTTON (Hidden on Mobile) */}
            <button
              className="hidden md:flex items-center gap-2 text-[var(--text-main,#fff)] bg-transparent border-none cursor-pointer font-bold text-sm transition-colors duration-300 hover:text-red-500"
              onClick={() => navigate("/track-order")}
            >
              <FaMapMarkerAlt className="text-red-500" />
              <span>Track Order</span>
            </button>

            {/* CART BUTTON */}
            <button 
              className="relative flex items-center text-[var(--text-main,#fff)] bg-transparent border-none cursor-pointer text-xl transition-colors duration-300 hover:text-red-500" 
              onClick={toggleCart}
            >
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[0.625rem] w-[1.125rem] h-[1.125rem] rounded-full flex items-center justify-center border-2 border-[var(--bg-body,#0a0a0c)] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* HAMBURGER MENU (Mobile Only) */}
            <button 
              className="md:hidden text-[var(--text-main,#fff)] bg-transparent border-none text-2xl cursor-pointer hover:text-red-500" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      {/* Render Mobile Sidebar and Overlay using React Portal */}
      {createPortal(
        <>
          {/* MOBILE SIDEBAR OVERLAY */}
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/70 z-[1200] backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          )}

          {/* MOBILE SIDEBAR */}
          <div className={`fixed top-0 right-0 h-full w-[17.5rem] bg-[var(--panel-bg,#141417)] shadow-[-5px_0_20px_rgba(0,0,0,0.5)] z-[1300] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color,#2a2a30)]">
              <h2 className="text-white text-xl font-bold m-0 font-['Oswald',sans-serif] tracking-wider uppercase">Menu</h2>
              <button className="bg-transparent border-none text-gray-400 text-2xl cursor-pointer hover:text-red-500 transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-5">
              {/* Sidebar Track Order */}
              <div 
                className="flex items-center gap-3 text-white text-lg cursor-pointer hover:text-red-500 transition-colors font-medium"
                onClick={() => {
                  setIsSidebarOpen(false);
                  navigate("/track-order");
                }}
              >
                <FaMapMarkerAlt className="text-red-500 text-xl" />
                <span>Track Order</span>
              </div>
              
              {/* Sidebar Theme Toggle */}
              <div 
                className="flex items-center gap-3 text-white text-lg cursor-pointer hover:text-yellow-500 transition-colors font-medium"
                onClick={() => {
                  toggleTheme();
                }}
              >
                {theme === "dark" ? <FaSun className="text-yellow-500 text-xl" /> : <FaMoon className="text-yellow-500 text-xl" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default OnlineNavbar;
