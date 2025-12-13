import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmail() {
    const { token } = useParams(); 
    const { api } = useContext(AuthContext);
    const [status, setStatus] = useState('loading'); 

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                await api.get(`/auth/verify/${token}`);
                setStatus('success');
            } catch (error) {
                setStatus('error');
            }
        };
        verifyAccount();
    }, [token, api]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">

                {status === 'loading' && (
                    <>
                        <Loader className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4"/>
                        <h2 className="text-xl font-bold text-slate-700">Verificando...</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">¡Cuenta Activada!</h2>
                        <p className="text-slate-500 mb-6">Ya puedes acceder a tu panel.</p>
                        <Link to="/login" className="block w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-600 transition">
                            Ir a Iniciar Sesión
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Enlace Inválido</h2>
                        <p className="text-slate-500 mb-6">El token ha expirado o no existe.</p>
                        <Link to="/register" className="text-blue-500 font-bold underline">
                            Registrarse nuevamente
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}