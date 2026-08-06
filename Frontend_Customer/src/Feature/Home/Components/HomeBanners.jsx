import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomeBanners.css";

const HomeBanners = () => {
  const navigate = useNavigate();

  // Mock banners data. You can replace images with your actual cloudinary URLs later.
  const banners = [
    {
      id: 1,
      title: "Midnight Craving Deal",
      subtitle: "Flat 30% OFF on all Burgers!",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
      btnText: "Order Now",
      link: "/menu"
    },
    {
      id: 2,
      title: "Family Combo Fiesta",
      subtitle: "Get a free drink with every family platter.",
      image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1200&auto=format&fit=crop",
      btnText: "Explore Combos",
      link: "/deals"
    }
  ];

  return (
    <div className="home-banners-container">
      {banners.map((banner) => (
        <div 
          key={banner.id} 
          className="promo-banner-card"
          style={{ backgroundImage: `url(${banner.image})` }}
        >
          <div className="banner-overlay">
            <div className="banner-content">
              <h2 className="banner-title">{banner.title}</h2>
              <p className="banner-subtitle">{banner.subtitle}</p>
              <button 
                className="banner-action-btn"
                onClick={() => navigate(banner.link)}
              >
                {banner.btnText}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeBanners;
