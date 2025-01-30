import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';

const WishlistButton = ({ 
  productId, 
  onWishlistUpdate, 
  className = '' 
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userId = localStorage.getItem('userId');

  // Fetch initial wishlist state
  const fetchWishlistStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/wishlist/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      
      const data = await response.json();
      setIsInWishlist(data.wishlistItems.includes(productId));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }, [userId, productId]);

  useEffect(() => {
    fetchWishlistStatus();
  }, [fetchWishlistStatus]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      // You might want to trigger a login modal here
      alert('Please login to manage wishlist');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isInWishlist ? '/api/wishlist/remove' : '/api/wishlist/add';
      const method = isInWishlist ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          product_id: productId 
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isInWishlist ? 'remove from' : 'add to'} wishlist`);
      }

      // Update local state
      setIsInWishlist(!isInWishlist);

      // Notify parent component
      if (onWishlistUpdate) {
        onWishlistUpdate({
          productId,
          isInWishlist: !isInWishlist,
          action: isInWishlist ? 'remove' : 'add'
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // Revert optimistic update if needed
      await fetchWishlistStatus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`
        relative
        p-2
        bg-white
        rounded-full
        shadow-lg
        transition-all
        duration-200
        ${isLoading ? 'opacity-50' : 'hover:scale-110'}
        ${className}
      `}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isInWishlist ? (
        <HiHeart className="w-5 h-5 text-red-500" />
      ) : (
        <HiOutlineHeart className="w-5 h-5 text-black" />
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
};

export default WishlistButton;