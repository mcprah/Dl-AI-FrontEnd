import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ element: Component }) {
  const isAuthenticated = localStorage.getItem('userauth');

  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
