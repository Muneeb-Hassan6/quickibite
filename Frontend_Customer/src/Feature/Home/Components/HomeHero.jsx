import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const HomeHero = ({ slides = [], onBannerClick }) => {
  if (slides.length === 0) return null;
  return (
    <div className="hero-section hero-container">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        style={{ width: "100%", height: "100%" }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} onClick={() => onBannerClick && onBannerClick(slide.link_url)}>
            <div
              className="hero-slide"
              style={{ backgroundImage: `url(${slide.image_url})`, opacity: 1, transform: "none", transition: "none", cursor: slide.link_url ? 'pointer' : 'default' }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HomeHero;
