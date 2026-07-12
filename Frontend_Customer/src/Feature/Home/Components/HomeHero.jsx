import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const HomeHero = ({ slides = [], onBannerClick }) => {
  if (slides.length === 0) return null;
  return (
    <div className="relative w-full h-[15.625rem] sm:h-[18.75rem] md:h-[28.126rem] lg:h-[31.25rem] flex items-center justify-center overflow-hidden bg-black border-b border-[var(--border-color,#333)] mt-0 [&_.swiper-pagination-bullet]:bg-white/50 [&_.swiper-pagination-bullet]:w-3 [&_.swiper-pagination-bullet]:h-3 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-500 [&_.swiper-pagination-bullet-active]:bg-red-500 [&_.swiper-pagination-bullet-active]:w-10 [&_.swiper-pagination-bullet-active]:rounded-md [&_.swiper-pagination-bullet-active]:scale-110 [&_.swiper-pagination-bullet-active]:shadow-[0_0_10px_rgba(239,68,68,0.6)]">
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
              className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image_url})`, cursor: slide.link_url ? 'pointer' : 'default' }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HomeHero;
