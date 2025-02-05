import React,{ useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Components/Shared/Header';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
    
    // Redirect to appropriate pages based on login and cart status
    useEffect(() => {
        const isLogin = localStorage.getItem('isLogin') === 'true';
        const cartItems = location.state?.cartItems;

        if (!isLogin) {
            navigate('/login', { 
                state: { 
                    redirectTo: '/order-summary',
                    message: 'Please login to proceed with checkout' 
                } 
            });
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            navigate('/cart');
            return;
        }

        // Redirect to order summary page
        navigate('/order-summary', { 
            state: { 
                cartItems, 
                totalAmount: location.state?.totalAmount 
            } 
        });
    }, [location.state, navigate]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Header transparent={false} />
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                <p className="mt-4 text-gray-600">Redirecting to checkout...</p>
            </div>
        </div>
    );
};

export default CheckoutPage;