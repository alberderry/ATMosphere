// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth(); // Dapatkan status otentikasi

  // Jika terotentikasi, render child routes (Outlet), jika tidak, redirect ke /login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
