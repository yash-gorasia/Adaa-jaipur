import { useState, useEffect } from "react";
import { FiLogOut } from 'react-icons/fi';
import { LayoutList, ShoppingCart, Boxes, PackageCheck, ChevronRight, User, Menu } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ onSelect, selectedKey }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      localStorage.removeItem('userId');
      localStorage.setItem('isLogin', false);
      localStorage.setItem('isAdmin', false);

      navigate('/');
    } catch (err) {
      console.error('Error during logout:', err);
      alert('Logout failed. Please try again.');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: "Categories", key: "categories", icon: <LayoutList size={20} /> },
    { name: "Products", key: "products", icon: <Boxes size={20} /> },
    { name: "Subcategories", key: "subcategories", icon: <PackageCheck size={20} /> },
    { name: "Orders", key: "orders", icon: <ShoppingCart size={20} /> },
  ];

  return (
    <>
      {/* Menu Icon */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Overlay for Mobile */}
      <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden
          ${isExpanded ? 'opacity-100 z-30' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsExpanded(false)}
      />

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 flex flex-col
          ${isExpanded ? 'w-72' : 'w-20'}
          ${isMobile ? (isExpanded ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out
          border-r border-gray-100`}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 
              flex items-center justify-center shadow-lg shadow-blue-600/20 transition-transform duration-300
              hover:scale-105">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
            <div className={`ml-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="font-semibold text-gray-800">Admin Panel</h1>
              <p className="text-xs text-gray-500">Management Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isSelected = selectedKey === item.key;
            const isHovered = hoveredKey === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key);
                  isMobile && setIsExpanded(false);
                }}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`group flex items-center w-full p-4 rounded-xl transition-all duration-200
                  ${isSelected ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <div className={`transition-transform duration-200 ${isHovered ? 'scale-110' : ''}`}>
                  {React.cloneElement(item.icon, {
                    className: `${isSelected ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'}`
                  })}
                </div>
                <span className={`ml-4 text-sm font-medium whitespace-nowrap transition-all duration-300
                  ${isSelected ? 'text-white' : 'text-gray-700'}
                  ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-4 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <FiLogOut size={20} className="text-gray-700 group-hover:text-red-600" />
            <span className={`ml-4 text-sm font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Padding */}
      <div className={`transition-all duration-300 ${!isMobile && (isExpanded ? 'ml-72' : 'ml-20')} pt-20`} />
    </>
  );
};

export default Sidebar;