import axios from 'axios';
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [roles, setRoles] = useState(JSON.parse(localStorage.getItem('roles')) || []);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    const loginAction = async (data) => {
        try {
            const baseURL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
            const response = await axios.post(`${baseURL}/login`, data);
            if (response.status === 200 || response.status === 201) {
                const { token, roles, username } = response.data;
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('token', token);
                localStorage.setItem('roles', JSON.stringify(roles));
                setIsAuthenticated(true);
                setUser({ username });
                setToken(token);
                setRoles(roles);
                return roles; // Return roles for redirection
            }
            throw new Error(response.message);
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    };

    const logOut = () => {
        setUser(null);
        setToken('');
        setRoles([]);
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('roles');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, user, roles, loginAction, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};