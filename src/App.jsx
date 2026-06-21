import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Orders from './pages/Orders';
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const [permission, setPermission] = useState(localStorage.getItem('userPermission') || '');

  const handleLogin = (userToken, userPermission) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('userPermission', userPermission);
    setToken(userToken);
    setPermission(userPermission);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userPermission');
    setToken(null);
    setPermission('');
  };
  // console.log("AKTUALNE UPRAWNIENIE W APP:", permission);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />

        <Route path="/" element={token ? <Layout onLogout={handleLogout} userPermission={permission} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;