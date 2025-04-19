import React, { createContext, useContext, useState } from 'react';
import axiosInstance from '../../axiosConfig';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const getInitialUser = () => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Failed to parse user data:', error);
            localStorage.removeItem('user');
            return null;
        }
    };

    const [user, setUser] = useState(getInitialUser);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    const loginAction = async (data) => {
        try {
            console.log('Login request payload:', data);
            const response = await axiosInstance.post('/login', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Full API response:', response);
            console.log('Response data:', response.data);

            if (response.status === 200 || response.status === 201) {
                const authToken = response.data.token;
                if (!authToken) {
                    console.error('Token not found in:', response.data);
                    throw new Error('No authentication token received.');
                }

                const userData = {
                    id: response.data.id,
                    username: response.data.username,
                    email: response.data.email || '',
                    roles: response.data.roles || ['USER'],
                };

                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('token', authToken);
                localStorage.setItem('user', JSON.stringify(userData));

                setIsAuthenticated(true);
                setToken(authToken);
                setUser(userData);

                console.log('Login successful, user roles:', userData.roles);
                return userData.roles;
            }
            throw new Error(response.data?.error || 'Login failed');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Network Error. Please check your connection or server status.';
            console.error('Login error details:', {
                error: err,
                response: err.response,
                request: err.request,
                message: errorMsg,
            });
            throw new Error(errorMsg);
        }
    };

    const logOut = async () => {
        try {
            await axiosInstance.post('/logout', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error('Logout error:', err);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        setUser(null);
        setToken('');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            token,
            user,
            roles: user?.roles || [],
            loginAction,
            logOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
export const useAuth = () => {
    return useContext(AuthContext);
};