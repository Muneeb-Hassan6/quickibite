import React, { useState, useEffect } from "react";
import { FaCartPlus, FaFire } from "react-icons/fa";
import Swal from "sweetalert2";
import { useCart } from "../../../Context/CartContext";
import OnlineNavbar from "../components/OnlineNavbar"; // Apne path k hisaab se theek karein
// import "./CustomerDeals.css"; // 🔥 CSS Import

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    // Scroll to top jab page khulay
    window.scrollTo(0, 0);

    const fetchActiveDeals = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_active_deals.php`,
        );
        const data = await response.json();
        if (data.success) {
          setDeals(data.data);
        }
      } catch (error) {
        console.error("Failed to load deals", error);
      } finally {
        setIsLoading(false);
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
      is_deal: true,
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

  return (
    <>
      <OnlineNavbar />

      <div className="deals-page-wrapper">
        <h1 className="deals-page-title">
          <FaFire color="#ef4444" /> EXCLUSIVE BUNDLES & DEALS
        </h1>

        {isLoading ? (
          <h3 style={{ color: "#fff", textAlign: "center" }}>
            Loading amazing deals...
          </h3>
        ) : deals.length === 0 ? (
          <h3 style={{ color: "#aaa", textAlign: "center" }}>
            No active deals at the moment. Check back later!
          </h3>
        ) : (
          <div className="deals-grid-layout">
            {deals.map((deal) => (
              <div key={deal.id} className="deal-card animate-slide-up">
                <div className="deal-card-img-box">
                  <img
                    src={deal.img || "https://placehold.co/400x300"}
                    alt={deal.title}
                    className="deal-card-img"
                  />
                  <div className="deal-card-badge">Limited Time</div>
                </div>
                <div className="deal-card-body">
                  <h3 className="deal-card-title">{deal.title}</h3>
                  <div className="deal-card-footer">
                    <span className="deal-card-price">Rs {deal.price}</span>
                    <button
                      className="deal-add-btn"
                      onClick={() => handleAddDealToCart(deal)}
                    >
                      <FaCartPlus /> ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DealsPage;
