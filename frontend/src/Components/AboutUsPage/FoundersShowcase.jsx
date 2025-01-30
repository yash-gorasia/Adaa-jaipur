import React from 'react';
import KeshavShukla from '../../Images/KeshavShukla.png';
import TulsiPrasadShukla from '../../Images/TulsiPrasadShukla.png';

const FoundersShowcase = () => {
  return (
    <div className="relative max-w-screen-xl mx-auto px-4 py-16">
      {/* Heading */}
      <h2 className="text-5xl sm:text-6xl font-extrabold text-[#1D4ED8] mb-12">Our Founders</h2>

      {/* Founders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        {/* Founder 1 */}
        <div className="flex flex-col items-center transform transition-all duration-300 hover:scale-105">
          <div className="w-64 h-64 rounded-full p-3 bg-gradient-to-br from-[#FFD700] to-[#FF8C00] shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
              <img
                src={KeshavShukla}
                alt="Keshav Shukla"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-center mt-6">
            <h3 className="text-2xl font-extrabold text-[#333] mb-2">
              Keshav Shukla
            </h3>
            <p className="text-[#1D4ED8] text-lg font-medium">Founder</p>
            <p className="mt-4 text-gray-600 max-w-sm mx-auto">
              Founded Adaa Jaipur in 2010 with a vision to blend traditional craftsmanship with contemporary fashion for the modern woman.
            </p>
          </div>
        </div>

        {/* Founder 2 */}
        <div className="flex flex-col items-center transform transition-all duration-300 hover:scale-105">
          <div className="w-64 h-64 rounded-full p-3 bg-gradient-to-br from-[#FFD700] to-[#FF8C00] shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
              <img
                src={TulsiPrasadShukla}
                alt="Tulsi Prasad Shukla"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-center mt-6">
            <h3 className="text-2xl font-extrabold text-[#333] mb-2">
              Tulsi Prasad Shukla
            </h3>
            <p className="text-[#1D4ED8] text-lg font-medium">Managing Director</p>
            <p className="mt-4 text-gray-600 max-w-sm mx-auto">
              Continues to innovate and expand the brand while maintaining its core values and heritage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundersShowcase;
