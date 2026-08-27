import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

export default function HeroOrbitFallback() {
  const navigate = useNavigate();
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

  // Auto-cycle active food every 5 seconds
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveFood((prev) => {
        const currentIndex = HERO_FOODS.findIndex((f) => f.id === prev.id);
        const nextIndex = (currentIndex + 1) % HERO_FOODS.length;
        return HERO_FOODS[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

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

      {/* Full-width Hero Canvas */}
      <div className="w-full max-w-full min-h-[420px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[600px] xl:min-h-[640px] px-3.5 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 md:py-8 lg:py-10 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 dark:from-neutral-900 dark:via-[#141416] dark:to-neutral-950 border-b border-amber-200/50 dark:border-neutral-800 shadow-xs select-none relative overflow-hidden transition-colors duration-500">
        {/* Ambient glows */}
        <div className="absolute -top-20 right-20 w-[320px] sm:w-[420px] lg:w-[500px] h-[320px] sm:h-[420px] lg:h-[500px] rounded-full bg-radial from-amber-400/20 via-amber-500/10 to-transparent blur-[85px] pointer-events-none" />
        <div className="absolute -bottom-14 left-14 w-48 sm:w-60 lg:w-80 h-48 sm:h-60 lg:h-80 rounded-full bg-radial from-amber-400/15 to-transparent blur-[65px] pointer-events-none" />

        {/* Left Typography: "FLAVORS THAT" */}
        <div className="w-full md:w-auto shrink-0 text-center md:text-left select-none z-10 pl-0 md:pl-2 lg:pl-6 xl:pl-8 mb-2 md:mb-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black font-['Oswald',sans-serif] uppercase tracking-tight text-neutral-950 dark:text-white leading-none m-0">
            FLAVORS<br className="hidden md:inline" />
            <span className="md:hidden"> </span>THAT
          </h1>
        </div>

        {/* Center Orbit Stage */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] lg:w-[560px] lg:h-[560px] xl:w-[640px] xl:h-[640px] flex items-center justify-center overflow-visible select-none my-2 sm:my-4 md:my-0 mx-auto shrink-0"
        >
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-88 md:h-88 lg:w-104 lg:h-104 xl:w-120 xl:h-120 rounded-full bg-amber-400/20 dark:bg-amber-500/12 blur-[80px] pointer-events-none transition-all duration-700" />

          {/* Active Center Stage */}
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

          {/* Rotating Circular Orbit Container */}
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

        {/* Right Typography: "HIT DIFFERENT" */}
        <div className="w-full md:w-auto shrink-0 text-center md:text-right select-none z-10 pr-0 md:pr-2 lg:pr-6 xl:pl-8 mt-2 md:mt-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black font-['Oswald',sans-serif] uppercase tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent leading-none m-0">
            HIT<br className="hidden md:inline" />
            <span className="md:hidden"> </span>DIFFERENT
          </h1>
        </div>
      </div>
    </>
  );
}
