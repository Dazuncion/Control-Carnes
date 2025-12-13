import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', nombreNegocio: '' });
  const [error, setError] = useState('');
  
  // Usamos 'api' directamente para evitar que el sistema intente loguear automáticamente
  const { api } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    try {
      // Hacemos la petición de registro
      const res = await api.post('/auth/register', formData);
      
      // Si todo sale bien, mostramos el mensaje del backend ("Revisa tu correo...")
      alert(res.data.msg || "Registro exitoso. Revisa tu correo para activar la cuenta.");
      
      // Redirigimos al Login para que espere a verificar
      navigate('/login');

    } catch (err) {
      // Si hay error, lo mostramos
      setError(err.response?.data?.msg || 'Error al comunicarse con el servidor');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Crear Cuenta 📝</h2>
        
        {/* Mensaje de Error Visual */}
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            type="text" 
            placeholder="Tu Nombre" 
            className="w-full p-2 border rounded outline-none focus:border-green-500"
            required
            onChange={e => setFormData({...formData, nombre: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Nombre del Negocio (Opcional)" 
            className="w-full p-2 border rounded outline-none focus:border-green-500"
            onChange={e => setFormData({...formData, nombreNegocio: e.target.value})} 
          />
          <input 
            type="email" 
            placeholder="Correo" 
            className="w-full p-2 border rounded outline-none focus:border-green-500"
            required
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-2 border rounded outline-none focus:border-green-500"
            required
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 transition">
            Registrarse
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-green-600 font-bold hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}