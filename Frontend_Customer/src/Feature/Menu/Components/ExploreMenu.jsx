import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ExploreMenu = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Arrow Scroll State
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide arrows
  const checkForScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkForScrollPosition();
    window.addEventListener("resize", checkForScrollPosition);
    return () => window.removeEventListener("resize", checkForScrollPosition);
  }, [categories]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Distance to scroll per click
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Timeout allows smooth scrolling to finish before rechecking
      setTimeout(checkForScrollPosition, 350);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_categories.php`,
        );
        const data = await response.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="explore-menu-container">
      <div className="category-header">
        <h3 className="menu-heading">EXPLORE MENU</h3>
        <button className="view-all-btn" onClick={() => navigate("/menu")}>
          VIEW ALL
        </button>
      </div>

      <div className="category-slider-wrapper">
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div className="dot-loader">
              <div
                className="dot"
                style={{ width: "10px", height: "10px" }}
              ></div>
              <div
                className="dot"
                style={{ width: "10px", height: "10px" }}
              ></div>
              <div
                className="dot"
                style={{ width: "10px", height: "10px" }}
              ></div>
            </div>
          </div>
        ) : categories.length > 0 ? (
          <div className="carousel-track-wrapper">
            {canScrollLeft && (
              <button
                className="scroll-arrow left"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
              >
                <FaChevronLeft />
              </button>
            )}

            <div 
              className="circle-carousel-track" 
              ref={scrollRef}
              onScroll={checkForScrollPosition}
            >
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="circle-carousel-item"
                onClick={() =>
                  navigate("/menu", { state: { category: cat.name } })
                }
              >
                <div className="circle-img-wrapper">
                  <img
                    className="circle-cat-img"
                    src={cat.img}
                    alt={cat.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                  <span className="circle-cat-name">{cat.name}</span>
                </div>
              </div>
            ))}
            </div>

            {canScrollRight && (
              <button
                className="scroll-arrow right"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            No categories found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExploreMenu;
