import React, { useState, useEffect } from "react";
import slider1 from "../../Images/slider1.jpg";
import slider2 from "../../Images/slider2.jpg";
import slider3 from "../../Images/slider3.jpg";

const slides = [
  {
    image: slider1,
    title: "Embroidery Work",
    description: "Step into grace and tradition with Adaa Jaipur's stunning collection.",
  },
  {
    image: slider2,
    title: "Modern Designs",
    description: "Explore our latest collection with a contemporary twist.",
  },
  {
    image: slider3,
    title: "Festive Wear",
    description: "Celebrate in style with our exclusive festive wear.",
  },
];

const ProductAdSlider = ({ handleScroll }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animateText, setAnimateText] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  const isMobile = window.innerWidth < 768;

  // Cursor movement handler
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    let sliderInterval;

    sliderInterval = setInterval(() => {
      setAnimateText(true);

      setTimeout(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        setAnimateText(false);
      }, 800);
    }, 5000);

    return () => {
      clearInterval(sliderInterval);
    };
  }, []);

  // Custom cursor styles
  const customCursorStyles = `
    .custom-cursor-container {
      cursor: none;
    }

    .glitter-cursor {
      pointer-events: none;
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(circle at center, 
        rgba(255, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      transform: translate(-50%, -50%);
      mix-blend-mode: overlay;
      z-index: 9999;
      transition: opacity 0.3s ease;
    }

    .glitter-trail {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: white;
      opacity: 0;
      pointer-events: none;
      animation: glitterFade 1s ease-out forwards;
    }

    .cursor-ring {
      pointer-events: none;
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.15s ease;
      z-index: 9998;
    }

    @keyframes glitterFade {
      0% {
        transform: scale(1);
        opacity: 0.8;
      }
      100% {
        transform: scale(0);
        opacity: 0;
      }
    }

    .glitter-sparkle {
      position: absolute;
      pointer-events: none;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center,
        rgba(255, 255, 255, 0.8) 0%,
        transparent 50%
      );
      animation: sparkle 2s infinite;
    }

    @keyframes sparkle {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.2); }
    }
  `;

  return (
    <div
      className="relative w-full h-[60vh] md:h-screen bg-gray-100 flex items-center justify-center custom-cursor-container"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <style>{customCursorStyles}</style>

      {/* Custom Cursor Elements */}
      {isHovering && (
        <>
          <div
            className="glitter-cursor hidden md:flex"
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
            }}
          >
            <div className="glitter-sparkle"></div>
          </div>
          <div
            className="cursor-ring"
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
            }}
          ></div>
        </>
      )}

      {/* Background Image */}
      <img
        src={slides[currentSlide].image}
        alt="Product"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6">
        <h1
          className={`text-2xl md:text-5xl font-bold mb-2 md:mb-6 transition-all duration-700 ${
            animateText ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0"
          }`}
        >
          {slides[currentSlide].title}
        </h1>
        <p
          className={`text-sm md:text-xl mb-3 md:mb-6 transition-all duration-700 delay-100 ${
            animateText ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0"
          }`}
        >
          {slides[currentSlide].description}
        </p>
        <button
          className="bg-[#B78C72] hover:bg-[#9E7A65] text-white py-2 px-4 md:py-3 md:px-6 rounded-full shadow-md transition-transform transform hover:scale-110 hover:shadow-lg text-sm md:text-base"
          onClick={handleScroll}
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default ProductAdSlider;