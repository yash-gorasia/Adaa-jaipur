import React from 'react';
import { NavLink } from 'react-router-dom';

const SuggestionCard = ({ product }) => {
  return (
    <NavLink to="/product" state={{ productId: product._id }}>
      <div className="flex items-center p-2 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
        <img
          src={product.image[0].replace("'\'", "/")}
          alt={product.name}
          className="w-12 h-12 object-cover rounded-lg"
        />
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-500">₹{product.CurrentPrice}</p>
        </div>
      </div>
    </NavLink>
  );
};

export default SuggestionCard;