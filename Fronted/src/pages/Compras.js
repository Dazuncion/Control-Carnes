import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { INITIAL_COMPRA, PRODUCTOS } from '../data/config';
import { Edit, Trash2, Search, DollarSign } from 'lucide-react';

export default function Compras() {
  const { api } = useContext(AuthContext); // Conexión segura a la API

  // Estados locales
  const [compras, setCompras] = useState([]);
  const [formCompra, setFormCompra] = useState(INITIAL_COMPRA);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Configuración del producto (puedes hacerlo dinámico si manejas tabs)
  const [producto] = useState('pollo'); 
  const config = PRODUCTOS[producto];

  // 1. Cargar Compras
  const cargarCompras = async () => {
    try {
      const res = await api.get('/compras');
      setCompras(res.data);
    } catch (error) {
      console.error("Error al cargar compras:", error);
    }
  };

  useEffect(() => {
    cargarCompras();
  }, []);

  // 2. Lista de Proveedores única (basada en el historial)
  const listaProveedores = useMemo(() => {
    return [...new Set(compras.map(c => c.proveedor))].filter(Boolean);
  }, [compras]);

  // 3. Cálculo automático del Peso Neto en tiempo real para el formulario
  const pesoNetoCalculado = useMemo(() => {
    const bruto = parseFloat(formCompra.pesoBruto) || 0;
    const tara = parseFloat(formCompra.pesoTara) || 0;
    return (bruto - tara).toFixed(2);
  }, [formCompra.pesoBruto, formCompra.pesoTara]);

  // 4. Procesar Guardado (Crear o Editar)
  const procesarCompra = async () => {
    if (!formCompra.proveedor || !formCompra.pesoBruto || !formCompra.precioLb) {
      alert("Por favor completa los datos del proveedor, peso y precio.");
      return;
    }

    const pesoNeto = parseFloat(pesoNetoCalculado);
    const totalPagar = pesoNeto * parseFloat(formCompra.precioLb);
    
    // Si paga total, el abono es igual al total. Si es abono, usa el monto ingresado.
    const montoAbonado = formCompra.tipoPago === 'total' 
      ? totalPagar 
      : parseFloat(formCompra.montoPagado || 0);

    const nuevaCompra = {
      ...formCompra,
      pesoNetoCalculado: pesoNeto,
      total: totalPagar,
      montoPagado: montoAbonado,
      saldo: totalPagar - montoAbonado
    };

    try {
      if (modoEdicion) {
        await api.put(`/compras/${idEdicion}`, nuevaCompra);
        setModoEdicion(false);
        setIdEdicion(null);
      } else {
        await api.post('/compras', nuevaCompra);
      }
      setFormCompra(INITIAL_COMPRA);
      cargarCompras();
    } catch (error) {
      alert("Error guardando compra: " + (error.response?.data?.message || error.message));
    }
  };

  // 5. Eliminar Compra
  const eliminarCompra = async (id) => {
    if (!window.confirm("¿Estás seguro de borrar esta compra?")) return;
    try {
      await api.delete(`/compras/${id}`);
      cargarCompras();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  // 6. Preparar Edición
  const cargarEdicion = (compra) => {
    setFormCompra(compra);
    setModoEdicion(true);
    setIdEdicion(compra._id); // MongoDB usa _id
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-5 animate-in slide-in-from-right p-4 pb-24">
        {/* --- FORMULARIO --- */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
                <span className="text-2xl">{config.emoji}</span> Registrar Compra
            </h3>
            
            <div className="space-y-4">
                {/* Proveedor */}
                <div className="relative">
                    <input 
                        list="proveedores" 
                        value={formCompra.proveedor} 
                        onChange={e=>setFormCompra({...formCompra, proveedor: e.target.value})} 
                        placeholder="Nombre del Proveedor" 
                        className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none uppercase text-slate-700"
                    />
                    <datalist id="proveedores">
                        {listaProveedores.map((p,i)=><option key={i} value={p}/>)}
                    </datalist>
                </div>

                {/* Calculadora de Peso */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <input type="number" placeholder="0" value={formCompra.pesoBruto} onChange={e=>setFormCompra({...formCompra, pesoBruto: e.target.value})} className="w-full bg-white p-2 rounded-xl font-bold text-center outline-none text-slate-700"/>
                            <span className="text-[9px] text-center block text-slate-400 mt-1 font-bold uppercase">Peso Bruto</span>
                        </div>
                        <span className="text-slate-300 font-bold">-</span>
                        <div className="flex-1">
                            <input type="number" placeholder="0" value={formCompra.pesoTara} onChange={e=>setFormCompra({...formCompra, pesoTara: e.target.value})} className="w-full bg-white p-2 rounded-xl font-bold text-center outline-none text-slate-700"/>
                            <span className="text-[9px] text-center block text-slate-400 mt-1 font-bold uppercase">Tara</span>
                        </div>
                        <span className="text-slate-300 font-bold">=</span>
                        <div className="flex-1">
                            <div className="w-full bg-slate-200 p-2 rounded-xl font-black text-center text-slate-800">
                                {pesoNetoCalculado}
                            </div>
                            <span className="text-[9px] text-center block text-slate-400 mt-1 font-bold uppercase">Neto (lb)</span>
                        </div>
                    </div>
                </div>
                
                {/* Cantidad y Precio */}
                <div className="flex gap-3">
                      <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Cantidad</label>
                          <input type="number" placeholder="#" value={formCompra.cantidad} onChange={e=>setFormCompra({...formCompra, cantidad: e.target.value})} className="w-full bg-slate-50 p-3 rounded-2xl font-bold text-lg outline-none"/>
                      </div>
                      <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Precio x Lb</label>
                          <input type="number" placeholder="$" value={formCompra.precioLb} onChange={e=>setFormCompra({...formCompra, precioLb: e.target.value})} className="w-full bg-slate-50 p-3 rounded-2xl font-bold text-lg outline-none"/>
                      </div>
                </div>

                {/* Total Visual */}
                <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold text-slate-400">TOTAL ESTIMADO</span>
                    <span className="text-xl font-black text-slate-800">
                        ${ ((parseFloat(pesoNetoCalculado)||0) * (parseFloat(formCompra.precioLb)||0)).toFixed(2) }
                    </span>
                </div>

                {/* Estado de Pago */}
                <div className="flex gap-2">
                    <button onClick={()=>setFormCompra({...formCompra, tipoPago: 'total'})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${formCompra.tipoPago === 'total' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400'}`}>PAGADO</button>
                    <button onClick={()=>setFormCompra({...formCompra, tipoPago: 'abono'})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${formCompra.tipoPago === 'abono' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}>DEBO</button>
                </div>
                
                {formCompra.tipoPago === 'abono' && (
                    <div className="animate-in slide-in-from-top duration-300">
                        <label className="text-[10px] font-bold text-red-400 ml-2 uppercase">Monto Abonado</label>
                        <input type="number" placeholder="0.00" value={formCompra.montoPagado} onChange={e=>setFormCompra({...formCompra, montoPagado: e.target.value})} className="w-full border-2 border-red-100 bg-red-50/30 p-3 rounded-xl font-bold text-red-600 outline-none"/>
                    </div>
                )}

                <button onClick={procesarCompra} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition transform active:scale-95">
                    {modoEdicion ? 'ACTUALIZAR DATOS' : 'REGISTRAR COMPRA'}
                </button>
            </div>
        </div>
        
        {/* --- HISTORIAL --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <span className="font-bold text-xs text-slate-500 uppercase">Últimas Compras</span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                    <Search size={14} className="text-slate-400"/>
                    <input type="text" placeholder="Buscar..." value={filtroBusqueda} onChange={e=>setFiltroBusqueda(e.target.value)} className="bg-transparent text-right outline-none text-sm font-bold w-20"/>
                </div>
             </div>

             {compras.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">No hay compras registradas</div>
             ) : (
                 compras
                 .filter(c => c.proveedor && c.proveedor.toLowerCase().includes(filtroBusqueda.toLowerCase()))
                 .slice(-10).reverse().map(c => (
                    <div key={c._id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-slate-50 transition">
                        <div>
                            <p className="font-bold text-slate-800 uppercase">{c.proveedor}</p>
                            <p className="text-xs text-slate-400 font-medium">
                                {parseFloat(c.pesoNetoCalculado).toFixed(2)} lb • <span className="text-slate-600">${parseFloat(c.total).toFixed(2)}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Botón de Pagar Saldo Pendiente */}
                            {c.saldo > 0.1 ? (
                                <button 
                                    onClick={()=>{ 
                                        // Aquí podrías abrir un modal de abono si lo implementas, 
                                        // o usar un prompt simple por ahora:
                                        const abono = prompt(`Saldo pendiente: $${c.saldo.toFixed(2)}. \n¿Cuánto deseas abonar?`);
                                        if(abono) {
                                            const nuevoMonto = (c.montoPagado || 0) + parseFloat(abono);
                                            // Actualización rápida local (idealmente haz una ruta específica para abonos)
                                            api.put(`/compras/${c._id}`, { ...c, montoPagado: nuevoMonto, saldo: c.total - nuevoMonto })
                                               .then(() => cargarCompras());
                                        }
                                    }} 
                                    className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-red-200 transition"
                                >
                                    <DollarSign size={10} strokeWidth={4}/> DEBE ${c.saldo.toFixed(2)}
                                </button>
                            ) : (
                                <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold">PAGADO</span>
                            )}

                            <button onClick={()=> cargarEdicion(c)} className="bg-slate-100 p-2 rounded-lg text-slate-500 hover:text-blue-600 transition">
                                <Edit size={16}/>
                            </button>
                            <button onClick={()=> eliminarCompra(c._id)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition">
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