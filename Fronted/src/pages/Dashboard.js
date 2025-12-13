import React, { useEffect, useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PRODUCTOS } from '../data/config';
import { TrendingUp, TrendingDown, PieChart as IconPieChart, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { api, user } = useContext(AuthContext);
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuración (puedes cambiar 'pollo' si haces el sistema dinámico)
  const config = PRODUCTOS['pollo']; 

  // Cargar datos al entrar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVentas, resCompras] = await Promise.all([
          api.get('/ventas'),
          api.get('/compras')
        ]);
        setVentas(resVentas.data);
        setCompras(resCompras.data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  // Cálculos de Estadísticas (Memoizados para rendimiento)
  const stats = useMemo(() => {
    const porCobrar = ventas.reduce((acc, v) => acc + (parseFloat(v.saldo) || 0), 0);
    const porPagar = compras.reduce((acc, c) => acc + (parseFloat(c.saldo) || 0), 0);

    // Preparar datos para el gráfico (agrupar ventas por fecha)
    const ventasPorFecha = ventas.reduce((acc, v) => {
      const fecha = v.fecha ? v.fecha.substring(5, 10) : 'N/A'; // Formato MM-DD
      acc[fecha] = (acc[fecha] || 0) + (v.total || 0);
      return acc;
    }, {});

    const graficoData = Object.keys(ventasPorFecha)
      .slice(-7) // Últimos 7 días con ventas
      .map(fecha => ({ name: fecha, Ventas: ventasPorFecha[fecha] }));

    return { cobrar: porCobrar, pagar: porPagar, grafico: graficoData };
  }, [ventas, compras]);

  if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-slate-400"/></div>;

  return (
    <div className="space-y-5 animate-in fade-in p-4 pb-24">
        {/* Saludo Personalizado */}
        <div className="mb-2">
            <h2 className="text-xl font-bold text-slate-800">Hola, {user?.nombre || 'Usuario'} 👋</h2>
            <p className="text-sm text-slate-400">Resumen de tu negocio hoy.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {/* Tarjeta Por Cobrar */}
            <div className="bg-white p-5 rounded-3xl shadow-sm h-32 flex flex-col justify-between border-l-4 border-l-emerald-500">
                <div className="text-emerald-600 bg-emerald-50 w-fit p-2 rounded-xl">
                    <TrendingUp size={24}/>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Por Cobrar</p>
                    <p className="text-2xl font-black text-slate-800">${stats.cobrar.toFixed(2)}</p>
                </div>
            </div>

            {/* Tarjeta Por Pagar */}
            <div className="bg-white p-5 rounded-3xl shadow-sm h-32 flex flex-col justify-between border-l-4 border-l-red-500">
                <div className="text-red-600 bg-red-50 w-fit p-2 rounded-xl">
                    <TrendingDown size={24}/>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Por Pagar</p>
                    <p className="text-2xl font-black text-slate-800">${stats.pagar.toFixed(2)}</p>
                </div>
            </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-6 text-sm flex items-center gap-2">
                <IconPieChart size={16}/> Tendencia Ventas ({config.label})
            </h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.grafico}>
                        <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#334155" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#334155" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} tick={{fill: '#94a3b8'}}/>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                        <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} cursor={{stroke: '#cbd5e1', strokeWidth: 1}}/>
                        <Area type="monotone" dataKey="Ventas" stroke="#334155" fillOpacity={1} fill="url(#grad)" strokeWidth={3} activeDot={{r: 6}} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
}