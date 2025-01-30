import React from 'react';
import mytra from '../../Images/mytra.jpg';
import hydrabad from '../../Images/hydrabad.png';
import flipcart from '../../Images/flipkart.png';
import dmart from '../../Images/dmart.png';
import ajio from '../../Images/ajio.png';
import logo from '../../Images/logo.png';
const FindUsOn = () => {
  const marketplaces = [
    {name :'Adaa Jaipur', logo: logo ,src:'https://www.google.com/maps/place/Adaa+Jaipur/data=!4m2!3m1!1s0x0:0x90205ef69828a6d5?sa=X&ved=1t:2428&ictx=111'},
    { name: 'Adaa Hyderabad', logo: hydrabad },
    { name: 'Flipkart', logo: flipcart },
    { name: 'Myntra', logo: mytra },
    { name: 'D Mart', logo: dmart },
    { name: 'Ajio', logo: ajio }
  ];

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mb-[12%] md:mb-0">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">You Can Also Find Us On</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-8">
          {marketplaces.map((marketplace) => (
            <div 
              key={marketplace.name} 
              className="flex flex-col items-center justify-center group"
            >
              <div className="w-24 h-24 p-4 bg-white rounded-xl shadow-md flex items-center justify-center 
                transition-all duration-300 ease-in-out 
                group-hover:shadow-xl group-hover:scale-105"
              >
                <img
                  src={marketplace.logo}
                  alt={marketplace.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="mt-4 text-sm text-gray-700 font-semibold group-hover:text-blue-600 transition-colors">
                {marketplace.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindUsOn;