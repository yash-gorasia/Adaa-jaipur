import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RimJim from '../../Images/RimJim.jpg';
import Saanjh from '../../Images/Saanjh.jpg';
import Najarah from '../../Images/Najarah.jpg';

const ImageCards = () => {
  const images = [
    { name: 'RimJim', src: RimJim, id: '678e3ff913d9c330a8804323' },
    { name: 'Saanjh', src: Saanjh, id: '678e51e1f9a4dab3b483112b' },
    { name: 'Najarah', src: Najarah, id: '678e5cd6f9a4dab3b4831138' },
  ];

  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 3000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  });

  const handleCardClick = (id) => {
    console.log('hey ');
    console.log('id', id);
    navigate('/productlist', { state: { categoryId: id } });
  };

  return (
    <div className="flex justify-center items-center mt-[5%] bg-gray-100 flex-grow pb-24">
      {/* Desktop view with enhanced animations */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 md:px-8">
        {images.map((image, index) => (
          <div
            key={index}
            className="card-wrapper group relative overflow-hidden rounded-lg cursor-pointer"
            onClick={() => handleCardClick(image.id)}
          >
            {/* Animated border overlay */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 transition-all duration-500 rounded-lg z-10"></div>

            {/* Glowing effect container */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl transform scale-150"></div>
            </div>

            {/* Main card container */}
            <div className="relative bg-white rounded-lg shadow-lg transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl overflow-hidden">
              {/* Image container with hover effects */}
              <div className="aspect-w-1 aspect-h-1 overflow-hidden">
                <img
                  src={image.src}
                  alt={image.name}
                  className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-110"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shine"></div>
                </div>
              </div>

              {/* Card caption */}
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white text-lg font-semibold">{image.name}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile view - keeping original functionality */}
      <div className="md:hidden w-full px-4">
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <div className="aspect-w-1 aspect-h-1">
            <img
              onClick={() => handleCardClick(images[currentIndex].id)}
              src={images[currentIndex].src}
              alt={images[currentIndex].name}
              className="w-full h-full object-contain transition-transform duration-500 transform"
            />
            {console.log('passing', images[currentIndex].id)}
          </div>

          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 p-4">
            <button
              onClick={prevImage}
              className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800"
              aria-label="Previous image"
            >
              &lt;
            </button>
          </div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 p-4">
            <button
              onClick={nextImage}
              className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800"
              aria-label="Next image"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(images[index].id)}
              className={`w-2.5 h-2.5 rounded-full mx-2 ${
                currentIndex === index ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="text-center mt-4 text-white">
          <span>
            {currentIndex + 1}/{images.length}
          </span>
        </div>
      </div>

      {/* Additional styles for animations */}
      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(12deg);
          }
          100% {
            transform: translateX(200%) skewX(12deg);
          }
        }

        .animate-shine {
          animation: shine 2s infinite;
        }

        .card-wrapper::before,
        .card-wrapper::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 8px;
          transition: all 0.5s ease;
        }

        .card-wrapper::before {
          background: radial-gradient(
            circle at 50% 50%,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 60%
          );
          opacity: 0;
          z-index: 1;
        }

        .card-wrapper:hover::before {
          opacity: 1;
          transform: scale(1.2);
        }

        .card-wrapper::after {
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          z-index: 2;
          opacity: 0;
          transform: translateX(-100%) rotate(45deg);
        }

        .card-wrapper:hover::after {
          opacity: 1;
          transform: translateX(100%) rotate(45deg);
          transition: transform 0.7s ease;
        }
      `}</style>
    </div>
  );
};

export default ImageCards;