import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configuración de Axios para producción
const api = axios.create({
  // --- CAMBIO: Usar URL de Render + /api ---
  baseURL: 'https://api-control-carnes.onrender.com/api' 
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      setUser({ token }); 
    } else {
      delete api.defaults.headers.common['x-auth-token'];
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, msg: error.response?.data?.msg || 'Error al entrar' };
    }
  };

  const register = async (datos) => {
    try {
      const res = await api.post('/auth/register', datos);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, msg: error.response?.data?.msg || 'Error al registrarse' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
};