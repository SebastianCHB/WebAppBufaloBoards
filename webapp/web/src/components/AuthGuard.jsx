import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AuthGuard({ allowedRoles }) {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet />;
}