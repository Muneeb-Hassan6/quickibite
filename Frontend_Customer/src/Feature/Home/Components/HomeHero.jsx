import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Food cutouts for 3D Orbit Fallback
import burgerImg from "../../../assets/products/doublepatty-removebg-preview.png";
import pizzaImg from "../../../assets/deals-hero-pizza.png";
import broastImg from "../../../assets/products/injectedbroast-removebg-preview.png";
import wrapImg from "../../../assets/products/tortillawrap.png";
import wingsImg from "../../../assets/products/grilledwings1-removebg-preview.png";
import friesImg from "../../../assets/products/loadedfries-removebg-preview.png";
import drinksImg from "../../../assets/products/coke.png";
import friedChickenImg from "../../../assets/products/friedchicken1-removebg-preview.png";

const HERO_FOODS = [
  { id: "burger", name: "Gourmet Burger", category: "burger", image: burgerImg },
  { id: "pizza", name: "Cheesy Pizza", category: "pizza", image: pizzaImg },
  { id: "broast", name: "Crispy Broast", category: "broast", image: broastImg },
  { id: "wrap", name: "Tortilla Wrap", category: "wraps", image: wrapImg },
  { id: "wings", name: "Grilled Wings", category: "grilled-wings", image: wingsImg },
  { id: "fries", name: "Loaded Fries", category: "potato-corner", image: friesImg },
  { id: "drinks", name: "Cold Drink", category: "drinks", image: drinksImg },
  { id: "fried-chicken", name: "Fried Chicken", category: "fried-chicken", image: friedChickenImg },
];

export default function HomeHero({ slides = [], onBannerClick }) {
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [, setSwiperReady] = useState(false);

  // States for 3D Orbit Fallback
  const [activeFood, setActiveFood] = useState(HERO_FOODS[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [orbitRadius, setOrbitRadius] = useState(115);
  const companions = HERO_FOODS.filter((f) => f.id !== activeFood.id);

  // Dynamic responsive orbit radius calculation
  useEffect(() => {
    const updateRadius = () => {
      const w = window.innerWidth;
      if (w < 400) {
        setOrbitRadius(98);
      } else if (w < 640) {
        setOrbitRadius(115);
      } else if (w < 768) {
        setOrbitRadius(155);
      } else if (w < 1024) {
        setOrbitRadius(195);
      } else if (w < 1280) {
        setOrbitRadius(245);
      } else {
        setOrbitRadius(280);
      }
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // Auto-cycle active food every 5 seconds for Orbit Fallback
  useEffect(() => {
    if (slides && slides.length > 0) return;
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveFood((prev) => {
        const currentIndex = HERO_FOODS.findIndex((f) => f.id === prev.id);
        const nextIndex = (currentIndex + 1) % HERO_FOODS.length;
        return HERO_FOODS[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, slides]);

  // ═══════════════════════════════════════════════════════════════
  // 1. ADMIN HERO SLIDERS ACTIVE (Dynamic Interactive Carousel)
  // ═══════════════════════════════════════════════════════════════
  if (Array.isArray(slides) && slides.length > 0) {
    return (
      <div className="relative w-full max-w-full overflow-hidden select-none bg-neutral-950 group/hero pt-0 mt-0">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            bulletClass: "hero-bullet inline-block w-2.5 h-2.5 rounded-full bg-white/40 cursor-pointer mx-1.5 transition-all duration-300",
            bulletActiveClass: "!w-8 !rounded-full !bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]",
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          onInit={() => setSwiperReady(true)}
          loop={slides.length > 1}
          className="w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[580px]"
        >
          {slides.map((slide, idx) => {
            const slideImg = optimizeCloudinaryImage(slide.image_url || slide.image, 1920);

            return (
              <SwiperSlide key={slide.id || idx} className="relative w-full h-full overflow-hidden">
                <div
                  onClick={() => {
                    if (slide.link_url || slide.link) {
                      if (onBannerClick) {
                        onBannerClick(slide.link_url || slide.link, slide);
                      } else {
                        navigate(slide.link_url || slide.link);
                      }
                    } else if (onBannerClick) {
                      onBannerClick(slide);
                    }
                  }}
                  className="w-full h-full relative cursor-pointer group"
                >
                  {/* Background Slide Image */}
                  <img
                    src={slideImg}
                    alt={slide.title || `Hero Slide ${idx + 1}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                  {/* Slide Content Caption */}
                  {(slide.title || slide.subtitle) && (
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-12 lg:p-16 z-10 max-w-3xl">
                      {slide.title && (
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-['Oswald',sans-serif] uppercase tracking-tight text-white leading-none drop-shadow-lg m-0 animate-fade-in">
                          {slide.title}
                        </h1>
                      )}
                      {slide.subtitle && (
                        <p className="text-xs sm:text-base md:text-lg text-neutral-200 font-medium mt-1.5 sm:mt-2.5 max-w-xl drop-shadow-md leading-relaxed">
                          {slide.subtitle}
                        </p>
                      )}
                      {(slide.link_url || slide.link) && (
                        <div className="mt-3 sm:mt-5">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black uppercase text-xs tracking-wider shadow-lg hover:shadow-amber-500/25 transition-all duration-300 active:scale-95 border-none cursor-pointer"
                          >
                            <span>EXPLORE NOW</span>
                            <FaArrowRight className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              ref={prevRef}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-amber-400 text-white hover:text-neutral-950 backdrop-blur-md border border-white/20 hover:border-amber-400 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/hero:opacity-100 active:scale-90 cursor-pointer shadow-lg"
            >
              <FaChevronLeft className="text-xs sm:text-sm" />
            </button>
            <button
              ref={nextRef}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-amber-400 text-white hover:text-neutral-950 backdrop-blur-md border border-white/20 hover:border-amber-400 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/hero:opacity-100 active:scale-90 cursor-pointer shadow-lg"
            >
              <FaChevronRight className="text-xs sm:text-sm" />
            </button>
          </>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. FALLBACK: ORIGINAL 3D ROTATING ORBIT STAGE (Split Headline Layout)
  // ═══════════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @keyframes stageIn {
          0% {
            opacity: 0;
            transform: scale(0.68) rotate(4deg) translateY(18px);
          }
          65% {
            opacity: 1;
            transform: scale(1.04) rotate(-1.5deg) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg) translateY(0);
          }
        }
        .stage-in {
          animation: stageIn 0.52s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitSpinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        .anim-orbit-spin {
          animation: orbitSpin 40s linear infinite;
        }
        .anim-orbit-spin:hover {
          animation-play-state: paused;
        }

        .anim-item-counter-spin {
          animation: orbitSpinReverse 40s linear infinite;
        }
        .anim-orbit-spin:hover .anim-item-counter-spin {
          animation-play-state: paused;
        }
      `}</style>

      {/* ── FULL-WIDTH HERO CANVAS (Clamped & Zero Excess Top Space) ── */}
      <div className="w-full max-w-full min-h-[420px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[600px] xl:min-h-[640px] px-3.5 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 md:py-8 lg:py-10 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 dark:from-neutral-900 dark:via-[#141416] dark:to-neutral-950 border-b border-amber-200/50 dark:border-neutral-800 shadow-xs select-none relative overflow-hidden transition-colors duration-500">
        {/* Ambient glows */}
        <div className="absolute -top-20 right-20 w-[320px] sm:w-[420px] lg:w-[500px] h-[320px] sm:h-[420px] lg:h-[500px] rounded-full bg-radial from-amber-400/20 via-amber-500/10 to-transparent blur-[85px] pointer-events-none" />
        <div className="absolute -bottom-14 left-14 w-48 sm:w-60 lg:w-80 h-48 sm:h-60 lg:h-80 rounded-full bg-radial from-amber-400/15 to-transparent blur-[65px] pointer-events-none" />

        {/* ══ LEFT / TOP TYPOGRAPHY: "FLAVORS THAT" ══ */}
        <div className="w-full md:w-auto shrink-0 text-center md:text-left select-none z-10 pl-0 md:pl-2 lg:pl-6 xl:pl-8 mb-2 md:mb-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black font-['Oswald',sans-serif] uppercase tracking-tight text-neutral-950 dark:text-white leading-none m-0">
            FLAVORS<br className="hidden md:inline" /><span className="md:hidden"> </span>THAT
          </h1>
        </div>

        {/* ══ CENTER ORBIT STAGE (Responsive Clamped Dimensions) ══ */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] lg:w-[560px] lg:h-[560px] xl:w-[640px] xl:h-[640px] flex items-center justify-center overflow-visible select-none my-2 sm:my-4 md:my-0 mx-auto shrink-0"
        >
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-88 md:h-88 lg:w-104 lg:h-104 xl:w-120 xl:h-120 rounded-full bg-amber-400/20 dark:bg-amber-500/12 blur-[80px] pointer-events-none transition-all duration-700" />

          {/* ACTIVE CENTER STAGE (z-20) */}
          <div
            key={activeFood.id}
            onClick={() => navigate(`/menu?category=${activeFood.category}`)}
            className="relative z-20 w-36 h-36 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 flex items-center justify-center p-2 group cursor-pointer stage-in pointer-events-auto"
          >
            <img
              src={activeFood.image}
              alt={activeFood.name}
              className="w-full h-full object-contain transition-all duration-500 ease-out transform group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-[-2deg] drop-shadow-[0_20px_35px_rgba(245,158,11,0.3)] pointer-events-auto cursor-pointer"
            />
          </div>

          {/* ROTATING CIRCULAR ORBIT CONTAINER */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none overflow-visible">
            <div className="relative w-full h-full flex items-center justify-center anim-orbit-spin pointer-events-auto">
              {companions.map((item, idx) => {
                const total = companions.length;
                const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                const x = Math.round(orbitRadius * Math.cos(angle));
                const y = Math.round(orbitRadius * Math.sin(angle));

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveFood(item)}
                    onClick={() => navigate(`/menu?category=${item.category}`)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 select-none"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <div className="anim-item-counter-spin">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 object-contain drop-shadow-md transition-transform duration-200 hover:scale-125 opacity-90 hover:opacity-100"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ RIGHT / BOTTOM TYPOGRAPHY: "HIT DIFFERENT" ══ */}
        <div className="w-full md:w-auto shrink-0 text-center md:text-right select-none z-10 pr-0 md:pr-2 lg:pr-6 xl:pl-8 mt-2 md:mt-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black font-['Oswald',sans-serif] uppercase tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent leading-none m-0">
            HIT<br className="hidden md:inline" /><span className="md:hidden"> </span>DIFFERENT
          </h1>
        </div>
      </div>
    </>
  );
}
