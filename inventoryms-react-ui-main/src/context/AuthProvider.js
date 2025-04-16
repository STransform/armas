import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginAction = async ({ username, password }) => {
    try {
      const response = await axios.post('http://localhost:8080/api/v1/login', {
        username,
        password,
      });
      const { token, roles } = response.data;
      const userData = { username, role: roles[0], token };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return roles[0]; // e.g., "ADMIN"
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logoutAction = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loginAction,
    logoutAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;