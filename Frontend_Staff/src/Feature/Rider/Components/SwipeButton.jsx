import React, { useState, useRef } from "react";
import { FaChevronRight } from "react-icons/fa";

export default function SwipeButton({ onComplete, text }) {
  const [sliderLeft, setSliderLeft] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleDragStart = (clientX) => {
    if (isUnlocked) return;
    isDragging.current = true;
    startX.current = clientX - sliderLeft;
  };

  const handleDragMove = (clientX) => {
    if (!isDragging.current || isUnlocked || !containerRef.current) return;
    const maxSlide = containerRef.current.offsetWidth - 52;
    let moveX = clientX - startX.current;

    if (moveX < 0) moveX = 0;
    if (moveX > maxSlide) moveX = maxSlide;
    setSliderLeft(moveX);

    // Trigger complete when slid past 85%
    if (moveX > maxSlide * 0.85) {
      isDragging.current = false;
      setIsUnlocked(true);
      setSliderLeft(maxSlide);
      setTimeout(() => {
        onComplete();
        setIsUnlocked(false);
        setSliderLeft(0);
      }, 400);
    }
  };

  const handleDragEnd = () => {
    if (!isUnlocked) {
      isDragging.current = false;
      setSliderLeft(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-14 rounded-2xl flex items-center justify-center overflow-hidden touch-none select-none transition-colors duration-300 border border-stone-200 dark:border-neutral-800 shadow-inner ${
        isUnlocked ? "bg-emerald-500" : "bg-stone-100 dark:bg-neutral-800/80"
      }`}
    >
      <span
        className={`font-black text-xs uppercase tracking-wider font-['Oswald',sans-serif] pointer-events-none transition-opacity duration-300 ${
          isUnlocked
            ? "text-white opacity-0"
            : "text-stone-500 dark:text-neutral-400"
        }`}
      >
        {text}
      </span>

      <div
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        className="absolute top-1 w-12 h-12 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing text-amber-500 shadow-md transition-shadow"
        style={{
          left: `${sliderLeft + 4}px`,
          transition: isDragging.current ? "none" : "left 0.3s ease-out",
        }}
      >
        <FaChevronRight className="text-amber-500 text-xs" />
      </div>
    </div>
  );
}