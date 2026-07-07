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

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeFromCart } = useCart();

  const subTotal = cartItems
    ? cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0)
    : 0;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="store-page-container empty-cart-container animate-slide-up">
        <FaShoppingBag className="empty-cart-icon" />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button
          className="btn-checkout btn-explore"
          onClick={() => navigate("/menu")}
        >
          Explore Menu
        </button>
      </div>
    );
  }

  return (
    <div className="store-page-container animate-slide-up">
      <h2 className="store-page-title">Your Cart</h2>

      <div className="cart-layout">
        {/* LEFT SIDE: CART ITEMS */}
        <div className="cart-items-section">
          {cartItems.map((item) => (
            <div key={item.id} className="web-cart-item">
              <img
                src={item.img || "https://via.placeholder.com/150"}
                alt={item.title}
                className="wci-img"
              />
              <div className="wci-details">
                <h4>{item.title}</h4>
                <p>Rs {item.price}</p>
              </div>
              <div className="wci-qty-controls">
                <button onClick={() => updateQty && updateQty(item.id, -1)}>
                  <FaMinus />
                </button>
                <span>{item.qty || 1}</span>
                <button onClick={() => updateQty && updateQty(item.id, 1)}>
                  <FaPlus />
                </button>
              </div>
              <div className="wci-price">Rs {item.price * (item.qty || 1)}</div>
              <button
                className="wci-remove"
                onClick={() => removeFromCart && removeFromCart(item.id)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: SUMMARY */}
        <div className="cart-summary-section">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs {subTotal}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span className="text-red">Rs {subTotal}</span>
          </div>

          <button
            className="btn-checkout"
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