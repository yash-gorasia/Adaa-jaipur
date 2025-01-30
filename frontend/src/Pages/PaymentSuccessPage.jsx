import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccessPage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center">
            <h1 className="text-3xl font-light text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-8">Thank you for your purchase.</p>
            <Link
                to="/"
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-900 transition-colors"
            >
                Continue Shopping
            </Link>
        </div>
    );
};

export default PaymentSuccessPage;