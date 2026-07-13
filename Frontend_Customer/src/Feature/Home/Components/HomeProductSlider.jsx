import React, { useRef, useState, useEffect } from "react";
import ProductCard from "../../../Components/UI/ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { EffectCards, EffectCoverflow, EffectFade, Pagination } from "swiper/modules";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";
import { sliderStyles } from "./SliderStyles";

const HomeProductSlider = ({ title, items, sliderType = "regular" }) => {
  const sliderRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false); // 🔥 Smart logic state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // 🔥 State for Cinematic Showcase
  const [activeDeal, setActiveDeal] = useState(items && items.length > 0 ? items[0] : null);

  useEffect(() => {
    if (items && items.length > 0) {
      setActiveDeal(items[0]);
    }
  }, [items]);

  // 🔥 Check karna ke scroll ki zaroorat hai ya nahi
  const checkOverflow = () => {
    if (sliderRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = sliderRef.current;
      setShowArrows(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      checkOverflow();
    };
    
    if (slider) {
      slider.addEventListener("scroll", checkOverflow);
    }
    checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (slider) slider.removeEventListener("scroll", checkOverflow);
    };
  }, [items]);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 350;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <style>{sliderStyles}</style>
      <div className="w-full overflow-hidden mb-10">
      <div className="flex justify-between items-center mb-5 px-2.5">
        <h3 className="text-[var(--text-main,#fff)] font-['Oswald',sans-serif] text-[1.375rem] md:text-[1.75rem] font-extrabold uppercase border-l-[0.313rem] border-red-500 pl-[0.937rem] m-0 tracking-[1px]">{title}</h3>
      </div>

      {/* 🔥 ARROWS AB YAHAN CARDS KE SATH HAIN */}
      {sliderType === "stacked" && isMobile ? (
        <div className="mobile-stacked-slider">
          <Swiper
            effect={"cards"}
            grabCursor={true}
            modules={[EffectCards]}
            className="stacked-swiper"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id}>
                <ProductCard
                  item={item}
                  image={item.img}
                  title={item.name}
                  description={item.description}
                  price={item.price}
                  isTopDeal={item.isTopDeal}
                  isBestSeller={item.isBestSeller}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : sliderType === "stacked" && !isMobile ? (
        <div className="cinematic-showcase-container">
          {/* Left Side: Massive Hero Spotlight */}
          <div className="showcase-hero" key={activeDeal?.id}>
            {activeDeal && (
              <>
                {/* Glowing background behind the card */}
                <div className="showcase-bg-glow" style={{ backgroundImage: `url(${optimizeCloudinaryImage(activeDeal.img, 800)})` }}></div>
                <div className="showcase-hero-card-wrapper">
                  <ProductCard
                    item={activeDeal}
                    image={activeDeal.img}
                    title={activeDeal.name}
                    description={activeDeal.description}
                    price={activeDeal.price}
                    isTopDeal={activeDeal.isTopDeal}
                    isBestSeller={activeDeal.isBestSeller}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Side: Interactive Hover List */}
          <div className="showcase-list">
            {items.slice(0, 8).map((item) => (
              <div 
                key={item.id}
                className={`showcase-list-item-wrapper ${activeDeal?.id === item.id ? 'active-item' : ''}`}
                onMouseEnter={() => setActiveDeal(item)}
              >
                <ProductCard
                  item={item}
                  image={item.img}
                  title={item.name}
                  description={item.description}
                  price={item.price}
                  isTopDeal={item.isTopDeal}
                  isBestSeller={item.isBestSeller}
                />
              </div>
            ))}
          </div>
        </div>
      ) : sliderType === "glassmorphism" ? (
        <div className="glassmorphism-slider-container">
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={"auto"}
            coverflowEffect={{
              rotate: 30,
              stretch: 0,
              depth: 200,
              modifier: 1.2,
              slideShadows: false, // We'll handle shadows manually for a cleaner look
            }}
            pagination={{ clickable: true }}
            modules={[EffectCoverflow, Pagination]}
            className="glass-swiper"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className="glass-swiper-slide">
                <ProductCard
                  item={item}
                  image={item.img}
                  title={item.name}
                  description={item.description}
                  price={item.price}
                  isTopDeal={item.isTopDeal}
                  isBestSeller={item.isBestSeller}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : sliderType === "bento" ? (
        <div className="dynamic-bento-container">
          {items.slice(0, 5).map((item, index) => (
            <div key={item.id} className={`bento-card bento-card-${index + 1}`}>
              <div className="bento-bg" style={{ backgroundImage: `url(${optimizeCloudinaryImage(item.img, 400)})` }}></div>
              <div className="bento-content-wrapper">
                <ProductCard
                  item={item}
                  image={item.img}
                  title={item.name}
                  description={item.description}
                  price={item.price}
                  isTopDeal={item.isTopDeal}
                  isBestSeller={item.isBestSeller}
                />
              </div>
            </div>
          ))}
        </div>
      ) : sliderType === "parallax" ? (
        <div className="parallax-slider-container">
          <div className="parallax-grid">
            {items.slice(0, 4).map((item) => (
              <div 
                key={item.id} 
                className="parallax-card-wrapper"
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = ((y - centerY) / centerY) * -12; // 12deg max tilt
                  const rotateY = ((x - centerX) / centerX) * 12;
                  card.style.setProperty('--rx', `${rotateX}deg`);
                  card.style.setProperty('--ry', `${rotateY}deg`);
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  card.style.setProperty('--rx', `0deg`);
                  card.style.setProperty('--ry', `0deg`);
                }}
              >
                <div className="parallax-card-inner">
                  <div className="parallax-bg" style={{ backgroundImage: `url(${optimizeCloudinaryImage(item.img, 600)})` }}></div>
                  <div className="parallax-content">
                    <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : sliderType === "revolving" ? (
        <div className="revolving-stage-container">
          <div className="revolving-stage-floor"></div>
          <Swiper
            slidesPerView={3}
            centeredSlides={true}
            spaceBetween={0}
            grabCursor={true}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="revolving-swiper"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className="revolving-slide">
                <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : sliderType === "deck" ? (
        <div className="deck-slider-container">
          <Swiper
            effect={"cards"}
            grabCursor={true}
            modules={[EffectCards]}
            className="deck-swiper"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className="deck-slide">
                <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : sliderType === "split" ? (
        <div className="split-screen-container">
          <Swiper
            effect={"fade"}
            grabCursor={true}
            modules={[EffectFade, Pagination]}
            pagination={{ clickable: true }}
            className="split-swiper"
          >
            {items.map((item, index) => (
              <SwiperSlide key={item.id} className="split-slide" style={{ backgroundColor: index % 2 === 0 ? '#111' : '#1a0505' }}>
                <div className="split-left">
                  <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
                </div>
                <div className="split-right">
                  <img src={optimizeCloudinaryImage(item.img, 600)} alt={item.name} className="split-hero-img" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : sliderType === "marquee" ? (
        <div className="marquee-slider-container">
          <div className="marquee-track">
            {[...items, ...items, ...items].map((item, index) => (
              <div key={`${item.id}-${index}`} className="marquee-item">
                <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
              </div>
            ))}
          </div>
        </div>
      ) : sliderType === "bubbles" ? (
        <div className="bubbles-slider-container">
          <div className="bubbles-space">
            {items.slice(0, 7).map((item, index) => (
              <div key={item.id} className={`bubble-item bubble-${index + 1}`} style={{ backgroundImage: `url(${optimizeCloudinaryImage(item.img, 400)})` }}>
                <div className="bubble-card-wrapper">
                  <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : sliderType === "skewed" ? (
        <div className="skewed-slider-container">
          <div className="skewed-grid">
            {items.slice(0, 4).map((item) => (
              <div key={item.id} className="skewed-card-wrapper" style={{ backgroundImage: `url(${optimizeCloudinaryImage(item.img, 600)})` }}>
                <div className="skewed-content">
                   <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : sliderType === "inventory" ? (
        <div className="inventory-slider-container">
          <div className="inventory-grid">
            {items.slice(0, 8).map((item) => (
              <div key={item.id} className="inventory-slot">
                <img src={optimizeCloudinaryImage(item.img, 200)} alt={item.name} className="inventory-icon" />
                <div className="inventory-hologram">
                   <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : sliderType === "vertical-accordion" ? (
        <div className="vertical-accordion-container">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="v-accordion-strip" style={{ backgroundImage: `url(${optimizeCloudinaryImage(item.img, 400)})` }}>
              <div className="v-accordion-title-bar">
                <h3>{item.name}</h3>
                <span className="v-price">Rs. {item.price}</span>
              </div>
              <div className="v-accordion-expanded-content">
                <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative w-full flex items-center">
          {showArrows && canScrollLeft && (
            <button
              className="absolute top-[40%] -translate-y-1/2 z-10 bg-[var(--panel-bg,rgba(20,20,20,0.9))] text-white border border-[var(--border-color,#222)] w-[2.188rem] h-[2.188rem] md:w-[2.813rem] md:h-[2.813rem] rounded-full flex items-center justify-center text-[0.875rem] md:text-[1.126rem] cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.6)] left-[0.313rem] hover:bg-red-500 hover:border-red-500 hover:shadow-[0_6px_15px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-90"
              onClick={() => scroll("left")}
            >
              <FaChevronLeft />
            </button>
          )}

          <div className="flex gap-5 overflow-x-auto px-2.5 pt-4 pb-8 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" ref={sliderRef}>
            {items.map((item) => (
              <div className="min-w-[11.25rem] max-w-[11.875rem] md:min-w-[13.751rem] md:max-w-[15rem] flex-none transition-transform duration-300 hover:-translate-y-2" key={item.id}>
                <ProductCard
                  item={item}
                  image={item.img}
                  title={item.name}
                  description={item.description}
                  price={item.price}
                  isTopDeal={item.isTopDeal}
                  isBestSeller={item.isBestSeller}
                />
              </div>
            ))}
          </div>

          {showArrows && canScrollRight && (
            <button
              className="absolute top-[40%] -translate-y-1/2 z-10 bg-[var(--panel-bg,rgba(20,20,20,0.9))] text-white border border-[var(--border-color,#222)] w-[2.188rem] h-[2.188rem] md:w-[2.813rem] md:h-[2.813rem] rounded-full flex items-center justify-center text-[0.875rem] md:text-[1.126rem] cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.6)] right-[0.313rem] hover:bg-red-500 hover:border-red-500 hover:shadow-[0_6px_15px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-90"
              onClick={() => scroll("right")}
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default HomeProductSlider;
