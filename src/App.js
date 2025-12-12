import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx'; 
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { 
  Package, DollarSign, Trash2, Edit, 
  LayoutDashboard, ShoppingCart, 
  PieChart as IconPieChart, Search, Users,
  Download, FileSpreadsheet, RotateCcw, 
  TrendingUp, TrendingDown, Calculator, X, Save, Plus, ArrowUpRight,
  Beef, Drumstick, ChefHat
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';

// --- CONFIGURACIÓN DE PRODUCTOS ---
const PRODUCTOS = {
  pollo: { 
    label: 'Pollo', 
    emoji: '🐔', 
    color: 'orange', 
    merma: 0.85,          // EL CULPABLE: Factor de conversión. 
    precio_envase: 4.5,   
    texto_compra: 'Gavetas',
    texto_unidad: 'Pollos'
  },
  res: { 
    label: 'Res',   
    emoji: '🐮', 
    color: 'red',    
    merma: 1.0,           
    precio_envase: 0,     
    texto_compra: 'Canal',
    texto_unidad: 'Reses'
  },
  cerdo: { 
    label: 'Cerdo', 
    emoji: '🐷', 
    color: 'pink',   
    merma: 1.0,           
    precio_envase: 0,
    texto_compra: 'Canal',
    texto_unidad: 'Cerdos'
  },
  chivo: { 
    label: 'Chivo', 
    emoji: '🐐', 
    color: 'amber',  
    merma: 1.0,           
    precio_envase: 0,
    texto_compra: 'Canal',
    texto_unidad: 'Chivos'
  }
};

// --- VALORES INICIALES ---
const INITIAL_COMPRA = {
  fecha: new Date().toISOString().split('T')[0],
  proveedor: '', 
  pesoBruto: '', 
  pesoTara: '', 
  pesoNetoCalculado: 0,
  cantidad: '', 
  precioLb: '', 
  montoPagado: '', 
  tipoPago: 'total', 
  registradoPor: ''
};

const INITIAL_VENTA = {
  fecha: new Date().toISOString().split('T')[0],
  cliente: '', 
  tipoEnvase: 'funda', 
  cantidadGavetas: '', 
  pesoPorGaveta: 4.5, 
  pesoBruto: '', 
  peso: '', 
  precioLb: '', 
  montoPagado: '', 
  tipoPago: 'total', 
  registradoPor: ''
};

export default function ControlCarnico() {
  // 1. ESTADO GLOBAL
  const [producto, setProducto] = useState('pollo'); 

  // 2. DATOS
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [inventario, setInventario] = useState(0);
  const [listaClientes, setListaClientes] = useState([]);
  const [listaProveedores, setListaProveedores] = useState([]);
  
  // UI
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Modales
  const [mostrarPago, setMostrarPago] = useState(false);
  const [tipoPagoModal, setTipoPagoModal] = useState('cliente'); 
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [mostrarDevolucion, setMostrarDevolucion] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [tipoEliminacion, setTipoEliminacion] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Formularios
  const [formCompra, setFormCompra] = useState(INITIAL_COMPRA);
  const [formVenta, setFormVenta] = useState(INITIAL_VENTA);
  const [formPago, setFormPago] = useState({ monto: '', fecha: new Date().toISOString().split('T')[0] });
  const [formDevolucion, setFormDevolucion] = useState({ tipo: 'valor', cantidad: '', observacion: '', fecha: new Date().toISOString().split('T')[0] });

  // ==========================================
  // 3. CARGA Y MATEMÁTICAS BLINDADAS
  // ==========================================
  
  useEffect(() => {
      cargarDatos();
      setFormCompra(INITIAL_COMPRA);
      setFormVenta({...INITIAL_VENTA, pesoPorGaveta: PRODUCTOS[producto].precio_envase});
      setVistaActual('dashboard');
  }, [producto]);

  // >>>>>> AQUÍ ESTÁ LA SOLUCIÓN AL PROBLEMA DEL STOCK <<<<<<
  // Este bloque se ejecuta siempre que cambias una compra o venta.
  // Recalcula el inventario desde CERO usando la merma correcta.
  useEffect(() => {
    if (!compras || !ventas) return;

    // 1. Sumar todas las entradas (Peso Neto Real)
    const totalEntradas = compras.reduce((sum, c) => sum + (parseFloat(c.pesoNeto) || parseFloat(c.pesoNetoCalculado) || 0), 0);

    // 2. Sumar todas las salidas CONVIRTIÉNDOLAS SEGÚN EL PRODUCTO
    const factorMerma = PRODUCTOS[producto].merma;
    
    const totalSalidas = ventas.reduce((sum, v) => {
        const pesoVenta = parseFloat(v.peso) || 0;
        // Si es Pollo (0.85), divide: 85lb venta / 0.85 = 100lb inventario restado.
        // Si es Res (1.0), divide: 100lb venta / 1.0 = 100lb inventario restado.
        const pesoConsumido = pesoVenta / factorMerma; 
        return sum + pesoConsumido;
    }, 0);

    const stockReal = totalEntradas - totalSalidas;
    
    // Si el número es muy pequeño (ej: 0.0000001), lo volvemos 0 absoluto.
    const stockFinal = Math.abs(stockReal) < 0.01 ? 0 : stockReal;

    setInventario(stockFinal);
    
    // Guardamos el dato corregido para que no se pierda al reiniciar
    localStorage.setItem(`inventario-${producto}`, stockFinal.toString());

  }, [compras, ventas, producto]); 
  // ^^^ FIN DE LA SOLUCIÓN ^^^


  // ==========================================
  // 4. CÁLCULOS FORMULARIOS (TARA)
  // ==========================================
  
  useEffect(() => {
    const bruto = parseFloat(formCompra.pesoBruto) || 0;
    const tara = parseFloat(formCompra.pesoTara) || 0;
    const neto = bruto - tara;
    setFormCompra(p => ({ ...p, pesoNetoCalculado: neto > 0 ? neto : 0 }));
  }, [formCompra.pesoBruto, formCompra.pesoTara]);

  useEffect(() => {
    const bruto = parseFloat(formVenta.pesoBruto) || 0;
    let descuento = 0;
    if (formVenta.tipoEnvase === 'gaveta') {
        descuento = (parseFloat(formVenta.cantidadGavetas)||0) * (parseFloat(formVenta.pesoPorGaveta)||0);
    }
    const neto = bruto - descuento;
    setFormVenta(p => ({ ...p, peso: neto > 0 ? neto.toFixed(2) : '' }));
  }, [formVenta.pesoBruto, formVenta.tipoEnvase, formVenta.cantidadGavetas, formVenta.pesoPorGaveta]);

  // Auto-Precios
  useEffect(() => {
    if (formCompra.tipoPago === 'total') {
        const t = (formCompra.pesoNetoCalculado||0) * (parseFloat(formCompra.precioLb)||0);
        if(t>0) setFormCompra(p => ({...p, montoPagado: t.toFixed(2)}));
    } else if (formCompra.tipoPago === 'abono' && !modoEdicion) setFormCompra(p => ({...p, montoPagado: ''}));
  }, [formCompra.tipoPago, formCompra.pesoNetoCalculado, formCompra.precioLb, modoEdicion]);

  useEffect(() => {
      if (formVenta.tipoPago === 'total') {
          const t = (parseFloat(formVenta.peso)||0) * (parseFloat(formVenta.precioLb)||0);
          if(t>0) setFormVenta(p => ({...p, montoPagado: t.toFixed(2)}));
      } else if (formVenta.tipoPago === 'abono' && !modoEdicion) setFormVenta(p => ({...p, montoPagado: ''}));
  }, [formVenta.tipoPago, formVenta.peso, formVenta.precioLb, modoEdicion]);


  // ==========================================
  // 5. GESTIÓN DE DATOS
  // ==========================================
  const cargarDatos = () => {
    try {
      setLoading(true);
      setCompras(JSON.parse(localStorage.getItem(`compras-${producto}`) || '[]'));
      setVentas(JSON.parse(localStorage.getItem(`ventas-${producto}`) || '[]'));
      // Inventario se calcula solo con el useEffect, no hace falta leerlo del storage directo para display, pero lo leemos para iniciar
      setInventario(parseFloat(localStorage.getItem(`inventario-${producto}`)) || 0);
      
      setListaClientes(JSON.parse(localStorage.getItem('db-clientes') || '[]'));
      setListaProveedores(JSON.parse(localStorage.getItem('db-proveedores') || '[]'));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const guardarGlobal = (nC, nV) => {
    localStorage.setItem(`compras-${producto}`, JSON.stringify(nC));
    localStorage.setItem(`ventas-${producto}`, JSON.stringify(nV));
    // No guardamos inventario aquí manualmente, el useEffect lo hará por nosotros correctamente
    setCompras(nC); setVentas(nV); 
  };

  const actualizarDirectorio = (nombre, tipo) => {
      const limpio = nombre.trim();
      if (!limpio) return;
      if (tipo === 'cliente' && !listaClientes.includes(limpio)) {
          const n = [...listaClientes, limpio].sort();
          setListaClientes(n); localStorage.setItem('db-clientes', JSON.stringify(n));
      } else if (tipo === 'proveedor' && !listaProveedores.includes(limpio)) {
          const n = [...listaProveedores, limpio].sort();
          setListaProveedores(n); localStorage.setItem('db-proveedores', JSON.stringify(n));
      }
  };

  // ==========================================
  // 6. LÓGICA DE NEGOCIO
  // ==========================================
  
  const procesarCompra = () => {
    if (!formCompra.proveedor || !formCompra.precioLb) return alert('Faltan datos');
    if (formCompra.pesoNetoCalculado <= 0) return alert('Peso incorrecto');
    actualizarDirectorio(formCompra.proveedor, 'proveedor');

    const total = formCompra.pesoNetoCalculado * parseFloat(formCompra.precioLb);
    const pagado = formCompra.tipoPago === 'total' ? total : (parseFloat(formCompra.montoPagado) || 0);
    
    const item = {
      id: modoEdicion ? idEdicion : Date.now(),
      ...formCompra,
      pesoNeto: formCompra.pesoNetoCalculado,
      total, pagado, saldo: total - pagado,
      pagos: (pagado > 0 && !modoEdicion) ? [{monto: pagado, fecha: formCompra.fecha}] : (modoEdicion ? compras.find(c=>c.id===idEdicion).pagos : [])
    };

    let nC = [...compras];
    if (modoEdicion) {
        nC = nC.map(c => c.id === idEdicion ? item : c);
    } else nC.push(item);
    
    guardarGlobal(nC, ventas); // El useEffect actualizará el inventario solo
    setFormCompra(INITIAL_COMPRA); setModoEdicion(false); setIdEdicion(null);
    alert("Compra registrada");
  };

  const procesarVenta = () => {
    if (!formVenta.cliente || !formVenta.peso || !formVenta.precioLb) return alert('Faltan datos');
    actualizarDirectorio(formVenta.cliente, 'cliente');

    const pesoVendido = parseFloat(formVenta.peso);
    
    // Calculo solo para alerta
    const descuentoInventario = (pesoVendido / PRODUCTOS[producto].merma);

    if (!modoEdicion && descuentoInventario > inventario) {
        if(!window.confirm(`⚠️ Inventario bajo.\nSe descontarán aprox: ${descuentoInventario.toFixed(2)} lb\nDisponible: ${inventario.toFixed(2)} lb\n¿Vender igual?`)) return;
    }

    const total = pesoVendido * parseFloat(formVenta.precioLb);
    const pagado = formVenta.tipoPago === 'total' ? total : (parseFloat(formVenta.montoPagado) || 0);

    const item = {
        id: modoEdicion ? idEdicion : Date.now(),
        ...formVenta,
        peso: pesoVendido, 
        total, pagado, saldo: total - pagado,
        pagos: (pagado > 0 && !modoEdicion) ? [{monto: pagado, fecha: formVenta.fecha}] : (modoEdicion ? ventas.find(v=>v.id===idEdicion).pagos : []),
        devoluciones: modoEdicion ? ventas.find(v=>v.id===idEdicion).devoluciones || [] : []
    };

    let nV = [...ventas];
    if (modoEdicion) {
        nV = nV.map(v => v.id === idEdicion ? item : v);
    } else nV.push(item);

    guardarGlobal(compras, nV); // El useEffect actualizará el inventario solo
    setFormVenta({...INITIAL_VENTA, pesoPorGaveta: PRODUCTOS[producto].precio_envase}); 
    setModoEdicion(false); setIdEdicion(null);
    alert("Venta registrada");
  };

  // Pagos
  const agregarPago = () => {
      const m = parseFloat(formPago.monto);
      if (!m || m <= 0) return;
      if (m > (transaccionSeleccionada.saldo + 0.5)) return alert('Monto mayor a deuda');
      const pago = { monto: m, fecha: formPago.fecha };
      if (tipoPagoModal === 'cliente') {
          const nV = ventas.map(v => v.id === transaccionSeleccionada.id ? {...v, pagado: v.pagado+m, saldo: v.saldo-m, pagos: [...(v.pagos||[]), pago]} : v);
          guardarGlobal(compras, nV);
      } else {
          const nC = compras.map(c => c.id === transaccionSeleccionada.id ? {...c, pagado: c.pagado+m, saldo: c.saldo-m, pagos: [...(c.pagos||[]), pago]} : c);
          guardarGlobal(nC, ventas);
      }
      setMostrarPago(false); setFormPago({...formPago, monto: ''});
  };

  // Devoluciones
  const registrarDevolucion = () => {
    const cantidad = parseFloat(formDevolucion.cantidad);
    if (!cantidad || cantidad <= 0) return;
    let valor = formDevolucion.tipo === 'valor' ? cantidad : (cantidad * transaccionSeleccionada.precioLb);
    const nV = ventas.map(v => v.id === transaccionSeleccionada.id ? {
        ...v, total: v.total - valor, saldo: (v.total - valor) - v.pagado,
        devoluciones: [...(v.devoluciones||[]), { fecha: formDevolucion.fecha, cantidad, valor, tipo: formDevolucion.tipo }]
    } : v);
    guardarGlobal(compras, nV);
    setMostrarDevolucion(false); setFormDevolucion({...formDevolucion, cantidad: '', observacion: ''});
  };

  const eliminarItem = () => {
      if (!itemAEliminar) return;
      let nC = [...compras], nV = [...ventas];
      if (tipoEliminacion === 'compra') {
          nC = nC.filter(c => c.id !== itemAEliminar.id);
      } else {
          nV = nV.filter(v => v.id !== itemAEliminar.id);
      }
      guardarGlobal(nC, nV); setMostrarConfirmacion(false);
  };

  // Excel Nativo
  const exportarExcel = async () => {
    if (!ventas.length && !compras.length) return alert("Sin datos");
    try {
        const wb = XLSX.utils.book_new();
        const dataV = ventas.map(v => ({ Fecha: v.fecha, Cliente: v.cliente, 'Peso(lb)': v.peso, 'Total($)': v.total, 'Deuda($)': v.saldo }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataV), "Ventas");
        const dataC = compras.map(c => ({ Fecha: c.fecha, Proveedor: c.proveedor, 'Peso(lb)': c.pesoNeto, 'Total($)': c.total, 'Pagado($)': c.pagado, 'Deuda($)': c.saldo }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataC), "Compras");
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const fileName = `Reporte_${PRODUCTOS[producto].label}_${new Date().getTime()}.xlsx`;
        const savedFile = await Filesystem.writeFile({ path: fileName, data: wbout, directory: Directory.Documents });
        await Share.share({ title: 'Reporte Carnes', url: savedFile.uri });
    } catch (error) { alert("Error al crear Excel."); }
  };

  const editarCompra = (c) => { setFormCompra({...c, pesoNetoCalculado: c.pesoNeto, tipoPago: 'abono'}); setModoEdicion(true); setIdEdicion(c.id); setVistaActual('compras'); };
  const editarVenta = (v) => { setFormVenta({...v, tipoPago: 'abono'}); setModoEdicion(true); setIdEdicion(v.id); setVistaActual('ventas'); };

  const stats = useMemo(() => ({
      cobrar: ventas.reduce((s,v) => s + v.saldo, 0),
      pagar: compras.reduce((s,c) => s + c.saldo, 0),
      grafico: Object.values(ventas.reduce((acc, v) => {
         if(!acc[v.fecha]) acc[v.fecha] = {name: v.fecha.slice(5), Ventas: 0};
         acc[v.fecha].Ventas += v.total; return acc;
      }, {})).sort((a,b) => a.name.localeCompare(b.name)).slice(-7)
  }), [ventas, compras]);

  // ==========================================
  // 7. RENDERIZADO
  // ==========================================
  const tema = PRODUCTOS[producto].color; 
  const config = PRODUCTOS[producto];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 select-none font-sans">
      
      {/* HEADER: SELECTOR */}
      <header className="bg-white pt-2 shadow-sm sticky top-0 z-30">
         <div className="px-6 pb-2 flex justify-between items-center">
            <div><h1 className="text-xl font-black tracking-tighter">Control<span style={{color: tema}} className="capitalize">{producto}</span></h1></div>
            <div className="text-right"><p className="text-[10px] uppercase font-bold text-slate-400">Stock</p><p className={`text-lg font-black text-${tema === 'orange' ? 'orange' : tema}-600`}>{inventario.toFixed(0)} lb</p></div>
         </div>
         <div className="flex overflow-x-auto px-4 pb-2 gap-2 no-scrollbar">
            {Object.entries(PRODUCTOS).map(([key, val]) => (
                <button key={key} onClick={() => setProducto(key)} className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${producto === key ? 'bg-slate-900 text-white shadow-lg transform scale-105' : 'bg-slate-100 text-slate-400'}`}>
                    <span>{val.emoji}</span> {val.label}
                </button>
            ))}
         </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-6">
        
        {/* DASHBOARD */}
        {vistaActual === 'dashboard' && (
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
        )}

        {/* VENTAS */}
        {vistaActual === 'ventas' && (
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

                {/* Lista Ventas */}
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
        )}

        {/* COMPRAS */}
        {vistaActual === 'compras' && (
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
        )}

        {/* REPORTES */}
        {vistaActual === 'reportes' && (
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
        )}
      </main>

      {/* NAVBAR */}
      <nav className="bg-white border-t fixed bottom-0 w-full px-6 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
          {[{id:'dashboard',icon:LayoutDashboard,label:'Inicio'},{id:'ventas',icon:ShoppingCart,label:'Ventas'},{id:'compras',icon:Package,label:'Compras'},{id:'reportes',icon:FileSpreadsheet,label:'Reportes'}].map(i=>(
              <button key={i.id} onClick={()=>setVistaActual(i.id)} className={`flex flex-col items-center gap-1 p-2 transition-all ${vistaActual===i.id?'text-slate-900 -translate-y-1':'text-slate-300'}`}>
                  <i.icon size={26} strokeWidth={vistaActual===i.id?2.5:2}/>
                  <span className={`text-[9px] font-bold uppercase ${vistaActual===i.id?'opacity-100':'opacity-0 hidden'}`}>{i.label}</span>
              </button>
          ))}
      </nav>

      {/* MODALES */}
      {mostrarPago && transaccionSeleccionada && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white w-full sm:max-w-xs rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom">
                  <h3 className="text-lg font-bold text-center mb-1">Abonar Deuda</h3>
                  <p className="text-center text-slate-400 text-xs mb-6">Pendiente: <span className="text-red-500 font-bold">${transaccionSeleccionada.saldo.toFixed(2)}</span></p>
                  <input type="number" autoFocus value={formPago.monto} onChange={e=>setFormPago({...formPago, monto: e.target.value})} className="w-full text-center text-4xl font-black outline-none mb-8" placeholder="$0.00"/>
                  <button onClick={agregarPago} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg">Confirmar</button>
                  <button onClick={()=>setMostrarPago(false)} className="w-full text-slate-400 font-bold py-3 mt-2">Cancelar</button>
              </div>
          </div>
      )}

      {mostrarDevolucion && (
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
                        <button onClick={() => setMostrarDevolucion(false)} className="flex-1 py-3 text-slate-400 font-bold">Cancelar</button>
                        <button onClick={registrarDevolucion} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl">Guardar</button>
                     </div>
                </div>
            </div>
        </div>
      )}

      {mostrarConfirmacion && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center">
                 <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar registro?</h3>
                 <div className="flex gap-3 mt-4">
                     <button onClick={() => setMostrarConfirmacion(false)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">No</button>
                     <button onClick={eliminarItem} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl">Sí</button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
}