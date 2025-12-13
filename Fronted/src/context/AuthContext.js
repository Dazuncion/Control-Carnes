import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configuración inicial de Axios
const api = axios.create({
  baseURL: 'https://api-control-carnes.onrender.com' // O tu URL de Render en producción
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
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      return { success: true };
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