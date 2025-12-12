import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function Ventas({ 
  formVenta, setFormVenta, procesarVenta, listaClientes, producto, config, ventas,
  setModoEdicion, setIdEdicion, setTransaccionSeleccionada, setTipoPagoModal, setMostrarPago,
  setItemAEliminar, setTipoEliminacion, setMostrarConfirmacion, filtroBusqueda, setFiltroBusqueda
}) {
  return (
    <div className="space-y-5 animate-in slide-in-from-right">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex gap-2 items-center text-slate-800">
                <span className="text-2xl">{config.emoji}</span> Venta {config.label}
            </h3>
            <div className="space-y-4">
                <input list="clientes" value={formVenta.cliente} onChange={e=>setFormVenta({...formVenta, cliente: e.target.value})} placeholder="Cliente" className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none"/>
                <datalist id="clientes">{listaClientes.map((c,i)=><option key={i} value={c}/>)}</datalist>
                
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
                    <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 ml-2">PESO BRUTO</label><input type="number" placeholder="0.00" value={formVenta.pesoBruto} onChange={e=>setFormVenta({...formVenta, pesoBruto: e.target.value})} className="w-full bg-slate-50 p-3 rounded-2xl text-xl font-black outline-none"/></div>
                    <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 ml-2">PRECIO</label><input type="number" placeholder="$" value={formVenta.precioLb} onChange={e=>setFormVenta({...formVenta, precioLb: e.target.value})} className="w-full bg-slate-50 p-3 rounded-2xl text-xl font-black outline-none"/></div>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl text-white flex justify-between items-center">
                    <div><p className="text-xs font-bold text-slate-400">TOTAL</p><p className="text-2xl font-black">${((parseFloat(formVenta.peso)||0) * (parseFloat(formVenta.precioLb)||0)).toFixed(2)}</p></div>
                    <div className="text-right"><p className="text-xs font-bold text-slate-400">NETO</p><p className="text-xl font-bold text-emerald-400">{formVenta.peso || '0'} lb</p></div>
                </div>
                
                <div className="flex gap-2">
                        <button onClick={()=>setFormVenta({...formVenta, tipoPago: 'total'})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 ${formVenta.tipoPago === 'total' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400'}`}>PAGADO</button>
                        <button onClick={()=>setFormVenta({...formVenta, tipoPago: 'abono'})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 ${formVenta.tipoPago === 'abono' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}>DEBE</button>
                </div>
                {formVenta.tipoPago === 'abono' && <input type="number" placeholder="Abono ($)" value={formVenta.montoPagado} onChange={e=>setFormVenta({...formVenta, montoPagado: e.target.value})} className="w-full border-2 border-red-100 p-3 rounded-xl font-bold text-red-600 outline-none"/>}
                
                <button onClick={procesarVenta} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg">GUARDAR VENTA</button>
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center"><span className="font-bold text-slate-500 text-xs uppercase">Hoy</span><input type="text" placeholder="Buscar..." value={filtroBusqueda} onChange={e=>setFiltroBusqueda(e.target.value)} className="bg-transparent text-right outline-none text-sm font-bold w-24"/></div>
            {ventas.filter(v => v.cliente.toLowerCase().includes(filtroBusqueda.toLowerCase())).slice(-10).reverse().map(v => (
                <div key={v.id} className="p-4 border-b last:border-0 flex justify-between items-center">
                    <div><p className="font-bold text-slate-800">{v.cliente}</p><p className="text-xs text-slate-400">{v.peso}lb • ${v.total.toFixed(2)}</p></div>
                    <div className="flex items-center gap-2">
                        {v.saldo > 0.1 ? (<button onClick={()=>{setTransaccionSeleccionada(v); setTipoPagoModal('cliente'); setMostrarPago(true)}} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold">Cobrar</button>) : (<span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold">OK</span>)}
                        <button onClick={()=> { setFormVenta(v); setModoEdicion(true); setIdEdicion(v.id); }} className="p-2 bg-slate-100 rounded-lg text-slate-500"><Edit size={14}/></button>
                        <button onClick={()=>{setItemAEliminar(v); setTipoEliminacion('venta'); setMostrarConfirmacion(true)}} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}