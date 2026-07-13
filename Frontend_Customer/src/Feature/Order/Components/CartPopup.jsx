import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../Context/CartContext";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";
import {
  FaTimes,
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaArrowLeft,
  FaUtensils,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const CartPopup = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    toggleCart,
    cartItems,
    removeFromCart,
    updateQty,
    placeOrder,
  } = useCart();
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (cartId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [cartId]: !prev[cartId],
    }));
  };

  if (!isCartOpen) return null;

  const totalAmount = cartItems.reduce(
    (total, item) => total + parseFloat(item.price) * (item.qty || 1),
    0,
  );

  const confirmOrder = () => {
    placeOrder();
    setShowConfirm(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] bg-[rgba(0,0,0,0.8)] backdrop-blur-[0.313rem] z-[10000] flex justify-end animate-fade-in" onClick={toggleCart}>
      <div className="w-full max-w-[26.25rem] max-md:w-[82%] h-[100dvh] bg-[var(--panel-bg,#0a0a0a)] shadow-[-10px_0_50px_rgba(0,0,0,0.9)] flex flex-col animate-slide-in-right border-l border-[var(--border-color)]" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="bg-[var(--bg-body,#141414)] border-b border-[var(--border-color)] p-[1.25rem] flex justify-between items-center z-10">
          <div className="flex items-center gap-[0.937rem]">
            <div className="w-[2.188rem] h-[2.188rem] bg-[#222] rounded-full flex justify-center items-center cursor-pointer border border-[#444] transition-all duration-300 text-[var(--text-main)] hover:bg-[var(--brand-red)] hover:text-white hover:border-[var(--brand-red)]" onClick={toggleCart}>
              <FaArrowLeft size={16} />
            </div>
            <h5 className="flex items-center gap-[0.625rem] text-white m-0 font-['Oswald',sans-serif] tracking-[1px] text-[1.25rem] font-[800]">
              <FaShoppingCart className="text-[var(--brand-red)]" /> My Order
            </h5>
          </div>
          <div className="bg-[var(--brand-red)] text-white p-[0.25rem_0.75rem] rounded-[1.25rem] text-[0.812rem] font-bold">{cartItems.length} Items</div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-[0.937rem] bg-[var(--panel-bg,#0a0a0a)] [&::-webkit-scrollbar]:w-[0.313rem] [&::-webkit-scrollbar-thumb]:bg-[var(--border-color)] [&::-webkit-scrollbar-thumb]:rounded-[0.625rem]">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#aaa]">
              <FaUtensils className="text-[2.5rem] opacity-50 mb-[0.937rem]" />
              <p className="text-[1.125rem] m-0">Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.cartId} 
                className={`flex items-start bg-[var(--bg-body,#141414)] border border-[var(--border-color)] rounded-[1rem] p-[0.75rem] mb-[0.937rem] shadow-[0_4px_15px_rgba(0,0,0,0.4)] max-md:p-[0.75rem_2.501rem_2.813rem_0.75rem] max-md:relative max-md:cursor-pointer group ${expandedItems[item.cartId] ? "expanded" : ""}`}
                onClick={() => toggleExpand(item.cartId)}
              >
                <div className="shrink-0 mr-[0.75rem] max-md:mr-[0.625rem]">
                  <img
                    src={optimizeCloudinaryImage(item.img || item.image, 200)}
                    alt={item.title}
                    className="w-[4.688rem] h-[4.688rem] object-cover rounded-[0.75rem] max-md:w-[3.437rem] max-md:h-[3.437rem] max-md:rounded-[0.5rem]"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center gap-[0.25rem] max-md:gap-[2px]">
                  <div className="flex justify-between items-start gap-[0.313rem]">
                    <h6 className="text-[1rem] font-[800] text-[var(--text-main)] m-0 leading-[1.2] max-md:text-[0.875rem] max-md:pr-[0.625rem]">{item.title}</h6>
                    {((item.size && item.size !== "Regular") || item.note) && (
                      <div className="text-[var(--brand-red)] cursor-pointer text-[0.875rem] p-[2px] hidden max-md:block max-md:absolute max-md:bottom-[0.5rem] max-md:right-[0.75rem]" onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.cartId);
                      }}>
                        {expandedItems[item.cartId] ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    )}
                  </div>

                  {((item.size && item.size !== "Regular") || item.note) && (
                    <div className="text-[0.75rem] text-[#aaaaaa] mt-[2px] mb-[0.25rem] max-md:hidden max-md:mb-[0.312rem] group-[.expanded]:max-md:block animate-slide-down">
                      {item.size && item.size !== "Regular" && (
                        <div>
                          <span>Size:</span> {item.size}
                        </div>
                      )}
                      {item.note && (
                        <div className="italic leading-[1.2]">
                          <span>Note:</span> "{item.note}"
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-[0.5rem] mt-[0.25rem] whitespace-nowrap">
                    <span className="text-[var(--brand-red)] font-[800] text-[0.937rem] max-md:text-[0.875rem]">
                      Rs. {item.price * (item.qty || 1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end h-[4.688rem] ml-[0.625rem] max-md:block max-md:m-0 max-md:h-auto">
                  <FaTrash
                    className="text-[1rem] text-[var(--brand-red)] cursor-pointer transition-transform duration-200 hover:scale-110 max-md:absolute max-md:top-[50%] max-md:right-[0.938rem] max-md:-translate-y-1/2 max-md:m-0 hover:max-md:-translate-y-1/2 hover:max-md:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.cartId);
                    }}
                  />
                  <div className="bg-[#222] border border-[#444] rounded-[3.125rem] p-[0.25rem] flex items-center min-w-[5.625rem] justify-between max-md:absolute max-md:bottom-[0.625rem] max-md:left-[4.812rem] max-md:min-w-[4.375rem] max-md:p-[2px] max-md:mt-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="w-[1.5rem] h-[1.5rem] bg-transparent border-none text-white cursor-pointer flex items-center justify-center transition-transform duration-200 hover:text-[var(--brand-red)] hover:scale-125 max-md:w-[1.25rem] max-md:h-[1.25rem]"
                      onClick={() => updateQty(item.cartId, -1)}
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="text-[0.937rem] font-[800] text-white text-center max-md:text-[0.75rem]">{item.qty || 1}</span>
                    <button
                      className="w-[1.5rem] h-[1.5rem] bg-transparent border-none text-white cursor-pointer flex items-center justify-center transition-transform duration-200 hover:text-[var(--brand-red)] hover:scale-125 max-md:w-[1.25rem] max-md:h-[1.25rem]"
                      onClick={() => updateQty(item.cartId, 1)}
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className="bg-[var(--bg-body,#141414)] p-[1.25rem] border-t border-[var(--border-color)] shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between mb-[0.937rem]">
              <span className="text-[var(--text-main)] text-[1.125rem] font-bold">Total Amount</span>
              <span className="text-[var(--brand-yellow)] text-[1.25rem] font-[900]">Rs. {totalAmount}</span>
            </div>
            <button
              className="bg-[var(--brand-red)] text-white border-none w-full p-[0.875rem] rounded-[0.75rem] font-[900] text-[1rem] cursor-pointer transition-all duration-300 hover:bg-[#c62828] hover:-translate-y-[2px]"
              onClick={() => {
                toggleCart();
                navigate("/checkout");
              }}
            >
              CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;
