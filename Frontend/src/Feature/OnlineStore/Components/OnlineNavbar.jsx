import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFire, FaShoppingCart, FaMapMarkerAlt, FaSun, FaMoon, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "../../../Context/CartContext";
import { useTheme } from "../../../Context/ThemeContext";
import "../../../Components/Layout/header.css";

const OnlineNavbar = () => {
  const navigate = useNavigate();
  const { cartItems, toggleCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isMenuPage = location.pathname.toLowerCase() === "/menu";

  // 🔥 Logo State
  const [storeLogo, setStoreLogo] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = React.useRef(null);

  // 🔥 Database se Logo Fetch karna
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_settings.php`,
        );
        const result = await response.json();

        if (result.success && result.data.store_logo) {
          setStoreLogo(result.data.store_logo);
        }
      } catch (error) {
        console.error("Online Navbar: Failed to load logo", error);
      }
    };
    fetchLogo();
  }, []);

  // Fetch Menu for Dynamic Search
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
        const result = await response.json();
        if (Array.isArray(result)) {
          setMenuItems(result);
        } else if (result.success && result.data) {
          // Just in case backend changes to standard format
          setMenuItems(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch menu for search", err);
      }
    };
    fetchMenu();
  }, []);

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
      <header className="main-navbar-header">
        <div className="main-navbar-container">
        {/* BRAND LOGO */}
        <div className="main-nav-brand" onClick={() => navigate("/")}>
          {/* 🔥 Dynamic Logo Logic */}
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="Restaurant Logo"
              className="online-nav-logo"
            />
          ) : (
            <>
              <div className="main-brand-icon">
                <FaFire />
              </div>
              <h1>
                Big<span>Bite</span>
              </h1>
            </>
          )}
        </div>

        {/* DYNAMIC SEARCH BOX - RESPONSIVE (DESKTOP & MOBILE) */}
        {!isMenuPage && (
          <div className="header-search-box" ref={searchRef} style={{flex: 1, margin: "0 40px", display: "flex", justifyContent: "center", position: "relative"}}>
            <form onSubmit={handleSearchSubmit} className={`dynamic-search-form ${isSearchFocused ? 'active' : 'dull'}`} style={{width: "100%", maxWidth: "600px"}}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search your favorite food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                style={{width: "100%"}}
              />
            </form>

            {/* Dynamic Search Dropdown */}
            {isSearchFocused && searchTerm.trim() !== "" && (
              <div className="dynamic-search-dropdown" style={{top: "55px", width: "100%", maxWidth: "600px", left: "50%", transform: "translateX(-50%)"}}>
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <div 
                      key={item.id} 
                      className="search-dropdown-item"
                      onClick={() => {
                        setSearchTerm("");
                        setIsSearchFocused(false);
                        navigate(`/menu?search=${encodeURIComponent(item.name)}`);
                      }}
                    >
                      <img src={item.img} alt={item.name} />
                      <div className="item-details">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">Rs {Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="search-dropdown-empty">No products found...</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* USER ACTIONS */}
        <div className="main-nav-actions">
          {/* THEME TOGGLE (Hidden on Mobile) */}
          <button
            className="theme-toggle-btn desktop-only"
            onClick={toggleTheme}
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>

          {/* TRACK ORDER BUTTON (Hidden on Mobile) */}
          <button
            className="nav-action-btn track-btn desktop-only"
            onClick={() => navigate("/track-order")}
          >
            <FaMapMarkerAlt className="nav-icon-red" />
            <span>Track Order</span>
          </button>

          {/* CART BUTTON */}
          <button className="nav-action-btn cart-btn" onClick={toggleCart}>
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="nav-cart-badge">{cartCount}</span>
            )}
          </button>
          
          {/* HAMBURGER MENU (Mobile Only) */}
          <button className="mobile-hamburger-btn mobile-only" onClick={() => setIsSidebarOpen(true)}>
            <FaBars />
          </button>
        </div>
        </div>
      </header>

      {/* Render Mobile Sidebar and Overlay using React Portal to guarantee top z-index */}
      {createPortal(
        <>
          {/* MOBILE SIDEBAR OVERLAY */}
          {isSidebarOpen && (
            <div className="navbar-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
          )}

          {/* MOBILE SIDEBAR */}
          <div className={`mobile-sidebar ${isSidebarOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <h2>Menu</h2>
              <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="sidebar-links">
              {/* Sidebar Track Order */}
              <div 
                className="sidebar-link-item"
                onClick={() => {
                  setIsSidebarOpen(false);
                  navigate("/track-order");
                }}
              >
                <FaMapMarkerAlt className="sidebar-icon-red" />
                <span>Track Order</span>
              </div>
              
              {/* Sidebar Theme Toggle */}
              <div 
                className="sidebar-link-item"
                onClick={() => {
                  toggleTheme();
                }}
              >
                {theme === "dark" ? <FaSun className="sidebar-icon-yellow" /> : <FaMoon className="sidebar-icon-yellow" />}
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
