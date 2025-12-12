import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, FileSpreadsheet } from 'lucide-react';

export default function Navbar({ vistaActual, setVistaActual }) {
  const menu = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'ventas', icon: ShoppingCart, label: 'Ventas' },
    { id: 'compras', icon: Package, label: 'Compras' },
    { id: 'reportes', icon: FileSpreadsheet, label: 'Reportes' }
  ];

  return (
    <nav className="bg-white border-t fixed bottom-0 w-full px-6 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
      {menu.map(item => (
        <button key={item.id} onClick={() => setVistaActual(item.id)} className={`flex flex-col items-center gap-1 p-2 transition-all ${vistaActual === item.id ? 'text-slate-900 -translate-y-1' : 'text-slate-300'}`}>
            <item.icon size={26} strokeWidth={vistaActual === item.id ? 2.5 : 2} />
            <span className={`text-[9px] font-bold uppercase ${vistaActual === item.id ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}