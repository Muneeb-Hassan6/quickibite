import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "../../Context/CartContext";
import { FaPlus } from "react-icons/fa";
import PopupCard from "./PopupCard";
import { optimizeCloudinaryImage } from "../../utils/imageOptimizer";
import "./ProductCard.css"; // 🔥 Separate CSS link

const ProductCard = ({
  image,
  title,
  description,
  price,
  item,
  isTopDeal,
  isBestSeller,
}) => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const finalTitle = title || item?.name || "Delicious Item";
  const finalDesc =
    description ||
    item?.desc ||
    "Spicy, crunchy, and freshly prepared for you.";
  const finalPrice = price || item?.price || 0;
  const finalImageRaw =
    image || item?.img || "https://placehold.co/600x400?text=No+Image";
  const finalImage = optimizeCloudinaryImage(finalImageRaw, 500);

  const openPopup = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closePopup = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <>
      <div className="custom-card" onClick={openPopup}>
        {/* 📸 IMAGE CONTAINER (KFC STYLE) */}
        <div className="card-img-container">
          <div className="card-badges-wrapper">
            {isTopDeal && <span className="badge-top-deal">Top Deal</span>}
            {isBestSeller && <span className="badge-best-seller">Best Seller</span>}
          </div>
          <img src={finalImage} alt={finalTitle} className="card-img-fluid" />
        </div>

        {/* 📝 CARD DETAILS */}
        <div className="card-body custom-card-body">
          <h5 className="card-title-text">{finalTitle}</h5>
          <p className="card-desc-text d-none d-md-block">{finalDesc}</p>

          {/* 💰 PRICE & ADD BUTTON IN ONE ROW */}
          <div className="price-action-row">
            <span className="desktop-price">
              <small>Rs</small> {finalPrice}
            </span>
            <button
              className="btn-kfc-add"
              onClick={(e) => {
                e.stopPropagation();
                openPopup();
              }}
            >
              <FaPlus className="add-icon" /> <span className="add-text">Add</span>
            </button>
          </div>
        </div>
      </div>

      {isOpen &&
        ReactDOM.createPortal(
          <PopupCard
            image={finalImage}
            title={finalTitle}
            description={finalDesc}
            price={finalPrice}
            item={item}
            closePopup={closePopup}
          />,
          document.body
        )}
    </>
  );
};

export default ProductCard;