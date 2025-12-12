import React from 'react';

export const ModalPago = ({ isOpen, onClose, transaccion, formPago, setFormPago, agregarPago }) => {
  if (!isOpen || !transaccion) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full sm:max-w-xs rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom">
            <h3 className="text-lg font-bold text-center mb-1">Abonar Deuda</h3>
            <p className="text-center text-slate-400 text-xs mb-6">Pendiente: <span className="text-red-500 font-bold">${transaccion.saldo.toFixed(2)}</span></p>
            <input type="number" autoFocus value={formPago.monto} onChange={e=>setFormPago({...formPago, monto: e.target.value})} className="w-full text-center text-4xl font-black outline-none mb-8" placeholder="$0.00"/>
            <button onClick={agregarPago} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg">Confirmar</button>
            <button onClick={onClose} className="w-full text-slate-400 font-bold py-3 mt-2">Cancelar</button>
        </div>
    </div>
  );
};

export const ModalDevolucion = ({ isOpen, onClose, formDevolucion, setFormDevolucion, registrarDevolucion }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Devolución</h3>
            <div className="space-y-3">
                 <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button onClick={() => setFormDevolucion({...formDevolucion, tipo: 'valor'})} className={`flex-1 py-2 text-xs font-bold rounded-lg ${formDevolucion.tipo === 'valor' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>$ Valor</button>
                    <button onClick={() => setFormDevolucion({...formDevolucion, tipo: 'cantidad'})} className={`flex-1 py-2 text-xs font-bold rounded-lg ${formDevolucion.tipo === 'cantidad' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>lb Peso</button>
                 </div>
                 <input type="number" placeholder="Cantidad" value={formDevolucion.cantidad} onChange={e => setFormDevolucion({...formDevolucion, cantidad: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none"/>
                 <div className="flex gap-3 mt-2">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold">Cancelar</button>
                    <button onClick={registrarDevolucion} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl">Guardar</button>
                 </div>
            </div>
        </div>
    </div>
  );
};

export const ModalConfirmacion = ({ isOpen, onClose, eliminarItem }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
       <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center">
           <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar registro?</h3>
           <div className="flex gap-3 mt-4">
               <button onClick={onClose} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">No</button>
               <button onClick={eliminarItem} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl">Sí</button>
           </div>
       </div>
    </div>
  );
};
