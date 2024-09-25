import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import Login from './Login';
import Signup from './SignUp';
import Upload from './Upload';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute element={MainPage} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/upload" element={<Upload/>} />
    </Routes>
  );
}

export default App;
