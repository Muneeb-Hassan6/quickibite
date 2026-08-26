import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useTheme } from "../../Context/ThemeContext";
import {
  FaShoppingBag,
  FaSun,
  FaMoon,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaPhoneAlt,
} from "react-icons/fa";

const Header = () => {
  const [cartBounce, setCartBounce] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { orders, cartItems, toggleCart, isCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const prevCartCount = useRef(0);

  const currentPath = location.pathname.toLowerCase();
  const isCheckoutPage = currentPath.includes("/checkout");
  const shouldHideNav =
    isCheckoutPage ||
    currentPath.includes("kitchen") ||
    currentPath.includes("cashier") ||
    currentPath.includes("admin") ||
    currentPath.includes("login");

  // Cart count & animation
  const totalCartQty = (cartItems || []).reduce(
    (sum, item) => sum + (item.qty || 1),
    0
  );

  useEffect(() => {
    if (totalCartQty > prevCartCount.current && prevCartCount.current >= 0) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 500);
      return () => clearTimeout(timer);
    }
    prevCartCount.current = totalCartQty;
  }, [totalCartQty]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Menu", to: "/menu" },
    { label: "Deals", to: "/deals" },
    { label: "Track Order", to: "/track-order" },
    { label: "About Us", to: "/about-us" },
  ];

  const isNavActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  // If on checkout page or staff/admin route, do not render header
  if (shouldHideNav) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full h-14 sm:h-16 z-50 px-4 sm:px-6 transition-all duration-300 backdrop-blur-md bg-white/95 text-zinc-900 border-b border-zinc-200/80 shadow-xs dark:bg-[#0d0d0d]/95 dark:text-white dark:border-white/10 dark:shadow-md flex items-center">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* ═══ LEFT: Clean Typographic Wordmark ═══ */}
        <div
          className="flex items-center cursor-pointer group flex-shrink-0"
          onClick={() => navigate("/")}
        >
          <span className="font-['Oswald',sans-serif] font-black text-2xl sm:text-3xl tracking-wider leading-none text-zinc-950 dark:text-white group-hover:opacity-90 transition-opacity duration-200">
            BIG<span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">BITE</span>
          </span>
        </div>

        {/* ═══ RIGHT: Desktop Nav + Mobile Action Cluster ═══ */}
        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 sm:gap-8 mr-2">
            {[
              { label: "Home", to: "/" },
              { label: "Menu", to: "/menu" },
              { label: "Deals", to: "/deals" },
            ].map((nav) => {
              const active = isNavActive(nav.to);
              return (
                <button
                  key={nav.to}
                  type="button"
                  onClick={() => navigate(nav.to)}
                  className={`text-sm md:text-[15px] font-extrabold uppercase tracking-wider transition-all duration-200 py-1 relative group cursor-pointer bg-transparent border-none ${
                    active
                      ? "text-orange-500 font-bold dark:text-amber-400"
                      : "text-zinc-700 hover:text-orange-500 dark:text-zinc-300 dark:hover:text-amber-400"
                  }`}
                >
                  <span className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
                    {nav.label}
                  </span>
                  <span
                    className={`absolute -bottom-1 left-0 h-[2.5px] bg-orange-500 dark:bg-amber-400 rounded-full transition-all duration-300 ease-out ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative overflow-hidden group w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs"
              aria-label="Toggle theme"
            >
              <span className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              <span className="relative z-10 text-zinc-800 dark:text-zinc-200 group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                {theme === "dark" ? (
                  <FaSun className="text-orange-400 text-xs sm:text-sm group-hover:text-white transition-colors duration-200" />
                ) : (
                  <FaMoon className="text-zinc-700 text-xs sm:text-sm group-hover:text-white transition-colors duration-200" />
                )}
              </span>
            </button>

            {/* Track Order Icon (Desktop only shortcut) */}
            {!shouldHideNav && (
              <button
                type="button"
                onClick={() => navigate("/track-order")}
                className="hidden sm:flex relative overflow-hidden group w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs"
                aria-label="Track orders"
              >
                <span className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10 text-zinc-800 dark:text-zinc-200 group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-xs sm:text-sm group-hover:text-white transition-colors duration-200" />
                </span>
                {orders?.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                )}
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={toggleCart}
              className={`relative overflow-hidden group w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs ${
                cartBounce ? "animate-bounce" : ""
              }`}
              aria-label="Open cart"
            >
              <span className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              <span className="relative z-10 text-orange-500 dark:text-orange-400 group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                <FaShoppingBag className="text-xs sm:text-sm group-hover:text-white transition-colors duration-200" />
              </span>
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border border-white dark:border-neutral-950 z-20 animate-in zoom-in duration-200 leading-none">
                  {totalCartQty}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative overflow-hidden group w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs"
              aria-label="Toggle navigation menu"
            >
              <span className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              <span className="relative z-10 text-zinc-800 dark:text-zinc-200 group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                {mobileMenuOpen ? (
                  <FaTimes className="text-sm text-orange-500 dark:text-orange-400 group-hover:text-white" />
                ) : (
                  <FaBars className="text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-white" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MODERN MOBILE FROSTED GLASS SLIDE DRAWER ═══ */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-2xl border-b border-zinc-200 dark:border-white/10 p-4 sm:p-5 shadow-2xl space-y-2.5 animate-in slide-in-from-top-3 duration-200 z-[100]">
          <div className="space-y-1.5">
            {navItems.map((nav) => {
              const active = isNavActive(nav.to);
              return (
                <button
                  key={nav.to}
                  type="button"
                  onClick={() => {
                    navigate(nav.to);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-['Oswald',sans-serif] font-bold text-base tracking-wide border cursor-pointer transition-all ${
                    active
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-500 dark:bg-amber-400/15 dark:border-amber-400/40 dark:text-amber-400 shadow-sm font-bold"
                      : "bg-zinc-100/70 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-neutral-200 border-zinc-200/80 dark:border-white/5 hover:border-orange-500/30"
                  }`}
                >
                  <span className="uppercase">{nav.label}</span>
                  <FaChevronRight className={`text-xs ${active ? "text-orange-500 dark:text-amber-400" : "text-zinc-400 dark:text-neutral-500"}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Helpline Support Button inside Drawer */}
          <div className="pt-2 border-t border-zinc-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                navigate("/track-order");
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border-none cursor-pointer"
            >
              <FaMapMarkerAlt className="text-xs" />
              <span>Live Order Tracking</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
