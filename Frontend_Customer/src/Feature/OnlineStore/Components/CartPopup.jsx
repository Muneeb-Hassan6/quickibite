import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../Context/CartContext";
import { FaTimes } from "react-icons/fa";
import CartDrawerItemList from "./CartDrawerItemList";
import CartDrawerCheckoutFooter from "./CartDrawerCheckoutFooter";

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
      {/* 1. Backdrop */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-md z-[99999] transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCart}
      />

      {/* 2. Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white dark:bg-neutral-950 border-l border-gray-200/80 dark:border-white/10 shadow-2xl z-[100000] flex flex-col justify-between transform transition-transform duration-300 ease-out pointer-events-auto ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-3 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          <CartDrawerItemList
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateQty={updateQty}
            toggleCart={toggleCart}
            navigate={navigate}
          />
        </div>

        {/* Sticky Pinned Footer */}
        {cartItems.length > 0 && (
          <CartDrawerCheckoutFooter
            totalQty={totalQty}
            totalAmount={totalAmount}
            toggleCart={toggleCart}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

export default CartPopup;
