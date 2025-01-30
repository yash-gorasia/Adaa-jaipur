import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoIosSearch, IoIosClose } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { IoIosHeart } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import logo from "../../Images/logo.png";
import SuggestionCard from './SuggestionCard'; // Import the SuggestionCard component

export default function NavBar({ transparent = true }) {
  const [scroll, setScroll] = useState(!transparent);
  const [dropdown, setDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
    const [cartItemsCount, setCartItemsCount] = useState(0);
  const isLogin = localStorage.getItem('isLogin') === 'true';
  const userId = localStorage.getItem('userId');

  const navigate = useNavigate();

  useEffect(() => {
    if (transparent) {
      const handleScroll = () => {
        setScroll(window.scrollY > 10);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [transparent]);

  useEffect(() => {
    fetch('/api/categories/getAllCategories')
      .then(response => response.json())
      .then(data => {
        const desiredOrder = ['Kurta', 'Kurta Set', 'Gowns', 'Bottoms', 'Tops'];
        const filteredCategories = data
          .filter(category => desiredOrder.includes(category.category_name))
          .sort((a, b) => desiredOrder.indexOf(a.category_name) - desiredOrder.indexOf(b.category_name));
        setCategories(filteredCategories);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const fetchSubcategories = (categoryId) => {
    if (!subcategories[categoryId]) {
      fetch(`/api/subcategories/getSubcategoriesByCategory/${categoryId}`)
        .then(response => response.json())
        .then(data => {
          setSubcategories(prevState => ({
            ...prevState,
            [categoryId]: data
          }));
        })
        .catch(error => {
          console.error('Error fetching subcategories:', error);
        });
    }
  };

  const handleMouseEnter = (categoryId) => {
    setDropdown(categoryId);
    fetchSubcategories(categoryId);
  };

  const handleMouseLeave = () => {
    setDropdown(null);
  };

  const handleSearchClick = () => {
    setSearchActive(true);
  };

  const handleCancelClick = () => {
    setSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      fetch(`/api/products/fetchProducts?keyword=${query}`)
        .then(response => response.json())
        .then(data => {
          setSearchResults(data);
        })
        .catch(error => {
          console.error('Error fetching search results:', error);
        });
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = () => {
    navigate('/searchlist', { state: { searchQuery, searchResults } });
  };

  const dropdownStyles = `
    absolute left-1/2 -translate-x-1/2 mt-2 min-w-[200px] bg-white shadow-lg rounded-lg 
    opacity-100 visible transform translate-y-0 
    transition-all duration-300 ease-out z-50
    before:content-[''] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 
    before:border-8 before:border-transparent before:border-b-white
    border border-gray-100
  `;

    const dropdownItemStyles = `
    block px-6 py-3 text-black 
    transition-all duration-200 first:rounded-t-lg last:rounded-b-lg
    relative cursor-pointer
    after:absolute after:bottom-1 after:left-1/2 after:w-0 after:h-[2px]
    after:bg-gradient-to-r after:from-amber-400 after:to-yellow-500 
    after:transition-all after:duration-300 after:ease-in-out after:-translate-x-1/2
    hover:after:w-4/5
  `;
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

    // Add event listener for cart updates
    window.addEventListener('cartUpdated', fetchCartItems);

    return () => {
      window.removeEventListener('cartUpdated', fetchCartItems);
    };
  }, [isLogin, userId]);
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 p-4 transition-all duration-300 ease-in-out ${scroll ? 'bg-white shadow-md' : 'bg-transparent hover:bg-black hover:shadow-lg'}`}
    >
      <div className="flex justify-between items-center w-full max-w-screen-xl mx-auto">
        <NavLink to="/" className="flex items-center">
          <img src={logo} alt="logo" className="w-30 h-[10vh]" />
        </NavLink>

        {!searchActive ? (
          <div className="flex gap-12 items-center relative">
            {categories.map(category => (
              <div
                key={category._id}
                onMouseEnter={() => handleMouseEnter(category._id)}
                onMouseLeave={handleMouseLeave}
                className="relative group"
              >
                <NavLink
                  to="/productlist"
                  state={{ categoryId: category._id }}
                  className={`${scroll ? 'nav-item-dark' : 'nav-item-light'}`}
                >
                  {category.category_name}
                </NavLink>
                {dropdown === category._id && subcategories[category._id] && (
                  <div className={dropdownStyles}>
                    {subcategories[category._id].map(subcategory => (
                      <NavLink
                        key={subcategory._id}
                        to="/productlistsub"
                        state={{ categoryId: category._id, subcategoryId: subcategory._id, Category: category.category_name, SubCategory: subcategory.subcategory_name }}
                        className={dropdownItemStyles}
                      >
                        {subcategory.subcategory_name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* <div className="relative">
              <NavLink to="/about" className={`${scroll ? 'nav-item-dark' : 'nav-item-light'}`}>About Us</NavLink>
            </div> */}
          </div>
        ) : (
          <div className="flex-grow mx-4 relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <IoIosSearch className="absolute left-3 top-3 text-gray-500" />
              <IoIosClose
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={handleCancelClick}
              />
            
            {searchResults.length > 0 && (
              <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                {searchResults.map(product => (
                  <SuggestionCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-8 items-center">
        <NavLink to="/wishlist" className={`${scroll ? 'nav-item-dark' : 'nav-item-light'} text-3xl`}>
          <IoIosHeart />
        </NavLink>
        <NavLink to="/cart" className={`${scroll ? 'nav-item-dark' : 'nav-item-light'} text-3xl relative`}>
          <FaCartShopping />
          {isLogin && cartItemsCount > 0 && (
            <span className="absolute -top-3 -right-4 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemsCount}
            </span>
          )}
        </NavLink>
          {isLogin ? (
            <NavLink to="/profile" className={`${scroll ? 'nav-item-dark' : 'nav-item-light'} text-3xl`}>
              <CgProfile />
            </NavLink>
          ) : (
            <NavLink to="/login" className={`${scroll ? 'nav-item-dark' : 'nav-item-light'} text-3xl`}>
              Login
            </NavLink>
          )}
          {!searchActive && (
            <div onClick={handleSearchClick} className={`${scroll ? 'nav-item-dark' : 'nav-item-light'} text-3xl cursor-pointer`}>
              <IoIosSearch />
            </div>
          )}
          {searchActive && (
            <button onClick={handleSearchSubmit} className="bg-gradient-to-r from-amber-200 to-yellow-400 text-black px-4 py-2 rounded-lg">
              Search
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}