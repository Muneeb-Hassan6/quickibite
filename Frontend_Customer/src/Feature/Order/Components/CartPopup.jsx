import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../Context/CartContext";
import { resolveImageUrl } from "../../../utils/imageOptimizer";
import heroBurgerImg from "../../../assets/products/doublepatty-removebg-preview.png";
import {
  FaTimes,
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa";

const CartPopup = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    toggleCart,
    cartItems,
    removeFromCart,
    updateQty,
  } = useCart();

  // Lock body background scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.removeProperty("overflow");
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.removeProperty("overflow");
    };
  }, [isCartOpen]);

  const totalAmount = cartItems.reduce(
    (total, item) => total + parseFloat(item.price || 0) * (item.qty || 1),
    0
  );

  const totalQty = cartItems.reduce(
    (total, item) => total + (item.qty || 1),
    0
  );

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      {/* ═══ 1. BACKDROP WITH SMOOTH FADE (Over navbar) ═══ */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-md z-[99999] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCart}
      />

      {/* ═══ 2. DRAWER CONTAINER (Full-width on mobile, max-w-md on sm+) ═══ */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white dark:bg-neutral-950 border-l border-gray-200/80 dark:border-white/10 shadow-2xl z-[100000] flex flex-col justify-between transform transition-transform duration-300 ease-out pointer-events-auto ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleCart}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
              aria-label="Close cart"
            >
              <FaTimes className="text-xs" />
            </button>
            <h2 className="font-['Oswald',sans-serif] font-black text-lg sm:text-xl uppercase tracking-wider text-neutral-900 dark:text-white m-0">
              MY BUCKET
            </h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 font-['Oswald',sans-serif]">
            {totalQty} {totalQty === 1 ? "ITEM" : "ITEMS"}
          </span>
        </div>

        {/* ── CART ITEM LIST ── */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-3 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 select-none">
              {/* 3D Animated Illustration */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 flex items-center justify-center">
                <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent rounded-full blur-xl pointer-events-none" />
                <img
                  src={heroBurgerImg}
                  alt="Empty Cart"
                  className="w-full h-full object-contain drop-shadow-md opacity-85 hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h3 className="font-['Oswald',sans-serif] font-black text-lg sm:text-xl uppercase tracking-tight text-neutral-900 dark:text-white mb-1 m-0">
                YOUR CART IS HUNGRY!
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[220px] mb-5 mt-1 leading-relaxed">
                Add mouth-watering burgers, pizzas, or hot crispy deals to fill it up.
              </p>
              <button
                type="button"
                onClick={() => {
                  toggleCart();
                  navigate("/menu");
                }}
                className="px-5 py-2.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all border-none cursor-pointer"
              >
                Explore Delicious Menu
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemPrice = parseFloat(item.price || 0);
              const qty = item.qty || 1;
              const lineTotal = itemPrice * qty;

              // Extract extra details (size, note, options, instructions, items_description)
              const details = [];
              if (item.size && item.size !== "Regular") details.push(`Size: ${item.size}`);
              if (item.items_description) details.push(item.items_description);
              if (item.options) details.push(item.options);
              if (item.instructions) details.push(item.instructions);
              if (item.note) details.push(`Note: "${item.note}"`);

              return (
                <div
                  key={item.cartId || item.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/90 dark:bg-neutral-900/90 border border-gray-200/70 dark:border-white/10 flex gap-3 items-start relative group transition-all duration-200 hover:border-amber-400/40 hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white dark:bg-neutral-800/60 p-1 border border-gray-100 dark:border-neutral-700/50 shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
                    <img
                      src={resolveImageUrl(item.img || item.image, 200)}
                      alt={item.title || item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/100x100?text=Food";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="font-['Oswald',sans-serif] font-bold text-sm sm:text-base text-neutral-900 dark:text-white leading-snug m-0 uppercase truncate">
                        {item.title || item.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartId || item.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-0.5 border-none bg-transparent cursor-pointer shrink-0"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>

                    {/* Details breakdown */}
                    {details.length > 0 && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed break-words m-0 line-clamp-2">
                        {details.join(" • ")}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-gray-100 dark:border-neutral-800/60">
                      <span className="text-sm sm:text-base font-black text-amber-500 dark:text-amber-400 font-['Oswald',sans-serif]">
                        Rs {lineTotal.toLocaleString()}
                      </span>

                      {/* Stepper (+ / -) */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 rounded-lg p-0.5 border border-gray-200 dark:border-neutral-700">
                        <button
                          type="button"
                          onClick={() => updateQty(item.cartId || item.id, -1)}
                          className="w-6 h-6 rounded-md bg-gray-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-amber-500 flex items-center justify-center transition-all border-none cursor-pointer text-xs active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="text-[8px]" />
                        </button>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white min-w-[14px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.cartId || item.id, 1)}
                          className="w-6 h-6 rounded-md bg-gray-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-amber-500 flex items-center justify-center transition-all border-none cursor-pointer text-xs active:scale-90"
                          aria-label="Increase quantity"
                        >
                          <FaPlus className="text-[8px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── STICKY PINNED FOOTER & PROCEED CTA ── */}
        {cartItems.length > 0 && (
          <div className="p-3.5 sm:p-5 border-t border-gray-200/80 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md space-y-3 shrink-0">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
                <span>Subtotal ({totalQty} items)</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  Rs {totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
                <span>Delivery & Taxes</span>
                <span className="font-semibold text-amber-500 dark:text-amber-400">Calculated at Checkout</span>
              </div>
              <div className="pt-1.5 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
                <span className="font-['Oswald',sans-serif] font-bold text-xs sm:text-sm uppercase text-neutral-900 dark:text-white">
                  Estimated Total
                </span>
                <span className="text-lg sm:text-xl font-black font-['Oswald',sans-serif] text-amber-500 dark:text-amber-400">
                  Rs {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                toggleCart();
                navigate("/checkout");
              }}
              className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span>Proceed to Checkout</span>
              <FaArrowRight className="text-xs" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">
              <FaShieldAlt className="text-amber-500 text-[10px]" />
              <span>Safe & Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;
