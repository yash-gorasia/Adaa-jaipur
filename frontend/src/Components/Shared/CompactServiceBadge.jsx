import React from 'react';
import { FaShippingFast, FaShieldAlt, FaUndoAlt } from 'react-icons/fa';

const CompactServiceItem = ({ Icon, title }) => {
  return (
    <div className="flex items-center ml-[6%] space-x-3 text-gray-700">
      <Icon className="w-5 h-5 text-blue-900" />
      <span className="text-xs font-medium">{title}</span>
    </div>
  );
};

const CompactServiceBadge = () => {
  return (
    <div className="flex gap-3 items-start ">
      <CompactServiceItem 
        Icon={FaShippingFast } 
        title="Free Shipping" 
      />
      <CompactServiceItem 
        Icon={FaShieldAlt} 
        title="Secure Payment" 
      />
      <CompactServiceItem 
        Icon={FaUndoAlt} 
        title="Easy Returns" 
      />
    </div>
  );
};

export default CompactServiceBadge;