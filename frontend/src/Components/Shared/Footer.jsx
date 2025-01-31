import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiHome,
  HiOutlineMenu,
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineSearch
} from 'react-icons/hi';

const Footer = () => {
  const userId = localStorage.getItem('userId');
  const isLogin = localStorage.getItem('isLogin');
  const [activeTab, setActiveTab] = useState('home');
  const [cartItemsCount, setCartItemsCount] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (isLogin && userId) {
        try {
          const response = await fetch(`/api/cart/fetchCartItemsByUserId/${userId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch cart items');
          }
          const cartData = await response.json();
          setCartItemsCount(cartData.length);
        } catch (error) {
          console.error('Error fetching cart items:', error);
        }
      }
    };

    fetchCartItems();
    window.addEventListener('cartUpdated', fetchCartItems);
    return () => {
      window.removeEventListener('cartUpdated', fetchCartItems);
    };
  }, [isLogin, userId]);

  const navItems = [
    {
      name: 'Home',
      icon: HiHome,
      path: '/home',
      key: 'home'
    },
    {
      name: 'Categories',
      icon: HiOutlineMenu,
      path: '/categories',
      key: 'categories'
    },
    {
      name: 'Search',
      icon: HiOutlineSearch,
      path: '/mobilesearch',
      key: 'search'
    },
    {
      name: 'Cart',
      icon: HiOutlineShoppingCart,
      path: '/cart',
      key: 'cart'
    },
    {
      name: 'Wishlist',
      icon: HiOutlineHeart,
      path: '/wishlist',
      key: 'wishlist'
    },
    {
      name: 'Profile',
      icon: HiOutlineUser,
      path: '/profile',
      key: 'profile'
    }
  ];

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white shadow-2xl z-50 border-t border-gray-100">
      <nav className="max-w-screen-xl mx-auto px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={() => setActiveTab(item.key)}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 
                transition-all duration-300 ease-in-out 
                ${isActive || activeTab === item.key
                  ? 'text-blue-900 scale-110'
                  : 'text-gray-600 hover:text-blue-900 hover:scale-110'
                }
              `}
              aria-label={item.name}
            >
              <div className="relative">
                <item.icon size={22} />
                {item.key === 'cart' && isLogin && cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </footer>
  );
};

export default Footer;