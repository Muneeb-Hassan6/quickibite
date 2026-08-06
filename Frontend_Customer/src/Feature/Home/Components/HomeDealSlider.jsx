import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useCart } from "../../../Context/CartContext"; // Apne path k hisaab se adjust krein
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";
// import "./CustomerDeals.css"; // 🔥 CSS Import

const HomeDealsSlider = () => {
  const [deals, setDeals] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchActiveDeals = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_active_deals.php`,
        );
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setDeals(data.data);
        }
      } catch (error) {
        console.error("Failed to load deals", error);
      }
    };
    fetchActiveDeals();
  }, []);

  const handleAddDealToCart = (deal) => {
    addToCart({
      id: `deal-${deal.id}`,
      title: deal.title,
      price: parseFloat(deal.price),
      qty: 1,
      size: "Deal",
      is_deal: true, // Backend k liay flag
      image: deal.img,
    });

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Deal Added to Cart!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  if (deals.length === 0) return null; // Agar deals na hon toh slider hide hojaye

  return (
    <div className="home-deals-wrapper">
      <div className="deals-section-header">
        <h2 className="deals-section-title">
          🔥 Super Saver <span>Deals</span>
        </h2>
        <button
          className="deals-view-all-btn"
          onClick={() => navigate("/deals")}
        >
          VIEW ALL DEALS
        </button>
      </div>

      <div className="deals-slider-track">
        {deals.map((deal) => (
          <div key={deal.id} className="deal-card">
            <div className="deal-card-img-box">
              <img
                src={optimizeCloudinaryImage(deal.img || "https://placehold.co/400x300", 500)}
                alt={deal.title}
                className="deal-card-img"
              />
              <div className="deal-card-badge">Save Big</div>
            </div>
            <div className="deal-card-body">
              <h3 className="deal-card-title">{deal.title}</h3>
              <div className="deal-card-footer">
                <span className="deal-card-price">Rs {deal.price}</span>
                <button
                  className="deal-add-btn"
                  onClick={() => handleAddDealToCart(deal)}
                >
                  <FaCartPlus /> ADD
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeDealsSlider;
