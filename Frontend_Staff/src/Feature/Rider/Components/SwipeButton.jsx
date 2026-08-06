import React, { useState, useRef, useEffect } from 'react';
import { FaChevronRight } from 'react-icons/fa';

const SwipeButton = ({ onComplete, text }) => {
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
        if (!isDragging.current || isUnlocked) return;
        const maxSlide = containerRef.current.offsetWidth - 50;
        let moveX = clientX - startX.current;

        if (moveX < 0) moveX = 0;
        if (moveX > maxSlide) moveX = maxSlide;
        setSliderLeft(moveX);

        // Agar 85% drag ho gaya to mukammal kar do
        if (moveX > maxSlide * 0.85) {
            isDragging.current = false;
            setIsUnlocked(true);
            setSliderLeft(maxSlide);
            setTimeout(() => {
                onComplete();
                setIsUnlocked(false);
                setSliderLeft(0);
            }, 500);
        }
    };

    const handleDragEnd = () => {
        if (!isUnlocked) {
            isDragging.current = false;
            setSliderLeft(0); // Wapas bounce back
        }
    };

    return (
        <div ref={containerRef} className={`swipe-container ${isUnlocked ? 'unlocked' : ''}`}>
            <span className={`swipe-text ${isUnlocked ? 'hidden' : ''}`}>{text}</span>
            <div
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
                className="swipe-thumb"
                style={{ left: `${sliderLeft}px`, transition: isDragging.current ? 'none' : 'left 0.3s' }}
            >
                <FaChevronRight color="white" />
            </div>
        </div>
    );
};

export default SwipeButton;