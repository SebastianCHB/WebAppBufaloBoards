import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requiredRole }) => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    let user = null;

    try {
        user = JSON.parse(userStr);
    } catch (e) {
        localStorage.clear();
        return <Navigate to="/" replace />;
    }

    if (!token || !user) {
        localStorage.clear(); 
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;