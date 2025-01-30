import React, { useState } from 'react';
import { FaShippingFast, FaBox, FaShieldAlt, FaLock, FaUndoAlt, FaCheckCircle } from 'react-icons/fa';

const ServiceCard = ({ 
  Icon,
  HoverIcon,
  title,
  description,
  color,
  hoverColor
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl 
        bg-white 
        p-6 text-center 
        transition-all duration-300 
        
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon Container */}
      <div className="mb-4 flex justify-center">
        <div className="relative w-10 h-10 md:w-16 md:h-16">
          <div className={`
            absolute inset-0 transition-all duration-500 
            ${isHovered ? 'opacity-0 scale-75' : 'opacity-100'}
          `}>
            <Icon className={`w-full h-full text-blue-900`} />
          </div>
          <div className={` 
            absolute inset-0 transition-all duration-500
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}>
            <HoverIcon className={`w-full h-full text-blue-900`} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className={`
          text-lg font-semibold mb-2 
          transition-colors duration-300
          ${isHovered ? 'text-gray-800' : 'text-gray-800'}
        `}>
          {title}
        </h3>
        <p className="text-gray-600 text-sm hidden md:block">
          {description}
        </p>
      </div>
    </div>
  );
};

const ServiceCards = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
        <ServiceCard
          Icon={FaShippingFast}
          HoverIcon={FaBox}
          title="Free Shipping"
          description="Complimentary shipping on all orders"
          color="text-blue-900"
          hoverColor="text-blue-900"
        />
        <ServiceCard
          Icon={FaShieldAlt}
          HoverIcon={FaLock}
          title="Secure Payments"
          description="Advanced encryption for safe transactions"
          color="text-blue-900"
          hoverColor="text-blue-900"
        />
        <ServiceCard
          Icon={FaUndoAlt}
          HoverIcon={FaCheckCircle}
          title="Easy Returns"
          description="Hassle-free returns and exchanges"
          color="text-blue-900"
          hoverColor="text-blue-900"
        />
      </div>
    </div>
  );
};

export default ServiceCards;
