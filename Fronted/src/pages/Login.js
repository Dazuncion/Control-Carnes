import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(formData.email, formData.password);
    if (res.success) {
      navigate('/dashboard'); 
    } else {
      setError(res.msg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Iniciar Sesión 🥩</h2>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Correo" className="w-full p-2 border rounded"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Contraseña" className="w-full p-2 border rounded"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded font-bold hover:bg-orange-700 transition">
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta? <Link to="/register" className="text-orange-600 font-bold">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}