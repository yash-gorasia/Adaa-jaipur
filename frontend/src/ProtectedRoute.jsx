import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isLogin = localStorage.getItem('isLogin') === 'true';
    const location = useLocation();

    if (!isLogin) {
        return (
            <Navigate 
                to="/login" 
                state={{ 
                    redirectTo: location.pathname,
                    message: 'Please login to access this page' 
                }} 
                replace 
            />
        );
    }

    return children;
};

export default ProtectedRoute;