import { Navigate, Outlet } from 'react-router-dom';
import React from 'react';
const AdminRoute = () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Check admin status

    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
