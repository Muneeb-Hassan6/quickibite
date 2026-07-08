import React, { useState, useEffect } from "react";
import { FaCartPlus, FaFire, FaPercentage } from "react-icons/fa";
import Swal from "sweetalert2";
import { useCart } from "../../../Context/CartContext";

// 🔥 Yahan hum ne ProductCard ki CSS link kar di hai taake same styling apply ho
import "../../../Components/UI/ProductCard.css";
// import "./DealsPage.css";

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // ==========================================
  // ⚙️ BACKEND API & LOGIC (100% UNTOUCHED)
  // ==========================================
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAllDeals = async () => {
      try {
        const [menuRes, combosRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`),
          fetch(`${import.meta.env.VITE_API_BASE}/get_active_deals.php`),
        ]);

        const menuData = await menuRes.json();
        const combosData = await combosRes.json();

        let combinedDeals = [];

        if (Array.isArray(menuData)) {
          const menuTopDeals = menuData.filter(
            (item) => item.isTopDeal === true && item.isAvailable === true,
          );
          combinedDeals = [...combinedDeals, ...menuTopDeals];
        }

        if (combosData.success && combosData.data) {
          const formattedCombos = combosData.data.map((deal) => ({
            id: deal.id,
            title: deal.title,
            price: deal.price,
            img: deal.img,
            is_deal: true,
            items_description: deal.items_description,
            is_permanent: deal.is_permanent,
          }));
          combinedDeals = [...combinedDeals, ...formattedCombos];
        }

        setDeals(combinedDeals);
      } catch (error) {
        console.error("Deals Page: Fetch error", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDeals();
  }, []);

  const handleAddDealToCart = (deal) => {
    addToCart({
      id: deal.is_deal ? `combo-${deal.id}` : deal.id,
      title: deal.title || deal.name,
      price: parseFloat(deal.price),
      qty: 1,
      size: deal.is_deal ? "Combo" : "Regular",
      is_deal: deal.is_deal || false,
      image: deal.img || deal.image,
      note: deal.items_description
        ? `Items: ${deal.items_description}`
        : deal.is_deal
          ? "Combo Deal"
          : "",
    });

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Added to Cart!",
      showConfirmButton: false,
      timer: 1500,
      background: "#141414",
      color: "#fff",
    });
  };

  // ==========================================
  // 🎨 UPDATED HTML STRUCTURE (KFC STYLE)
  // ==========================================
  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <div className="deals-page-wrapper">
        <div
          className="deals-page-header"
          style={{
            textAlign: "center",
            marginBottom: "40px",
            marginTop: "20px",
          }}
        >
          <h1
            className="deals-page-title"
            style={{ fontSize: "36px", color: "#fff", fontWeight: "900" }}
          >
            <FaPercentage color="#ef4444" /> EXCLUSIVE{" "}
            <span style={{ color: "#ef4444" }}>DEALS</span>
          </h1>
          <p style={{ color: "#888", fontSize: "16px" }}>
            Grab your favorite combos and top deals before they're gone!
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div className="dot-loader">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        ) : deals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <FaFire size={50} color="#333" />
            <h3 style={{ color: "#555", marginTop: "15px" }}>
              No active deals right now. Check back soon!
            </h3>
          </div>
        ) : (
          <div className="cards-grid-container" style={{ padding: "0 15px" }}>
            {/* 🔥 Comment ko theek jagah (div ke andar) shift kar diya hai */}
            {deals.map((deal, index) => (
              <div key={index} className="custom-card animate-slide-up">

                {/* 📸 IMAGE CONTAINER */}
                <div className="card-img-container">
                  <div className="card-badges-wrapper">
                    {deal.is_deal && !deal.is_permanent ? (
                      <span className="badge-top-deal">Limited Time</span>
                    ) : (
                      <span className="badge-top-deal">Top Deal</span>
                    )}
                  </div>
                  <img
                    src={
                      deal.img ||
                      deal.image ||
                      "https://placehold.co/400x300?text=Delicious+Deal"
                    }
                    alt={deal.title || deal.name}
                    className="card-img-fluid"
                  />
                </div>

                {/* 📝 CARD BODY */}
                <div className="card-body custom-card-body">
                  <h5 className="card-title-text">{deal.title || deal.name}</h5>
                  <p className="card-desc-text d-none d-md-block">
                    {deal.items_description || "Grab this amazing deal before it's gone!"}
                  </p>

                  {/* 💰 PRICE & BUTTON ROW */}
                  <div className="price-action-row">
                    <span className="desktop-price">
                      <small>Rs</small> {deal.price}
                    </span>
                    <button
                      className="btn-kfc-add"
                      onClick={() => handleAddDealToCart(deal)}
                    >
                      <FaCartPlus className="add-icon" />{" "}
                      <span className="add-text">Add</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;