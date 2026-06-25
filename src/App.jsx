import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Orders from './pages/Orders';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { token, permissions } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          
          <Route path="users" element={
            <ProtectedRoute requiredPermission="Users:Read"><Users /></ProtectedRoute>
          } />
          <Route path="roles" element={
            <ProtectedRoute requiredPermission="Roles:Read"><Roles /></ProtectedRoute>
          } />
          <Route path="products" element={
            <ProtectedRoute requiredPermission="Products:Read"><Products /></ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute requiredPermission="Orders:Read"><Orders /></ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute requiredPermission="Reports:Read"><Reports /></ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;