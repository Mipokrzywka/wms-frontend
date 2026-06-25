import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('userPermission');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return saved ? [saved] : [];
    }
  });

  const login = (userToken, userPermissions) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('userPermission', JSON.stringify(userPermissions));
    setToken(userToken);
    setPermissions(userPermissions);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userPermission');
    setToken(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{ token, permissions, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);