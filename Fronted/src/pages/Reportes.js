import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PRODUCTOS } from '../data/config';
import { Download, Users, FileText } from 'lucide-react';
import * as XLSX from 'xlsx'; 

export default function Reportes() {
  const { api } = useContext(AuthContext);
  const [ventas, setVentas] = useState([]);
  

  const config = PRODUCTOS['pollo'];

  useEffect(() => {
    const cargarDatos = async () => {
        try {
            const res = await api.get('/ventas');
            setVentas(res.data);
        } catch (error) {
            console.error("Error al cargar ventas para reporte");
        }
    };
    cargarDatos();
  }, [api]);

 
  const exportarExcel = () => {
    if (ventas.length === 0) {
        alert("No hay datos para exportar");
        return;
    }


    const dataExport = ventas.map(v => ({
      Fecha: v.fecha ? v.fecha.split('T')[0] : '',
      Cliente: v.cliente,
      Producto: config.label,
      'Peso Bruto': v.pesoBruto,
      'Peso Neto': v.peso,
      'Precio Lb': v.precioLb,
      Total: v.total,
      Abonado: v.montoPagado,
      Saldo: v.saldo,
      Estado: v.saldo > 0.1 ? 'Pendiente' : 'Pagado'
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, `Reporte_Control_Carnes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Ranking de mejores clientes
  const rankingClientes = Object.entries(
    ventas.reduce((acc, v) => { 
        acc[v.cliente] = (acc[v.cliente] || 0) + (v.total || 0); 
        return acc; 
    }, {})
  )
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5); // Top 5

  return (
    <div className="space-y-5 animate-in fade-in p-4 pb-24">
        {/* Encabezado y Botón de Descarga */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <FileText size={20}/> Base de Datos ({config.label})
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                    Tienes {ventas.length} ventas registradas en total.
                </p>
                
                <button 
                    onClick={exportarExcel} 
                    className="bg-emerald-500 hover:bg-emerald-400 transition text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                    <Download size={18}/> Descargar Excel
                </button>
            </div>
            {/* Adorno de fondo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-slate-800 rounded-full opacity-50 blur-2xl"></div>
        </div>

        {/* Ranking */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                <Users size={18} className="text-orange-500"/> Mejores Clientes
            </h3>
            
            {rankingClientes.length === 0 ? (
                <p className="text-center text-slate-400 text-sm">Aún no hay datos suficientes</p>
            ) : (
                rankingClientes.map(([name, val], i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b last:border-0 border-slate-50">
                        <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${
                                i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                i === 1 ? 'bg-slate-100 text-slate-600' : 
                                'bg-orange-50 text-orange-600'
                            }`}>
                                {i + 1}
                            </span>
                            <span className="font-bold text-slate-700 uppercase text-sm">{name}</span>
                        </div>
                        <span className="font-black text-slate-900 text-sm">${val.toFixed(2)}</span>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}