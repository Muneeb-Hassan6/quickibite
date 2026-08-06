import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./header.css";
import OrderTracking from "../../Feature/Order/Components/OrderTracker";
import { useCart } from "../../Context/CartContext";

// 🔥 Bolt ki jagah FaFire import kiya
import { FaBox, FaSearch, FaFire } from "react-icons/fa";

const Header = () => {
  const [showOrders, setShowOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useCart();
  const searchRef = useRef(null);

  const [menuItems, setMenuItems] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isMenuPage = location.pathname.toLowerCase().includes("menu");

  const currentPath = location.pathname.toLowerCase();
  const shouldHideIcon =
    currentPath.includes("kitchen") ||
    currentPath.includes("cashier") ||
    currentPath.includes("admin") ||
    currentPath.includes("login");

  useEffect(() => {
    if (isMenuPage) {
      const params = new URLSearchParams(location.search);
      setSearchTerm(params.get("search") || "");
    } else {
      setSearchTerm("");
    }
  }, [location.search, isMenuPage]);

  // Fetch Menu for Dynamic Search
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
        const result = await response.json();
        if (result.success && result.data) {
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

  return (
    <>
      <header className="main-header-wrapper">
        <div className="header-container">
          <div className="top-nav">
            {/* 1. LEFT SECTION (Logo with Fire Icon) */}
            <div className="left-section-wrapper">
              <div className="logo-section" onClick={() => navigate("/")}>
                <div className="logo-icon animated-logo">
                  <FaFire /> {/* 🔥 Yahan Fire Icon laga diya */}
                </div>
                <div className="logo-text">
                  <h1>
                    Big<span>Bite</span>
                  </h1>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE SECTION (Dynamic Search) */}
            <div className="header-search-box desktop-only" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className={`dynamic-search-form ${isSearchFocused ? 'active' : 'dull'}`}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search your favorite food..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                />
              </form>

              {/* Dynamic Search Dropdown */}
              {isSearchFocused && searchTerm.trim() !== "" && (
                <div className="dynamic-search-dropdown">
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

            {/* 3. RIGHT SECTION */}
            <div className="right-section-wrapper">
              <div className="right-actions">
                {!shouldHideIcon && (
                  <div
                    className="header-icon"
                    onClick={() => setShowOrders(true)}
                    title="Live Tracking"
                  >
                    <FaBox />
                    {orders?.length > 0 && (
                      <span className="order-badge">{orders.length}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. MOBILE SEARCH ROW */}
          {isMenuPage && (
            <div className="mobile-search-row">
              <form onSubmit={handleSearchSubmit}>
                <FaSearch className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Search item or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
          )}
        </div>
      </header>

      <OrderTracking isOpen={showOrders} onClose={() => setShowOrders(false)} />
    </>
  );
};

export default Header;
