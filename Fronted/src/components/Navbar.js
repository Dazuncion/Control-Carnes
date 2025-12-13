import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, FileSpreadsheet, LogOut } from 'lucide-react';

export default function Navbar() {
  const location = useLocation(); 
  const { logout } = useContext(AuthContext); 

  const menu = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { path: '/ventas', icon: ShoppingCart, label: 'Ventas' },
    { path: '/compras', icon: Package, label: 'Compras' },
    { path: '/reportes', icon: FileSpreadsheet, label: 'Reportes' }
  ];

  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-t fixed bottom-0 w-full px-4 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
      
      {/* Items del Menú Principal */}
      {menu.map(item => (
        <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive(item.path) ? 'text-slate-900 -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}
        >
            <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
            <span className={`text-[9px] font-bold uppercase transition-opacity duration-300 ${isActive(item.path) ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {item.label}
            </span>
        </Link>
      ))}

      {/* Separador vertical pequeño */}
      <div className="h-8 w-px bg-slate-100 mx-1"></div>

      {/* Botón de Cerrar Sesión (Diferenciado en Rojo) */}
      <button 
        onClick={logout} 
        className="flex flex-col items-center gap-1 p-2 text-red-300 transition-all hover:text-red-500 active:scale-95"
        title="Cerrar Sesión"
      >
        <LogOut size={24} strokeWidth={2} />
      </button>

    </nav>
  );
}