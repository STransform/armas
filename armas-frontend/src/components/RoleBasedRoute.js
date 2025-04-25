import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, roles } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const hasRequiredRole = roles.some((role) => allowedRoles.includes(role));
    if (!hasRequiredRole) {
        return <Navigate to="/404" />; // Redirect to 404 if user lacks required role
    }

    return children;
};

export default RoleBasedRoute;