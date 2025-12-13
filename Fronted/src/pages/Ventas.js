import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext'; // 1. Importar Contexto
import { INITIAL_VENTA, PRODUCTOS } from '../data/config'; // Importar config
import { Edit, Trash2, Search } from 'lucide-react';

export default function Ventas() {
  // 2. Obtener 'api' del contexto (automáticamente trae el token)
  const { api } = useContext(AuthContext);

  // 3. Estados Locales (antes venían de App.js)
  const [ventas, setVentas] = useState([]);
  const [formVenta, setFormVenta] = useState(INITIAL_VENTA);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  
  // Estados para interfaz
  const [producto] = useState('pollo'); // Configurable si manejas pestañas
  const config = PRODUCTOS[producto];

  // 4. Cargar Ventas al iniciar
  const cargarVentas = async () => {
    try {
      const res = await api.get('/ventas');
      setVentas(res.data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  // 5. Lista de Clientes (Extraída de ventas pasadas)
  const listaClientes = useMemo(() => {
    return [...new Set(ventas.map(v => v.cliente))];
  }, [ventas]);

  // 6. Procesar Venta (Crear o Editar)
  const procesarVenta = async () => {
    if (!formVenta.cliente || !formVenta.pesoBruto || !formVenta.precioLb) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    // Cálculos
    const pesoBruto = parseFloat(formVenta.pesoBruto);
    const tara = formVenta.tipoEnvase === 'gaveta' 
      ? (parseFloat(formVenta.cantidadGavetas || 0) * parseFloat(formVenta.pesoPorGaveta || 0)) 
      : 0;
    
    const pesoNeto = (pesoBruto - tara) * config.merma;
    const totalPagar = pesoNeto * parseFloat(formVenta.precioLb);
    
    const nuevaVenta = {
      ...formVenta,
      peso: pesoNeto.toFixed(2),
      montoPagado: formVenta.tipoPago === 'total' ? totalPagar : parseFloat(formVenta.montoPagado || 0),
      total: totalPagar,
      saldo: totalPagar - (formVenta.tipoPago === 'total' ? totalPagar : parseFloat(formVenta.montoPagado || 0))
    };

    try {
      if (modoEdicion) {
        await api.put(`/ventas/${idEdicion}`, nuevaVenta);
        setModoEdicion(false);
        setIdEdicion(null);
      } else {
        await api.post('/ventas', nuevaVenta);
      }
      setFormVenta(INITIAL_VENTA); // Resetear formulario
      cargarVentas(); // Recargar lista
    } catch (error) {
      alert("Error guardando venta: " + (error.response?.data?.message || error.message));
    }
  };

  // 7. Eliminar Venta
  const eliminarVenta = async (id) => {
    if(!window.confirm("¿Seguro que deseas eliminar esta venta?")) return;
    try {
      await api.delete(`/ventas/${id}`);
      cargarVentas();
    } catch (error) {
      alert("Error eliminando: " + error.message);
    }
  };

  return (
    <div className="space-y-5 animate-in slide-in-from-right p-4 pb-24">
        {/* Formulario */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex gap-2 items-center text-slate-800">
                <span className="text-2xl">{config.emoji}</span> Venta {config.label}
            </h3>
            <div className="space-y-4">
                <div className="relative">
                    <input 
                        list="clientes" 
                        value={formVenta.cliente} 
                        onChange={e=>setFormVenta({...formVenta, cliente: e.target.value})} 
                        placeholder="Cliente" 
                        className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none uppercase"
                    />
                    <datalist id="clientes">{listaClientes.map((c,i)=><option key={i} value={c}/>)}</datalist>
                </div>
                
                <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button onClick={()=>setFormVenta({...formVenta, tipoEnvase: 'funda'})} className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase transition-all ${formVenta.tipoEnvase === 'funda' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>Funda/Gancho</button>
                    {producto === 'pollo' && (
                        <button onClick={()=>setFormVenta({...formVenta, tipoEnvase: 'gaveta'})} className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase transition-all ${formVenta.tipoEnvase === 'gaveta' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>Gaveta</button>
                    )}
                </div>

                {formVenta.tipoEnvase === 'gaveta' && (
                    <div className="flex gap-3 bg-slate-100 p-2 rounded-xl">
                        <div className="flex-1"><input type="number" placeholder="# Gav" value={formVenta.cantidadGavetas} onChange={e=>setFormVenta({...formVenta, cantidadGavetas: e.target.value})} className="w-full bg-white p-2 rounded-lg font-bold text-center outline-none"/></div>
                        <div className="flex-1"><input type="number" placeholder="Peso U." value={formVenta.pesoPorGaveta} onChange={e=>setFormVenta({...formVenta, pesoPorGaveta: e.target.value})} className="w-full bg-white p-2 rounded-lg font-bold text-center outline-none"/></div>
                    </div>
                )}

                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 ml-2">PESO BRUTO</label>
                        <input type="number" placeholder="0.00" value={formVenta.pesoBruto} onChange={e=>setFormVenta({...formVenta, pesoBruto: e.target.value})} className="w-full bg-slate-50 p-3 rounded-2xl text-xl font-black outline-none"/>
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 ml-2">PRECIO</label>
                        <input type="number" placeholder="$" value={formVenta.precioLb} onChange={e=>setFormVenta({...formVenta, precioLb: e.target.value})} className="w-full bg-slate-50 p-3 rounded-2xl text-xl font-black outline-none"/>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl text-white flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-slate-400">TOTAL</p>
                        {/* Cálculo visual aproximado en tiempo real */}
                        <p className="text-2xl font-black">
                           ${ (((parseFloat(formVenta.pesoBruto) || 0) - (formVenta.tipoEnvase === 'gaveta' ? (parseFloat(formVenta.cantidadGavetas)||0)*(parseFloat(formVenta.pesoPorGaveta)||0) : 0)) * config.merma * (parseFloat(formVenta.precioLb)||0)).toFixed(2) }
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400">NETO APROX</p>
                        <p className="text-xl font-bold text-emerald-400">
                            { ((parseFloat(formVenta.pesoBruto) || 0) - (formVenta.tipoEnvase === 'gaveta' ? (parseFloat(formVenta.cantidadGavetas)||0)*(parseFloat(formVenta.pesoPorGaveta)||0) : 0)) * config.merma } lb
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                        <button onClick={()=>setFormVenta({...formVenta, tipoPago: 'total'})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 ${formVenta.tipoPago === 'total' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400'}`}>PAGADO</button>
                        <button onClick={()=>setFormVenta({...formVenta, tipoPago: 'abono'})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 ${formVenta.tipoPago === 'abono' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}>DEBE</button>
                </div>
                {formVenta.tipoPago === 'abono' && <input type="number" placeholder="Abono ($)" value={formVenta.montoPagado} onChange={e=>setFormVenta({...formVenta, montoPagado: e.target.value})} className="w-full border-2 border-red-100 p-3 rounded-xl font-bold text-red-600 outline-none"/>}
                
                <button onClick={procesarVenta} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition">
                    {modoEdicion ? 'ACTUALIZAR VENTA' : 'GUARDAR VENTA'}
                </button>
            </div>
        </div>

        {/* Listado de Ventas */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <span className="font-bold text-slate-500 text-xs uppercase">Historial Reciente</span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                    <Search size={14} className="text-slate-400"/>
                    <input type="text" placeholder="Buscar..." value={filtroBusqueda} onChange={e=>setFiltroBusqueda(e.target.value)} className="bg-transparent text-right outline-none text-sm font-bold w-24"/>
                </div>
            </div>
            
            {ventas.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No hay ventas registradas hoy</div>
            ) : (
                ventas
                .filter(v => v.cliente && v.cliente.toLowerCase().includes(filtroBusqueda.toLowerCase()))
                .slice(-10).reverse().map(v => (
                    <div key={v._id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-slate-50 transition">
                        <div>
                            <p className="font-bold text-slate-800 uppercase">{v.cliente}</p>
                            <p className="text-xs text-slate-400 font-medium">
                                {parseFloat(v.peso).toFixed(2)} lb • <span className="text-slate-600">${parseFloat(v.total).toFixed(2)}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Indicador de Saldo */}
                            {v.saldo > 0.1 ? (
                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                                    -${v.saldo.toFixed(2)}
                                </span>
                            ) : (
                                <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold">PAGADO</span>
                            )}

                            <button onClick={()=> { setFormVenta(v); setModoEdicion(true); setIdEdicion(v._id); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600">
                                <Edit size={16}/>
                            </button>
                            <button onClick={()=> eliminarVenta(v._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}