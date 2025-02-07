import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, Heart, ShoppingBag, Share2, Plus, Minus } from 'lucide-react';
import Header from '../Components/Shared/Header';
import ImageLightbox from '../Components/ProductPage/ImageLightbox';
import useImageGallery from '../Components/ProductPage/useImageGallery';
import RecommendedProducts from "../Components/Shared/recommended-products";
import { saveViewedProduct } from '../Components/Shared/product-storage-utils';
import CompactServiceBadge from '../Components/Shared/CompactServiceBadge';
import Alert from '../Components/Shared/Alert';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';
import FloatingChat from '../Components/Shared/Chatbot';
import Reviews from '../Components/ProductPage/Reviews';

const ProductPage = () => {
    const location = useLocation();
    const productId = location.state?.productId || new URLSearchParams(location.search).get("productId"); const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [openSection, setOpenSection] = useState('details');
    const [wishlistMessage, setWishlistMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [wishlist, setWishlist] = useState([]); // Track wishlisted products
    const [forceUpdate, setForceUpdate] = useState(false);
    const {
        currentImageIndex,
        setCurrentImageIndex,
        isLightboxOpen,
        handlePrevImage,
        handleNextImage,
        openLightbox,
        closeLightbox
    } = useImageGallery(product?.image || []);
    const url = window.location.href; // Gets the current page URL
    const text = "Check out this amazing product on Adaa Jaipur";
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text)
    const loggedIn = localStorage.getItem('isLogin');
    const userId = localStorage.getItem('userId');
    const openShare = (platform) => {
        const text = "Check out this product!";
        const productId = "12345";
        const baseUrl = "https://adaa-jaipur.onrender.com/";
        const url = `${baseUrl}/product?productId=${encodeURIComponent(productId)}`;

        const shareUrls = {
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], "_blank");
        } else {
            console.error("Unsupported platform.");
        }
    };

    const shareLink = (text, productId) => {
        if (navigator.share) {
            navigator.share({
                title: text,
                url: `https://adaa-jaipur.onrender.com/product?productId=${encodeURIComponent(productId)}`,
            }).catch((error) => console.error("Error sharing:", error));
        } else {
            document.getElementById("shareOptions").style.display = "block"; // Show buttons
        }
    };

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await fetch(`/api/wishlist/${userId}`);
                const data = await response.json();
                setWishlist(data.wishlistItems);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
                setAlertMessage({ message: 'Failed to fetch wishlist.', type: 'error' });
            }
        };

        if (userId) {
            fetchWishlist();
        }
    }, [userId, forceUpdate]); // Add forceUpdate as a dependency

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleWishlist = async (productId, e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const isInWishlist = wishlist.some(
                (item) => item.product_id && item.product_id._id === productId
            );

            if (isInWishlist) {
                // Remove from wishlist
                const response = await fetch('/api/wishlist/remove', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, product_id: productId }),
                });

                if (response.ok) {
                    setWishlist((prev) =>
                        prev.filter((item) => item.product_id && item.product_id._id !== productId)
                    );
                    setAlertMessage({ message: 'Removed from wishlist!', type: 'success' });
                } else {
                    throw new Error('Failed to remove from wishlist');
                }
            } else {
                // Add to wishlist
                const response = await fetch('/api/wishlist/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, product_id: productId }),
                });

                if (response.ok) {
                    const newWishlistItem = await response.json();

                    // Add to wishlist state
                    setWishlist((prev) => [...prev, newWishlistItem]);

                    // Update the button color immediately
                    setAlertMessage({ message: 'Added to wishlist!', type: 'success' });
                } else {
                    throw new Error('Failed to add to wishlist');
                }
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setAlertMessage({ message: 'Failed to update wishlist.', type: 'error' });
        }
        setForceUpdate(!forceUpdate); // Trigger re-render
    };
    // Add to cart function
    const addToCart = async (productId, e) => {
        e.stopPropagation();
        if (!loggedIn) {
            setAlertMessage({ message: 'Please login to add to cart', type: 'error' });
            return;
        }

        if (!selectedSize) {
            setAlertMessage({ message: 'Please select a size', type: 'error' });
            return;
        }

        // Check if the selected size is in stock
        const selectedSizeData = product.sizes.find(size => size.size === selectedSize);
        if (!selectedSizeData || selectedSizeData.stock === 0) {
            setAlertMessage({ message: 'Selected size is out of stock', type: 'error' });
            return;
        }

        // Check if the requested quantity exceeds available stock
        if (quantity > selectedSizeData.stock) {
            setAlertMessage({ message: `Only ${selectedSizeData.stock} items available in this size`, type: 'error' });
            return;
        }

        try {
            const response = await fetch('/api/cart/addToCart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity,
                    size: selectedSize,
                }),
            });

            if (response.ok) {
                setAlertMessage({ message: 'Product added to cart', type: 'success' });
                window.dispatchEvent(new Event('cartUpdated'));

            } else {
                const errorData = await response.json();
                setAlertMessage({ message: errorData.message || 'Failed to add product to cart', type: 'error' });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            setAlertMessage({ message: 'Server error. Please try again later.', type: 'error' });
        }
    };

    // Add to wishlist function
    const addToWishlist = async (productId, e) => {
        e.stopPropagation();
        if (!loggedIn) {
            setWishlistMessage('Please login to add to wishlist');
            setTimeout(() => setWishlistMessage(''), 2000);
            return;
        }
        try {
            const user_id = userId;
            const response = await fetch('/api/wishlist/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, product_id: productId }),
            });

            if (response.ok) {
                setWishlistMessage('Product added to wishlist');
                setTimeout(() => setWishlistMessage(''), 2000);
            } else {
                setWishlistMessage('Product already in wishlist');
                setTimeout(() => setWishlistMessage(''), 2000);
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
        }
    };

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log('Fetching product data for productId:', productId); // Debugging
                const response = await fetch(`/api/products/fetchProductById/${productId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch product: ${response.statusText}`);
                }
                const data = await response.json();
                console.log('Product data received:', data); // Debugging
                setProduct(data.product);
                saveViewedProduct(productId, data.product.categoryId);
            } catch (err) {
                console.error('Error fetching product:', err); // Debugging
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        } else {
            setError('Product ID is missing');
            setLoading(false);
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header transparent={false} />
                {alertMessage && (
                    <Alert
                        message={alertMessage.message}
                        type={alertMessage.type}
                        onClose={() => setAlertMessage(null)}
                    />
                )}
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Header transparent={false} />
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="text-lg text-gray-800">{error}</div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white">
                <Header transparent={false} />
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="text-lg text-gray-800">Product not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header transparent={false} />
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 md:mt-[5%]">
                <FloatingChat pageType="product" productId={product._id} />
                <div className="lg:grid lg:grid-cols-2 lg:gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <div className="relative aspect-[3/4] bg-gray-50">
                            <img
                                src={product.image[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover cursor-zoom-in"
                                onClick={openLightbox}
                            />
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                            {product.image.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative flex-shrink-0 w-20 aspect-[3/4] ${currentImageIndex === idx ? 'ring-2 ring-black' : 'ring-1 ring-gray-200'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`View ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="mt-8 lg:mt-0">
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">{product.name}</h1>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-2xl font-light">₹{product.CurrentPrice}</span>
                            {product.discount && (
                                <>
                                    <span className="text-sm text-gray-500 line-through">₹{product.MRP}</span>
                                    <span className="text-sm text-green-600">
                                        {Math.round((1 - product.CurrentPrice / product.MRP) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Sizes */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium mb-4">Select Size</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {product.sizes.map((size, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedSize(size.size)}
                                        disabled={size.stock === 0}
                                        className={`
                                            relative h-12 border transition-all
                                            ${selectedSize === size.size
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }
                                            ${size.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        {size.size}

                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium mb-4">Quantity</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                                    className="p-2 border border-gray-200 hover:border-gray-300 rounded-full"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(prev => prev + 1)}
                                    className="p-2 border border-gray-200 hover:border-gray-300 rounded-full"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-row gap-3 mb-8">
                            <button
                                onClick={(e) => addToCart(product._id, e)}
                                className="flex-1 bg-black text-white h-12 px-6 hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={18} />
                                Add to Cart
                            </button>
                            <button
                                className="flex items-center justify-center h-12 w-12 border border-gray-200 hover:border-gray-300"
                                onClick={(e) => toggleWishlist(product._id, e)}
                            >
                                {wishlist.some((item) => item.product_id && item.product_id._id === product._id) ? (
                                    <HiHeart size={20} className="text-red-500" />
                                ) : (
                                    <HiOutlineHeart size={20} className="text-black" />
                                )}
                            </button>
                            <button
                                onClick={() => shareLink("Check out this product!", product._id)}
                                className="flex items-center justify-center h-12 w-12 border border-gray-200 hover:border-gray-300"
                            >
                                <Share2 size={18} />
                            </button>

                        </div>
                        <CompactServiceBadge className='m-auto w-full' />

                        {/* Product Details */}
                        <div className="border-t border-gray-200">
                            <button
                                onClick={() => setOpenSection(openSection === 'details' ? null : 'details')}
                                className="w-full py-4 flex justify-between items-center"
                            >
                                <span className="text-sm font-medium">Product Details</span>
                                <ChevronDown
                                    size={18}
                                    className={`transition-transform ${openSection === 'details' ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {openSection === 'details' && (
                                <div className="pb-6 grid grid-cols-2 gap-y-4 text-sm">
                                    {Object.entries({
                                        'Fabric Care': product.FabricCare,
                                        'Pattern': product.Pattern,
                                        'Type': product.type,
                                        'Fabric': product.Fabric,
                                        'Length Type': product.lengthType,
                                        'Ideal For': product.idealFor,
                                        'Style': product.style,
                                        'Neck': product.neck,
                                        'Sleeve': product.sleeve
                                    }).map(([key, value]) => value && (
                                        <div key={key}>
                                            <span className="text-gray-500 block">{key}</span>
                                            <span className="text-gray-900">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <span className="text-gray-500 block">Description</span>
                            <p className="text-base text-black-500">{product.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <RecommendedProducts categoryId={product.category_id} currentproductid={product._id} />
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <ImageLightbox
                    images={product.image}
                    currentIndex={currentImageIndex}
                    onClose={closeLightbox}
                    onNext={handleNextImage}
                    onPrev={handlePrevImage}
                />
            )}

            {/* Wishlist Message */}
            {wishlistMessage && (
                <div className="fixed bottom-4 md:mb-[0%] mb-[12%] left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black text-white text-sm rounded-full shadow-lg">
                    {wishlistMessage}
                </div>
            )}

            {/* Alert Message */}
            {alertMessage && (
                <Alert
                    message={alertMessage.message}
                    type={alertMessage.type}
                    onClose={() => setAlertMessage(null)}
                />
            )}
            {console.log("product is ", product._id)}
            <Reviews product_id={product._id} />
        </div>
    );
};

export default ProductPage;