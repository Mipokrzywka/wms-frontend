import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Login from './pages/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Przechowujemy uprawnienie jako zwykły tekst (string), domyślnie pusty
  const [permission, setPermission] = useState(localStorage.getItem('userPermission') || '');

  const handleLogin = (userToken, userPermission) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('userPermission', userPermission); // Zapisujemy np. "Access:All"
    setToken(userToken);
    setPermission(userPermission);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userPermission');
    setToken(null);
    setPermission('');
  };
  console.log("AKTUALNE UPRAWNIENIE W APP:", permission);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />

        {/* Przekazujemy string uprawnienia do Layoutu */}
        <Route path="/" element={token ? <Layout onLogout={handleLogout} userPermission={permission} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;