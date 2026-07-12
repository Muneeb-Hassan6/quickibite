export const sliderStyles = `
/* 🔥 MAIN SECTION */
.product-slider-section {
  width: 100%;
  overflow: hidden;
  margin-bottom: 1.876rem;
}

/* 🔥 HEADER ROW (Title & Arrows) */
.slider-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.938rem;
  padding: 0 0.625rem;
}

.section-title-modern {
  color: #ffffff;
  font-family: "Oswald", sans-serif;
  font-size: 1.313rem;
  font-weight: 800;
  text-transform: uppercase;
  border-left: 0.234rem solid #ef4444; /* Brand Red */
  padding-left: 0.704rem;
  margin: 0;
  letter-spacing: 1px;
}

/* 🔥 ARROWS STYLING */
.slider-arrows {
  display: flex;
  gap: 0.563rem;
}

.arrow-btn {
  background: #141414; /* Dark button background */
  color: #ffffff;
  border: 1px solid #222222;
  width: 1.876rem;
  height: 1.876rem;
  border-radius: 50%; /* Gol (Circle) button */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0.251rem 0.376rem rgba(0, 0, 0, 0.3);
}

.arrow-btn:hover {
  background: #ef4444; /* Hover par red hoga */
  border-color: #ef4444;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 0.376rem 0.75rem rgba(239, 68, 68, 0.4);
}

.arrow-btn:active {
  transform: scale(0.9); /* Click karne par button press feel hoga */
}

/* 🔥 SLIDER CONTAINER */
.custom-slider-container {
  display: flex;
  gap: 0.938rem;
  overflow-x: auto;
  padding: 0.704rem 0.625rem 1.874rem 0.625rem;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox ke liye scrollbar hide karega */
}

/* Chrome, Safari, aur Edge ke liye purana scrollbar hide karna */
.custom-slider-container::-webkit-scrollbar {
  display: none;
}

/* 🔥 SLIDER CARD ITEM */
.slider-item {
  min-width: 13.124rem; /* Card ki width fixed rahegi */
  max-width: 14.063rem;
  flex-shrink: 0; /* Cards ko chota (shrink) hone se rokega */
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: center center;
}

/* 🔥 CINEMATIC SHOWCASE GALLERY (TOP DEALS) */
.cinematic-showcase-container {
  display: flex;
  width: 100%;
  height: 21.095rem;
  gap: 1.406rem;
  padding: 0.469rem 0;
}

/* Left Side: Spotlight Hero */
.showcase-hero {
  flex: 1.5;
  position: relative;
  border-radius: 1.126rem;
  overflow: hidden;
  animation: fade-in 0.5s ease;
  box-shadow: 0 0.625rem 2.501rem rgba(0,0,0,0.5);
  background: #000;
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.showcase-bg-glow {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-size: cover;
  background-position: center;
  filter: blur(30px) brightness(0.3);
  z-index: 1;
}

.showcase-hero-card-wrapper {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 2;
  padding: 1.406rem;
}

/* Restyle ProductCard for the Spotlight Hero */
.showcase-hero-card-wrapper .custom-card {
  width: 100%; height: 100%;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  flex-direction: row; /* Horizontal layout for hero */
  align-items: center;
  gap: 1.876rem;
  cursor: pointer;
}
.showcase-hero-card-wrapper .card-img-container {
  flex: 0 0 55%; 
  height: 100%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Removed box-shadow, overflow: hidden, and border-radius for transparent SVGs */
}
.showcase-hero-card-wrapper .card-img-container::after {
  display: none; /* remove overlay */
}
.showcase-hero-card-wrapper .card-img-fluid {
  width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain; /* Perfect for SVGs so they don't get cropped */
  transform: none; /* Removed scale */
  filter: none; /* Removed drop shadow to fix messy borders on edges */
}
.showcase-hero-card-wrapper .custom-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1.25rem 0 0;
  position: relative;
}
.showcase-hero-card-wrapper .card-title-text {
  font-size: 1.969rem;
  font-weight: 900;
  color: #fff !important;
  margin-bottom: 0.704rem;
  text-shadow: none;
}
.showcase-hero-card-wrapper .card-desc-text {
  font-size: 0.75rem;
  color: #ccc !important;
  margin-bottom: 1.406rem;
  text-shadow: none;
}
.showcase-hero-card-wrapper .price-action-row {
  margin-top: 0;
}
.showcase-hero-card-wrapper .desktop-price {
  font-size: 1.687rem !important;
  color: var(--brand-red, #ef4444) !important;
  font-weight: 900;
  text-shadow: none;
}
.showcase-hero-card-wrapper .desktop-price small {
  font-size: 0.938rem !important;
  color: var(--brand-red, #ef4444) !important;
  text-shadow: none;
}
.showcase-hero-card-wrapper .btn-kfc-add {
  padding: 0.563rem 1.874rem;
  font-size: 0.845rem;
}

/* Right Side: Interactive List */
.showcase-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.563rem;
  overflow-y: auto;
  padding-right: 0.704rem;
}
.showcase-list::-webkit-scrollbar {
  width: 0.188rem;
}
.showcase-list::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 0.469rem;
}

/* List Item Wrappers */
.showcase-list-item-wrapper {
  height: 4.219rem;
  flex-shrink: 0;
  border-radius: 0.563rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0.5;
  transform: scale(0.96);
  cursor: pointer;
}
.showcase-list-item-wrapper:hover {
  opacity: 0.8;
}
.showcase-list-item-wrapper.active-item {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 0 2px var(--brand-red, #ef4444), 0 0.312rem 0.938rem rgba(0,0,0,0.5);
}

/* Restyle ProductCard for the List Items */
.showcase-list-item-wrapper .custom-card {
  flex-direction: row;
  height: 100%;
  border-radius: 0.563rem;
  background: var(--panel-bg, #1a1a1a);
  border: none !important;
  box-shadow: none !important;
}
.showcase-list-item-wrapper .card-img-container {
  width: 4.219rem;
  height: 100%;
  flex-shrink: 0;
  background: transparent;
}
.showcase-list-item-wrapper .card-img-container::after {
  display: none;
}
.showcase-list-item-wrapper .card-img-fluid {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.showcase-list-item-wrapper .custom-card-body {
  padding: 0.469rem 0.938rem;
  justify-content: center;
  position: relative;
}
.showcase-list-item-wrapper .card-title-text {
  font-size: 0.75rem;
  margin-bottom: 0.234rem;
  color: #fff !important;
  text-shadow: none;
}
.showcase-list-item-wrapper .card-desc-text,
.showcase-list-item-wrapper .btn-kfc-add {
  display: none !important; /* Hide description and add button in the thin list */
}
.showcase-list-item-wrapper .price-action-row {
  margin-top: 0;
}
.showcase-list-item-wrapper .desktop-price {
  font-size: 0.656rem !important;
  color: var(--brand-red, #ef4444) !important;
  text-shadow: none;
}
.showcase-list-item-wrapper .desktop-price small {
  font-size: 0.563rem !important;
  color: var(--brand-red, #ef4444) !important;
  text-shadow: none;
}

/* Mobile responsive ke liye heading thori choti */
@media screen and (max-width: 36rem) {
  .section-title-modern {
    font-size: 1.031rem;
  }
  .arrow-btn {
    width: 1.64rem;
    height: 1.64rem;
    font-size: 0.656rem;
  }
  .slider-item {
    min-width: 11.719rem;
  }
}
/* 🔥 WRAPPER FOR ARROWS & CARDS */
.slider-track-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

/* 🔥 ARROWS POSITIONING OVER CARDS */
.arrow-btn {
  position: absolute;
  top: 40%; /* Cards ke bilkul darmiyan (center) mein */
  transform: translateY(-50%);
  z-index: 10; /* Cards ke upar nazar aane ke liye */
  background: rgba(20, 20, 20, 0.9); /* Thora transparent dark background */
  color: #ffffff;
  border: 1px solid #222222;
  width: 2.11rem;
  height: 2.11rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.845rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0.251rem 0.625rem rgba(0, 0, 0, 0.6);
}

.arrow-left {
  left: 0.234rem; /* Left side se fasla */
}

.arrow-right {
  right: 0.234rem; /* Right side se fasla */
}

.arrow-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
  box-shadow: 0 0.376rem 0.938rem rgba(239, 68, 68, 0.5);
  transform: translateY(-50%) scale(1.1); /* Hover par thora bara hoga */
}

.arrow-btn:active {
  transform: translateY(-50%) scale(0.9);
}

/* 🔥 SWIPER STACKED CARDS STYLES (Mobile View) */
.mobile-stacked-slider {
  padding: 1.406rem 0 3.125rem 0;
  display: flex;
  justify-content: center;
  overflow: visible;
}

.stacked-swiper {
  width: 12.188rem; /* Make it smaller */
  height: 12.188rem; /* Make it square */
  padding-bottom: 0.938rem;
}

.stacked-swiper .swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.845rem;
  background-color: transparent;
}

/* Ensure the product card fills the swiper slide completely and loses its default margin */
.stacked-swiper .swiper-slide .product-card {
  margin: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0.845rem;
  box-shadow: 0 0.625rem 1.562rem rgba(0, 0, 0, 0.4);
}

/* 🔥 SWIPER CARD OVERLAY DESIGN */
.stacked-swiper .custom-card {
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  border-radius: 0.845rem;
  overflow: hidden;
}

.stacked-swiper .card-img-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.stacked-swiper .card-img-fluid {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.845rem !important;
}

/* Gradient overlay so text is readable */
.stacked-swiper .card-img-container::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, transparent 100%);
  z-index: 2;
  border-bottom-left-radius: 0.845rem;
  border-bottom-right-radius: 0.845rem;
}

.stacked-swiper .card-badges-wrapper {
  z-index: 10;
}

.stacked-swiper .custom-card-body {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 5;
  padding: 0.938rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: transparent;
}

.stacked-swiper .card-title-text {
  font-size: 0.938rem;
  color: #fff;
  text-shadow: 2px 2px 0.5rem rgba(0,0,0,0.9);
  margin-bottom: 2px;
}

.stacked-swiper .card-desc-text {
  display: none !important;
}

.stacked-swiper .price-action-row {
  padding-top: 0;
}

.stacked-swiper .desktop-price {
  position: absolute;
  bottom: 10.079rem;
  right: 0.704rem;
  background: var(--brand-red, #ef4444);
  color: #fff;
  padding: 0.188rem 0.625rem;
  border-radius: 0.376rem;
  font-size: 0.656rem;
  font-weight: 800;
  box-shadow: 0 0.251rem 0.625rem rgba(0,0,0,0.5);
  z-index: 20;
}
.stacked-swiper .desktop-price small {
  font-size: 0.469rem;
  color: #fff;
}

.stacked-swiper .btn-kfc-add {
  padding: 0.282rem 0.75rem;
  border-radius: 0.938rem;
}

.stacked-swiper .btn-kfc-add .add-icon {
  font-size: 0.563rem !important;
}

.stacked-swiper .btn-kfc-add .add-text {
  font-size: 0.563rem !important;
  display: inline-block !important;
}



/* ?? 3D GLASSMORPHISM COVERFLOW SLIDER */
.glassmorphism-slider-container {
  width: 100%;
  padding: 1.876rem 0 3.75rem 0;
  position: relative;
}

.glass-swiper {
  width: 100%;
  padding-top: 0.938rem;
  padding-bottom: 2.344rem;
}

.glass-swiper-slide {
  width: 14.063rem;
  height: 19.687rem;
  border-radius: 0.938rem;
  background: rgba(255, 255, 255, 0.05); /* Frosted glass base */
  backdrop-filter: blur(15px); /* The magic */
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0.938rem 2.188rem rgba(0, 0, 0, 0.4);
  transition: all 0.4s ease;
}

/* Style the ProductCard inside the glass slide */
.glass-swiper-slide .custom-card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  height: 100%;
}

.glass-swiper-slide .card-img-container {
  background: transparent;
  transition: all 0.4s ease;
}

.glass-swiper-slide .card-img-container::after {
  display: none;
}

.glass-swiper-slide .card-img-fluid {
  filter: drop-shadow(0 0.625rem 1.25rem rgba(0,0,0,0.5));
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Hover Effect: The image pops out in 3D */
.swiper-slide-active.glass-swiper-slide:hover .card-img-fluid {
  transform: translateY(-30px) scale(1.15) rotate(2deg);
  filter: drop-shadow(0 1.562rem 2.188rem rgba(0,0,0,0.8));
}

.glass-swiper-slide .card-title-text {
  color: #fff !important;
  font-weight: 700;
}

.glass-swiper-slide .card-desc-text {
  color: #bbb !important;
}

/* Swiper Pagination Styling */
.glass-swiper .swiper-pagination-bullet {
  background: rgba(255,255,255,0.4);
  width: 0.469rem;
  height: 0.469rem;
  transition: all 0.3s ease;
}
.glass-swiper .swiper-pagination-bullet-active {
  background: var(--brand-red, #ef4444);
  width: 1.172rem;
  border-radius: 0.234rem;
}



/* ?? DYNAMIC BENTO GRID */
.dynamic-bento-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 13.751rem);
  gap: 0.704rem;
  width: 100%;
  padding: 0.469rem 0;
}

.bento-card {
  position: relative;
  border-radius: 0.938rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 0.312rem 0.938rem rgba(0,0,0,0.3);
}

.bento-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.938rem 1.874rem rgba(0,0,0,0.5), 0 0 0 2px var(--brand-red, #ef4444);
}

/* Make the first item huge */
.bento-card-1 {
  grid-column: span 2;
  grid-row: span 2;
}

/* Background image filling the whole bento card */
.bento-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s ease;
  z-index: 1;
}

.bento-card:hover .bento-bg {
  transform: scale(1.08); /* slight zoom on hover */
}

/* Gradient overlay so text is readable */
.bento-bg::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
}

.bento-content-wrapper {
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 100%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.938rem;
}

/* Override default ProductCard completely so it fits perfectly in the bento box */
.bento-content-wrapper .custom-card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  height: auto;
  padding: 0;
}

/* Hide the redundant image container inside ProductCard because bento-bg handles the image */
.bento-content-wrapper .card-img-container {
  display: none !important;
}

.bento-content-wrapper .custom-card-body {
  padding: 0;
  display: flex;
  flex-direction: column;
  background: transparent !important;
}

.bento-content-wrapper .card-title-text {
  color: #fff !important;
  font-size: 0.938rem;
  font-weight: 800;
  margin-bottom: 0.234rem;
  text-shadow: 0 2px 0.251rem rgba(0,0,0,0.8);
}

.bento-card-1 .card-title-text {
  font-size: 1.594rem;
  margin-bottom: 0.469rem;
}

/* Hide descriptions in small bento boxes, show only in the huge one */
.bento-card .card-desc-text {
  display: none !important;
}
.bento-card-1 .card-desc-text {
  display: block !important;
  color: #ddd !important;
  margin-bottom: 0.704rem;
  text-shadow: 0 1px 0.187rem rgba(0,0,0,0.8);
}

.bento-content-wrapper .desktop-price {
  color: var(--brand-red, #ef4444) !important;
  font-size: 0.845rem !important;
  font-weight: 800;
}
.bento-content-wrapper .desktop-price small {
  color: var(--brand-red, #ef4444) !important;
  font-size: 0.656rem !important;
}

.bento-card-1 .desktop-price {
  font-size: 1.126rem !important;
}

.bento-content-wrapper .price-action-row {
  margin-top: 0.469rem;
}

/* Smaller add button for bento */
.bento-content-wrapper .btn-kfc-add {
  padding: 0.376rem 0.938rem;
  font-size: 0.656rem;
}
.bento-card-1 .btn-kfc-add {
  padding: 0.469rem 1.562rem;
  font-size: 0.75rem;
}



/* =========================================
   ULTIMATE SLIDER COLLECTION CSS
========================================= */

/* 1. PARALLAX DEPTH SHOWCASE */
.parallax-slider-container {
  padding: 1.876rem 0;
  perspective: 46.874rem;
}
.parallax-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.406rem;
}
.parallax-card-wrapper {
  transform-style: preserve-3d;
  position: relative;
  height: 18.75rem;
  cursor: pointer;
  border-radius: 0.938rem;
  transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.1s; /* smooth catch up */
}
.parallax-card-inner {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 0.938rem;
  box-shadow: 0 1.25rem 2.501rem rgba(0,0,0,0.5);
  transform-style: preserve-3d;
  background: var(--panel-bg);
  overflow: hidden;
}
.parallax-bg {
  position: absolute;
  top: -10%; left: -10%; width: 120%; height: 120%;
  background-size: cover;
  background-position: center;
  transform: translateZ(-50px) scale(1.1); /* Pushed back */
  filter: brightness(0.5);
  z-index: 1;
}
.parallax-content {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 2;
  transform: translateZ(60px); /* Pulled forward */
}
/* Override ProductCard for Parallax */
.parallax-content .custom-card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  height: 100%;
}
.parallax-content .card-img-container {
  display: none !important; /* Hide original image container */
}
.parallax-content .custom-card-body {
  position: absolute; bottom: 0; width: 100%;
  padding: 0.938rem; background: transparent !important;
}
.parallax-content .card-title-text, .parallax-content .desktop-price {
  color: #fff !important; text-shadow: 0 0.251rem 0.625rem rgba(0,0,0,0.8);
}

/* 2. CIRCULAR REVOLVING STAGE */
.revolving-stage-container {
  padding: 3.75rem 0 2.501rem 0;
  position: relative;
  overflow: hidden;
}
.revolving-stage-floor {
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 150%; height: 5.626rem;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}
.revolving-swiper {
  padding-bottom: 1.876rem;
  z-index: 1;
}
.revolving-slide {
  transition: all 0.5s ease;
  opacity: 0.4;
  transform: scale(0.7) translateY(40px);
}
.swiper-slide-active.revolving-slide {
  opacity: 1;
  transform: scale(1.1) translateY(-20px);
  z-index: 10;
}
/* Override ProductCard for Revolving */
.revolving-slide .custom-card {
  border-radius: 0.938rem;
  overflow: hidden;
}

/* 3. NEON CYBERPUNK DECK */
.deck-slider-container {
  padding: 2.344rem 0;
  display: flex; justify-content: center;
}
.deck-swiper {
  width: 15rem; height: 22.5rem;
}
.deck-slide {
  border-radius: 0.938rem;
  background: #0a0a0a !important;
  border: 1px solid #333;
  box-shadow: 0 0 1.874rem rgba(239, 68, 68, 0.1);
}
/* Active slide glowing neon */
.swiper-slide-active.deck-slide {
  border: 1px solid var(--brand-red, #ef4444);
  box-shadow: 0 0 2.501rem rgba(239, 68, 68, 0.4), inset 0 0 1.25rem rgba(239, 68, 68, 0.2);
}
.deck-slide .custom-card {
  background: transparent !important; box-shadow: none !important; border: none !important;
}

/* 4. MAGAZINE SPLIT-SCREEN */
.split-screen-container {
  border-radius: 1.126rem;
  overflow: hidden;
  box-shadow: 0 1.25rem 3.125rem rgba(0,0,0,0.6);
  margin-bottom: 0.938rem;
}
.split-swiper {
  width: 100%; height: 23.438rem;
}
.split-slide {
  display: flex; width: 100%; height: 100%;
}
.split-left {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 1.876rem;
  position: relative; z-index: 2;
}
.split-right {
  flex: 1;
  position: relative;
  clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%); /* Diagonal slash */
}
.split-hero-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transform: scale(1.1);
}
/* Override ProductCard for Split */
.split-left .custom-card {
  background: transparent !important; box-shadow: none !important; border: none !important;
}
.split-left .card-img-container { display: none !important; }
.split-left .card-title-text { font-size: 2.25rem; font-weight: 900; line-height: 1.1; margin-bottom: 0.938rem; color: #fff !important; }
.split-left .card-desc-text { color: #ccc !important; }

/* 5. ENDLESS MARQUEE */
.marquee-slider-container {
  overflow: hidden; padding: 1.876rem 0;
  width: 67.5rem;
  position: relative; left: 50%; transform: translateX(-50%); /* break container bounds */
}
.marquee-track {
  display: flex; width: max-content;
  animation: marquee-scroll 40s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.marquee-item {
  width: 13.124rem; margin: 0 0.938rem;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.marquee-item:hover {
  transform: scale(1.2);
  z-index: 100;
  box-shadow: 0 1.25rem 3.125rem rgba(0,0,0,0.6);
  border-radius: 0.938rem;
}



/* =========================================
   EXTREME SLIDER EXPANSION (PART 2)
========================================= */

/* 1. FLOATING GRAVITY BUBBLES */
.bubbles-slider-container {
  width: 100%; height: 23.438rem;
  position: relative; overflow: hidden;
  background: radial-gradient(circle at center, rgba(239, 68, 68, 0.05) 0%, transparent 70%);
  border-radius: 0.938rem;
}
.bubbles-space {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}
.bubble-item {
  position: absolute;
  border-radius: 50%;
  background-size: cover; background-position: center;
  box-shadow: 0 0.625rem 1.874rem rgba(0,0,0,0.5);
  cursor: pointer;
  animation: float-bubble 10s infinite ease-in-out alternate;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
/* Randomize positions and sizes */
.bubble-1 { width: 10.313rem; height: 10.313rem; top: 10%; left: 10%; animation-delay: 0s; }
.bubble-2 { width: 7.032rem; height: 7.032rem; top: 60%; left: 25%; animation-delay: -2s; }
.bubble-3 { width: 13.124rem; height: 13.124rem; top: 20%; left: 40%; animation-delay: -4s; z-index: 2;}
.bubble-4 { width: 8.437rem; height: 8.437rem; top: 50%; left: 65%; animation-delay: -1s; }
.bubble-5 { width: 9.376rem; height: 9.376rem; top: 15%; left: 80%; animation-delay: -3s; }
.bubble-6 { width: 5.626rem; height: 5.626rem; top: 75%; left: 85%; animation-delay: -5s; }
.bubble-7 { width: 6.562rem; height: 6.562rem; top: 80%; left: 5%; animation-delay: -6s; }

@keyframes float-bubble {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-30px) rotate(5deg); }
}
.bubble-item:hover {
  animation-play-state: paused;
  transform: scale(1.3) translateY(-10px) !important;
  z-index: 100;
  box-shadow: 0 0 2.501rem rgba(239, 68, 68, 0.8);
}
.bubble-card-wrapper {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50%; overflow: hidden;
  background: rgba(0,0,0,0.7); opacity: 0;
  transition: opacity 0.3s;
  display: flex; align-items: center; justify-content: center;
}
.bubble-item:hover .bubble-card-wrapper { opacity: 1; }
/* Override ProductCard for Bubbles */
.bubble-card-wrapper .custom-card { background: transparent !important; box-shadow: none !important; border: none !important; height: auto;}
.bubble-card-wrapper .card-img-container { display: none !important; }
.bubble-card-wrapper .card-desc-text { display: none !important; }
.bubble-card-wrapper .card-title-text { color: #fff !important; text-align: center; font-size: 0.75rem; margin-bottom: 0.234rem; text-shadow: 0 2px 0.312rem #000;}
.bubble-card-wrapper .desktop-price { color: #fff !important; font-size: 0.656rem !important; text-align: center; width: 100%; display: block; text-shadow: 0 2px 0.312rem #000;}
.bubble-card-wrapper .btn-kfc-add { margin: 0 auto; display: block; padding: 0.234rem 0.938rem; font-size: 0.563rem;}

/* 2. AGGRESSIVE SKEWED SPEED-GRID */
.skewed-slider-container {
  padding: 1.876rem 0;
}
.skewed-grid {
  display: flex; width: 100%; height: 18.75rem;
  transform: skewX(-10deg);
  overflow: hidden;
  border-radius: 0.938rem;
  box-shadow: 0 1.25rem 2.501rem rgba(0,0,0,0.6);
}
.skewed-card-wrapper {
  flex: 1;
  position: relative;
  background-size: cover; background-position: center;
  border-right: 0.188rem solid var(--panel-bg);
  transition: all 0.4s ease;
  cursor: pointer;
  overflow: hidden;
}
.skewed-card-wrapper:last-child { border-right: none; }
.skewed-card-wrapper:hover {
  flex: 2.5; /* Expands to be larger */
}
.skewed-card-wrapper::after {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
}
.skewed-content {
  position: absolute; bottom: -2.344rem; left: 0; width: 100%; height: 100%;
  z-index: 2;
  transform: skewX(10deg); /* Un-skew the text */
  opacity: 0;
  transition: all 0.4s ease;
  display: flex; flex-direction: column; justify-content: flex-end; padding: 1.406rem;
}
.skewed-card-wrapper:hover .skewed-content {
  bottom: 0; opacity: 1;
}
/* Override ProductCard for Skewed */
.skewed-content .custom-card { background: transparent !important; box-shadow: none !important; border: none !important; }
.skewed-content .card-img-container { display: none !important; }
.skewed-content .card-title-text { color: #fff !important; font-size: 1.313rem; font-weight: 900; }

/* 3. CYBERPUNK INVENTORY SLOTS */
.inventory-slider-container {
  padding: 1.876rem 0;
}
.inventory-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 6.25rem));
  gap: 0.704rem; justify-content: center;
}
.inventory-slot {
  width: 4.687rem; height: 4.687rem;
  background: #111;
  border: 2px solid #333;
  border-radius: 0.469rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}
.inventory-slot:hover {
  border-color: var(--brand-red, #ef4444);
  box-shadow: 0 0 0.938rem rgba(239, 68, 68, 0.5), inset 0 0 0.625rem rgba(239, 68, 68, 0.3);
}
.inventory-icon {
  width: 100%; height: 100%; object-fit: contain; padding: 0.469rem;
}
.inventory-hologram {
  position: absolute;
  bottom: 120%; left: 50%; transform: translateX(-50%) translateY(20px);
  width: 13.124rem;
  background: rgba(10,10,10,0.95);
  border: 1px solid var(--brand-red, #ef4444);
  border-radius: 0.704rem;
  padding: 0.704rem;
  opacity: 0; visibility: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 0.938rem 2.188rem rgba(0,0,0,0.8);
  z-index: 100;
}
.inventory-slot:hover .inventory-hologram {
  opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0);
}
/* Override ProductCard for Inventory Hologram */
.inventory-hologram .custom-card { background: transparent !important; box-shadow: none !important; border: none !important; padding: 0; }
.inventory-hologram .card-title-text { color: #fff !important; }
.inventory-hologram .card-img-fluid { max-height: 5.626rem !important; }

/* 4. CINEMATIC VERTICAL ACCORDION */
.vertical-accordion-container {
  display: flex; flex-direction: column; gap: 0.234rem; padding: 1.406rem 0;
}
.v-accordion-strip {
  height: 3.75rem; width: 100%;
  background-size: cover; background-position: center; background-attachment: fixed;
  border-radius: 0.704rem;
  position: relative; overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: inset 0 0 0 2000px rgba(0,0,0,0.7); /* Dark overlay by default */
}
.v-accordion-title-bar {
  position: absolute; top: 0; left: 0; width: 100%; height: 3.75rem;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2.501rem;
  z-index: 2;
}
.v-accordion-title-bar h3 { color: #fff; margin: 0; font-size: 1.126rem; font-weight: 800; letter-spacing: 2px; }
.v-price { color: var(--brand-red, #ef4444); font-size: 0.938rem; font-weight: 700; }

.v-accordion-expanded-content {
  opacity: 0; position: absolute; bottom: 0; left: 0; width: 100%;
  padding: 1.876rem; z-index: 3;
  transition: opacity 0.3s;
}
.v-accordion-strip:hover {
  height: 18.75rem;
  box-shadow: inset 0 0 0 2000px rgba(0,0,0,0.2); /* Lighten overlay on hover */
}
.v-accordion-strip:hover .v-accordion-expanded-content {
  opacity: 1; transition-delay: 0.2s;
}
/* Override ProductCard for Vertical Accordion */
.v-accordion-expanded-content .custom-card { background: transparent !important; box-shadow: none !important; border: none !important; width: 50%; }
.v-accordion-expanded-content .card-img-container { display: none !important; }
.v-accordion-expanded-content .card-title-text { color: #fff !important; font-size: 1.687rem; text-shadow: 0 0.251rem 0.625rem rgba(0,0,0,0.8); }
.v-accordion-expanded-content .card-desc-text { color: #eee !important; font-size: 0.75rem; text-shadow: 0 2px 0.312rem rgba(0,0,0,0.8); }


`;
