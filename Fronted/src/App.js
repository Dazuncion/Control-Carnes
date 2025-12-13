import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';


import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Compras from './pages/Compras';
import Reportes from './pages/Reportes';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import VerifyEmail from './pages/VerifyEmail';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Solo mostrar Navbar si el usuario está logueado */}
        {user && <Navbar />} 
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          
          {/* Rutas Protegidas */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/ventas" element={<PrivateRoute><Ventas /></PrivateRoute>} />
          <Route path="/compras" element={<PrivateRoute><Compras /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}