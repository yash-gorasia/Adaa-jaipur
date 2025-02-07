import React from 'react';
import Header from './Components/Shared/Header';
import './index.css';
import ProductAd from './Components/HomePage/ProductAd';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageCards from './Components/HomePage/ImageCard';
import ServiceCards from './Components/Shared/ServiceCards';
import RecentlyViewedProducts from './Components/Shared/recently-viewed-products';
import FindUsOn from './Components/HomePage/FindUsOn';
// import FeatureCards from './Components/FeatureCards';
import ShopByCategory from './Components/HomePage/ShopByCategory'
import SearchComponent from './Components/Shared/SearchComponent';
import FloatingChat from './Components/Shared/Chatbot';
import Footer from './Components/Shared/Footer';
export default function App() {
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight, // Scrolls down by one viewport height
      behavior: 'smooth', // Smooth scrolling effect
    });
  };
  const userId = localStorage.getItem('userId');
  return (
    <div>
      <Header />
      {/* Add other components here */}
      <ProductAd handleScroll={handleScroll} />
      <ImageCards />
      {/* <Homepagecard/> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecentlyViewedProducts />
      </div>
      <ShopByCategory />
      <ServiceCards />
      {/* <FeatureCards/> */}
      <FindUsOn />
      <FloatingChat userId={userId} pageType={"home"} />
      <Footer />
    </div>

  );
}
// import React from 'react';
// import React from 'react'

// export default function App() {
//   return (
//     <div>App</div>
//   )
// }
