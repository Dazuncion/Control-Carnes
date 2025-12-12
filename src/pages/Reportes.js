import React from 'react';
import { Download, Users } from 'lucide-react';

export default function Reportes({ producto, exportarExcel, ventas }) {
  return (
    <div className="space-y-5 animate-in fade-in">
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
            <h3 className="font-bold text-lg mb-2">Base de Datos ({producto.toUpperCase()})</h3>
            <p className="text-sm text-slate-400 mb-6">Descarga tu Excel completo.</p>
            <button onClick={exportarExcel} className="bg-emerald-500 text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"><Download size={18}/> Descargar Excel</button>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Users size={18}/> Ranking Clientes</h3>
            {Object.entries(ventas.reduce((acc, v) => { acc[v.cliente] = (acc[v.cliente] || 0) + v.total; return acc; }, {})).sort(([,a],[,b]) => b-a).slice(0,5).map(([name, val], i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b last:border-0 border-slate-50">
                    <div className="flex items-center gap-3"><span className="bg-orange-100 text-orange-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">{i+1}</span><span className="font-medium text-slate-700">{name}</span></div>
                    <span className="font-bold text-slate-900">${val.toFixed(2)}</span>
                </div>
            ))}
        </div>
    </div>
  );
}