import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaShoppingBag,
  FaShieldAlt,
  FaClock,
  FaTruck,
} from "react-icons/fa";
import { useCart } from "../../Context/CartContext";
import { resolveImageUrl } from "../../utils/imageOptimizer";
import heroBurgerImg from "../../assets/products/doublepatty-removebg-preview.png";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeFromCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch dynamic store settings (delivery fee, delivery time)
  const { data: storeSettings = {} } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  const baseDeliveryFee = storeSettings.delivery_fee ? parseFloat(storeSettings.delivery_fee) : 150;
  const estimatedMins = storeSettings.delivery_time || storeSettings.estimated_delivery_time || "30";

  const subTotal = cartItems
    ? cartItems.reduce((acc, item) => acc + parseFloat(item.price || 0) * (item.qty || 1), 0)
    : 0;

  const totalQty = cartItems
    ? cartItems.reduce((acc, item) => acc + (item.qty || 1), 0)
    : 0;

  // ═════════════════════════════════════════════════════════
  // 1. EMPTY CART STATE
  // ═════════════════════════════════════════════════════════
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white px-3.5 sm:px-6 lg:px-8 py-12 sm:py-16 transition-colors duration-300">
        <div className="text-center max-w-lg w-full bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm backdrop-blur-md relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* 3D Illustration */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent rounded-full blur-xl pointer-events-none" />
            <img
              src={heroBurgerImg}
              alt="Empty Cart"
              className="w-full h-full object-contain drop-shadow-md opacity-80"
            />
          </div>

          <h2 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-900 dark:text-white m-0">
            YOUR CART IS HUNGRY!
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-2 mb-6 leading-relaxed">
            Looks like you haven't added anything to your bucket yet. Explore our handcrafted menu to get started.
          </p>

          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <span>Explore Delicious Menu</span>
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════
  // 2. ACTIVE CART VIEW
  // ═════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white transition-colors duration-300 pb-20">
      {/* ── Page Header ── */}
      <section className="relative overflow-hidden pt-6 pb-6 sm:pt-10 sm:pb-8 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1.5">
                <FaShoppingBag className="text-[10px]" />
                <span>REVIEW YOUR BUCKET</span>
              </div>
              <h1 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-neutral-950 dark:text-white m-0">
                SHOPPING{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  CART
                </span>
              </h1>
            </div>

            <div className="text-xs sm:text-sm font-bold text-neutral-500 dark:text-neutral-400 font-['Oswald',sans-serif] uppercase tracking-wider">
              {totalQty} {totalQty === 1 ? "Item" : "Items"} in your order
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Responsive Grid Content ── */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Left Column: Cart Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
            {cartItems.map((item) => {
              const itemPrice = parseFloat(item.price || 0);
              const qty = item.qty || 1;
              const lineTotal = itemPrice * qty;

              const details = [];
              if (item.size && item.size !== "Regular") details.push(`Size: ${item.size}`);
              if (item.items_description) details.push(item.items_description);
              if (item.options) details.push(item.options);
              if (item.instructions) details.push(item.instructions);
              if (item.note) details.push(`Note: "${item.note}"`);

              return (
                <div
                  key={item.cartId || item.id}
                  className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 shadow-sm flex gap-3 sm:gap-5 items-start hover:border-amber-400/40 transition-all duration-300"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-neutral-800/80 p-1.5 sm:p-2 border border-gray-100 dark:border-neutral-700/50 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={resolveImageUrl(item.img || item.image, 250)}
                      alt={item.title || item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/150x150?text=Food";
                      }}
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-['Oswald',sans-serif] font-bold text-sm sm:text-xl text-neutral-900 dark:text-white leading-snug m-0 uppercase truncate">
                          {item.title || item.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">
                          Rs {itemPrice.toLocaleString()} each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartId || item.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all border-none cursor-pointer shrink-0"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>

                    {/* Breakdown details */}
                    {details.length > 0 && (
                      <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed bg-gray-50 dark:bg-neutral-800/50 p-2 sm:p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800 m-0">
                        {details.join(" • ")}
                      </p>
                    )}

                    {/* Bottom row: Line Total & Stepper */}
                    <div className="flex items-center justify-between gap-3 mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-neutral-800/60">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 dark:bg-neutral-800 rounded-xl p-1 border border-gray-200 dark:border-neutral-700">
                        <button
                          type="button"
                          onClick={() => updateQty(item.cartId || item.id, -1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-amber-500 flex items-center justify-center transition-all border-none cursor-pointer text-xs active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="text-[9px]" />
                        </button>
                        <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white min-w-[18px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.cartId || item.id, 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-amber-500 flex items-center justify-center transition-all border-none cursor-pointer text-xs active:scale-90"
                          aria-label="Increase quantity"
                        >
                          <FaPlus className="text-[9px]" />
                        </button>
                      </div>

                      <span className="text-sm sm:text-lg font-black font-['Oswald',sans-serif] text-amber-500 dark:text-amber-400">
                        Rs {lineTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Card (4 Cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-md space-y-4 sm:space-y-5">
              <h2 className="font-['Oswald',sans-serif] font-black text-lg sm:text-xl uppercase tracking-wider text-neutral-900 dark:text-white m-0 pb-2.5 border-b border-gray-100 dark:border-neutral-800">
                Order Summary
              </h2>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 py-1">
                  <span>Subtotal ({totalQty} items)</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    Rs {subTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 py-1">
                  <span className="flex items-center gap-1.5">
                    <FaTruck className="text-xs text-amber-500" />
                    <span>Est. Delivery Fee</span>
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    Rs {baseDeliveryFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 py-1">
                  <span className="flex items-center gap-1.5">
                    <FaClock className="text-xs text-amber-500" />
                    <span>Est. Delivery Time</span>
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {estimatedMins} Mins
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
                  <span className="font-['Oswald',sans-serif] font-bold text-sm sm:text-base uppercase text-neutral-900 dark:text-white">
                    Estimated Total
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] text-amber-500 dark:text-amber-400">
                    Rs {(subTotal + baseDeliveryFee).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span>Proceed to Checkout</span>
                <FaArrowRight className="text-xs" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-semibold text-neutral-400 dark:text-neutral-500 pt-1">
                <FaShieldAlt className="text-amber-500 text-xs" />
                <span>256-bit Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;