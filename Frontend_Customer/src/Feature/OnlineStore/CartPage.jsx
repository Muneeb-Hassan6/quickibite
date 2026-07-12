import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaShoppingBag,
} from "react-icons/fa";
import { useCart } from "../../Context/CartContext";
import { optimizeCloudinaryImage } from "../../utils/imageOptimizer";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeFromCart } = useCart();

  const subTotal = cartItems
    ? cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0)
    : 0;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-[75rem] mx-auto p-[2.5rem_1.25rem] max-lg:p-[1.25rem_0.938rem] text-center flex flex-col items-center bg-[#111] rounded-[1rem] border border-dashed border-[#444] mt-[2.5rem] py-[5rem] animate-slide-up">
        <FaShoppingBag className="text-[3.75rem] text-[#444] mb-[1.25rem]" />
        <h2 className="text-white font-['Oswald',sans-serif]">Your Cart is Empty</h2>
        <p className="text-[#888]">Looks like you haven't added anything to your cart yet.</p>
        <button
          className="w-full max-w-[15.625rem] bg-[var(--brand-red,#ef4444)] text-white border-none p-[1rem] rounded-[0.75rem] font-['Oswald',sans-serif] text-[1.125rem] font-[800] uppercase tracking-[1px] cursor-pointer flex justify-center items-center gap-[0.625rem] mt-[1.25rem] transition-all duration-300 shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:-translate-y-[0.188rem] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)]"
          onClick={() => navigate("/menu")}
        >
          Explore Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[75rem] mx-auto p-[2.5rem_1.25rem] max-lg:p-[1.25rem_0.938rem] animate-slide-up">
      <h2 className="font-['Oswald',sans-serif] text-white text-[2rem] uppercase tracking-[1px] mb-[1.875rem] border-b-[2px] border-[#333] pb-[0.625rem]">Your Cart</h2>

      <div className="flex items-start gap-[2.5rem] max-lg:flex-col max-lg:gap-[1.25rem]">
        {/* LEFT SIDE: CART ITEMS */}
        <div className="flex-[2] flex flex-col gap-[0.937rem]">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-[#141414] border border-[#2a2a2a] rounded-[1rem] p-[0.937rem] flex items-center gap-[1.25rem] transition-all duration-300 hover:border-[#444] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] max-lg:grid max-lg:grid-cols-[4.375rem_1fr_auto] max-lg:[grid-template-areas:'img_details_remove'_'img_controls_price'] max-lg:gap-[0.625rem] max-lg:p-[0.75rem]">
              <img
                src={optimizeCloudinaryImage(item.img || "https://via.placeholder.com/150", 150)}
                alt={item.title}
                className="w-[5rem] h-[5rem] rounded-[0.75rem] object-cover max-lg:[grid-area:img] max-lg:w-[4.375rem] max-lg:h-[4.375rem]"
              />
              <div className="flex-1 max-lg:[grid-area:details]">
                <h4 className="m-[0_0_0.313rem_0] text-[1.125rem] text-white font-['Oswald',sans-serif] tracking-[0.5px] max-lg:text-[0.938rem] max-lg:whitespace-nowrap max-lg:overflow-hidden max-lg:text-ellipsis">{item.title}</h4>
                <p className="m-0 text-[#888] font-bold text-[0.875rem] max-lg:text-[0.75rem]">Rs {item.price}</p>
              </div>
              <div className="flex items-center gap-[0.937rem] bg-[#1a1a1a] border border-[#333] rounded-[1.875rem] p-[0.375rem_0.75rem] max-lg:[grid-area:controls] max-lg:p-[0.251rem_0.625rem] max-lg:gap-[0.625rem] max-lg:w-max">
                <button className="bg-transparent border-none text-[var(--brand-red,#ef4444)] cursor-pointer text-[0.875rem] flex items-center p-[0.313rem]" onClick={() => updateQty && updateQty(item.id, -1)}>
                  <FaMinus />
                </button>
                <span className="font-bold text-white text-[1rem] w-[1.25rem] text-center max-lg:text-[0.875rem]">{item.qty || 1}</span>
                <button className="bg-transparent border-none text-[var(--brand-red,#ef4444)] cursor-pointer text-[0.875rem] flex items-center p-[0.313rem]" onClick={() => updateQty && updateQty(item.id, 1)}>
                  <FaPlus />
                </button>
              </div>
              <div className="font-[900] text-[1.125rem] text-[var(--brand-red,#ef4444)] min-w-[5.625rem] text-right max-lg:[grid-area:price] max-lg:justify-self-end max-lg:text-[0.938rem] max-lg:min-w-0">Rs {item.price * (item.qty || 1)}</div>
              <button
                className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[var(--brand-red,#ef4444)] w-[2.5rem] h-[2.5rem] rounded-[0.625rem] cursor-pointer flex justify-center items-center transition-all duration-300 hover:bg-[var(--brand-red,#ef4444)] hover:text-white max-lg:[grid-area:remove] max-lg:justify-self-end max-lg:w-[2rem] max-lg:h-[2rem] max-lg:p-[0.312rem]"
                onClick={() => removeFromCart && removeFromCart(item.id)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: SUMMARY */}
        <div className="flex-1 bg-[#111] border border-[#333] rounded-[1rem] p-[1.563rem] sticky top-[1.25rem] max-lg:static max-lg:w-full max-lg:box-border">
          <h3 className="mt-0 font-['Oswald',sans-serif] text-[1.375rem] uppercase border-b border-[#333] pb-[0.937rem] text-white">Order Summary</h3>
          <div className="flex justify-between text-[1rem] text-[#aaa] mb-[0.937rem] font-bold">
            <span>Subtotal</span>
            <span>Rs {subTotal}</span>
          </div>
          <div className="border-b border-dashed border-[#444] my-[1.25rem]"></div>
          <div className="flex justify-between text-[1.375rem] text-white mb-[0.937rem] font-bold">
            <span>Total</span>
            <span className="text-[var(--brand-red,#ef4444)]">Rs {subTotal}</span>
          </div>

          <button
            className="w-full bg-[var(--brand-red,#ef4444)] text-white border-none p-[1rem] rounded-[0.75rem] font-['Oswald',sans-serif] text-[1.125rem] font-[800] uppercase tracking-[1px] cursor-pointer flex justify-center items-center gap-[0.625rem] mt-[1.25rem] transition-all duration-300 shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:-translate-y-[0.188rem] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)]"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;