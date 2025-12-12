import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function Compras({
  formCompra, setFormCompra, procesarCompra, listaProveedores, config, compras,
  setModoEdicion, setIdEdicion, setTransaccionSeleccionada, setTipoPagoModal, setMostrarPago,
  setItemAEliminar, setTipoEliminacion, setMostrarConfirmacion
}) {
  return (
    <div className="space-y-5 animate-in slide-in-from-right">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
                <span className="text-2xl">{config.emoji}</span> Compra ({config.texto_compra})
            </h3>
            <div className="space-y-4">
                <input list="proveedores" value={formCompra.proveedor} onChange={e=>setFormCompra({...formCompra, proveedor: e.target.value})} placeholder="Proveedor" className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none"/>
                <datalist id="proveedores">{listaProveedores.map((p,i)=><option key={i} value={p}/>)}</datalist>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex gap-2 items-center">
                        <div className="flex-1"><input type="number" placeholder="Lleno" value={formCompra.pesoBruto} onChange={e=>setFormCompra({...formCompra, pesoBruto: e.target.value})} className="w-full bg-white p-2 rounded-xl font-bold text-center outline-none"/><span className="text-[9px] text-center block text-slate-400 mt-1">Peso Bruto</span></div>
                        <span className="text-slate-300 font-bold">-</span>
                        <div className="flex-1"><input type="number" placeholder="Tara" value={formCompra.pesoTara} onChange={e=>setFormCompra({...formCompra, pesoTara: e.target.value})} className="w-full bg-white p-2 rounded-xl font-bold text-center outline-none"/><span className="text-[9px] text-center block text-slate-400 mt-1">Tara</span></div>
                        <span className="text-slate-300 font-bold">=</span>
                        <div className="flex-1"><div className="w-full bg-slate-200 p-2 rounded-xl font-black text-center text-slate-700">{formCompra.pesoNetoCalculado}</div><span className="text-[9px] text-center block text-slate-400 mt-1">Neto</span></div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                     <div className="flex-1"><input type="number" placeholder="# Cantidad" value={formCompra.cantidad} onChange={e=>setFormCompra({...formCompra, cantidad: e.target.value})} className="w-full bg-slate-50 p-3 rounded-2xl font-bold text-lg outline-none"/><span className="text-[9px] text-center block text-slate-400 mt-1">{config.texto_unidad}</span></div>
                     <div className="flex-1"><input type="number" placeholder="$ Precio" value={formCompra.precioLb} onChange={e=>setFormCompra({...formCompra, precioLb: e.target.value})} className="w-full bg-slate-50 p-3 rounded-2xl font-bold text-lg outline-none"/></div>
                </div>

                <div className="flex gap-2">
                    <button onClick={()=>setFormCompra({...formCompra, tipoPago: 'total'})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 ${formCompra.tipoPago === 'total' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400'}`}>PAGADO</button>
                    <button onClick={()=>setFormCompra({...formCompra, tipoPago: 'abono'})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 ${formCompra.tipoPago === 'abono' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}>DEBO</button>
                </div>
                {formCompra.tipoPago === 'abono' && <input type="number" placeholder="Abono ($)" value={formCompra.montoPagado} onChange={e=>setFormCompra({...formCompra, montoPagado: e.target.value})} className="w-full border-2 border-red-100 bg-red-50/30 p-3 rounded-xl font-bold text-red-600 outline-none"/>}

                <button onClick={procesarCompra} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg">REGISTRAR COMPRA</button>
            </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b font-bold text-xs text-slate-500 uppercase">Historial Compras</div>
             {compras.slice(-5).reverse().map(c => (
                <div key={c.id} className="p-4 border-b flex justify-between items-center">
                    <div><p className="font-bold text-slate-800">{c.proveedor}</p><p className="text-xs text-slate-400">{c.pesoNetoCalculado}lb • {c.cantidad} und</p></div>
                    <div className="flex items-center gap-2">
                        {c.saldo > 0.1 && <button onClick={()=>{setTransaccionSeleccionada(c); setTipoPagoModal('proveedor'); setMostrarPago(true)}} className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold">Pagar</button>}
                        <button onClick={()=>{setFormCompra(c); setModoEdicion(true); setIdEdicion(c.id);}} className="bg-slate-100 p-2 rounded text-slate-500"><Edit size={14}/></button>
                        <button onClick={()=>{setItemAEliminar(c); setTipoEliminacion('compra'); setMostrarConfirmacion(true)}} className="bg-red-50 text-red-500 p-2 rounded"><Trash2 size={14}/></button>
                    </div>
                </div>
             ))}
        </div>
    </div>
  );
}