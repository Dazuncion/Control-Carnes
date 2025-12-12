import React from 'react';
import { TrendingUp, TrendingDown, PieChart as IconPieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ stats, config }) {
  return (
    <div className="space-y-5 animate-in fade-in">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm h-32 flex flex-col justify-between border-l-4 border-l-emerald-500">
                <div className="text-emerald-600 bg-emerald-50 w-fit p-2 rounded-xl"><TrendingUp size={24}/></div>
                <div><p className="text-xs uppercase font-bold text-slate-400">Por Cobrar</p><p className="text-2xl font-black">${stats.cobrar.toFixed(2)}</p></div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm h-32 flex flex-col justify-between border-l-4 border-l-red-500">
                <div className="text-red-600 bg-red-50 w-fit p-2 rounded-xl"><TrendingDown size={24}/></div>
                <div><p className="text-xs uppercase font-bold text-slate-400">Por Pagar</p><p className="text-2xl font-black">${stats.pagar.toFixed(2)}</p></div>
            </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2"><IconPieChart size={16}/> Ventas {config.label}</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.grafico}>
                        <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#334155" stopOpacity={0.3}/><stop offset="95%" stopColor="#334155" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`}/>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                        <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}/>
                        <Area type="monotone" dataKey="Ventas" stroke="#334155" fillOpacity={1} fill="url(#grad)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
}