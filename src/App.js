import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx'; 
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Importamos nuestros componentes y datos
import { PRODUCTOS, INITIAL_COMPRA, INITIAL_VENTA } from './data/config';
import Navbar from './components/Navbar';
import { ModalPago, ModalDevolucion, ModalConfirmacion } from './components/Modales';
import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Compras from './pages/Compras';
import Reportes from './pages/Reportes';
import './App.css'; // Mantenemos tu import de estilos

export default function ControlCarnico() {
  // 1. ESTADO GLOBAL
  const [producto, setProducto] = useState('pollo'); 
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [inventario, setInventario] = useState(0);
  const [listaClientes, setListaClientes] = useState([]);
  const [listaProveedores, setListaProveedores] = useState([]);
  
  // UI
  const [vistaActual, setVistaActual] = useState('dashboard');
  
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
  // CARGA Y MATEMÁTICAS (Tu lógica original)
  // ==========================================
  
  useEffect(() => {
      cargarDatos();
      setFormCompra(INITIAL_COMPRA);
      setFormVenta({...INITIAL_VENTA, pesoPorGaveta: PRODUCTOS[producto].precio_envase});
      setVistaActual('dashboard');
  }, [producto]);

  useEffect(() => {
    if (!compras || !ventas) return;
    const totalEntradas = compras.reduce((sum, c) => sum + (parseFloat(c.pesoNeto) || parseFloat(c.pesoNetoCalculado) || 0), 0);
    const factorMerma = PRODUCTOS[producto].merma;
    const totalSalidas = ventas.reduce((sum, v) => {
        const pesoVenta = parseFloat(v.peso) || 0;
        const pesoConsumido = pesoVenta / factorMerma; 
        return sum + pesoConsumido;
    }, 0);
    const stockReal = totalEntradas - totalSalidas;
    const stockFinal = Math.abs(stockReal) < 0.01 ? 0 : stockReal;
    setInventario(stockFinal);
    localStorage.setItem(`inventario-${producto}`, stockFinal.toString());
  }, [compras, ventas, producto]); 

  // CÁLCULOS FORMULARIOS
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

  // GESTIÓN DE DATOS
  const cargarDatos = () => {
    try {
      setCompras(JSON.parse(localStorage.getItem(`compras-${producto}`) || '[]'));
      setVentas(JSON.parse(localStorage.getItem(`ventas-${producto}`) || '[]'));
      setInventario(parseFloat(localStorage.getItem(`inventario-${producto}`)) || 0);
      setListaClientes(JSON.parse(localStorage.getItem('db-clientes') || '[]'));
      setListaProveedores(JSON.parse(localStorage.getItem('db-proveedores') || '[]'));
    } catch (e) { console.error(e); }
  };

  const guardarGlobal = (nC, nV) => {
    localStorage.setItem(`compras-${producto}`, JSON.stringify(nC));
    localStorage.setItem(`ventas-${producto}`, JSON.stringify(nV));
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

  // LÓGICA DE NEGOCIO
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
    if (modoEdicion) nC = nC.map(c => c.id === idEdicion ? item : c);
    else nC.push(item);
    
    guardarGlobal(nC, ventas);
    setFormCompra(INITIAL_COMPRA); setModoEdicion(false); setIdEdicion(null);
    alert("Compra registrada");
  };

  const procesarVenta = () => {
    if (!formVenta.cliente || !formVenta.peso || !formVenta.precioLb) return alert('Faltan datos');
    actualizarDirectorio(formVenta.cliente, 'cliente');

    const pesoVendido = parseFloat(formVenta.peso);
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
    if (modoEdicion) nV = nV.map(v => v.id === idEdicion ? item : v);
    else nV.push(item);

    guardarGlobal(compras, nV);
    setFormVenta({...INITIAL_VENTA, pesoPorGaveta: PRODUCTOS[producto].precio_envase}); 
    setModoEdicion(false); setIdEdicion(null);
    alert("Venta registrada");
  };

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
      if (tipoEliminacion === 'compra') nC = nC.filter(c => c.id !== itemAEliminar.id);
      else nV = nV.filter(v => v.id !== itemAEliminar.id);
      guardarGlobal(nC, nV); setMostrarConfirmacion(false);
  };

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

  const stats = useMemo(() => ({
      cobrar: ventas.reduce((s,v) => s + v.saldo, 0),
      pagar: compras.reduce((s,c) => s + c.saldo, 0),
      grafico: Object.values(ventas.reduce((acc, v) => {
         if(!acc[v.fecha]) acc[v.fecha] = {name: v.fecha.slice(5), Ventas: 0};
         acc[v.fecha].Ventas += v.total; return acc;
      }, {})).sort((a,b) => a.name.localeCompare(b.name)).slice(-7)
  }), [ventas, compras]);

  const config = PRODUCTOS[producto];
  const tema = config.color;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 select-none font-sans">
      
      {/* HEADER */}
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

      {/* MAIN RENDER */}
      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-6">
        
        {vistaActual === 'dashboard' && (
            <Dashboard stats={stats} config={config} />
        )}

        {vistaActual === 'ventas' && (
            <Ventas 
                formVenta={formVenta} setFormVenta={setFormVenta}
                procesarVenta={procesarVenta} listaClientes={listaClientes}
                producto={producto} config={config} ventas={ventas}
                setModoEdicion={setModoEdicion} setIdEdicion={setIdEdicion}
                setTransaccionSeleccionada={setTransaccionSeleccionada} setTipoPagoModal={setTipoPagoModal} setMostrarPago={setMostrarPago}
                setItemAEliminar={setItemAEliminar} setTipoEliminacion={setTipoEliminacion} setMostrarConfirmacion={setMostrarConfirmacion}
                filtroBusqueda={filtroBusqueda} setFiltroBusqueda={setFiltroBusqueda}
            />
        )}

        {vistaActual === 'compras' && (
            <Compras 
                formCompra={formCompra} setFormCompra={setFormCompra}
                procesarCompra={procesarCompra} listaProveedores={listaProveedores}
                config={config} compras={compras}
                setModoEdicion={setModoEdicion} setIdEdicion={setIdEdicion}
                setTransaccionSeleccionada={setTransaccionSeleccionada} setTipoPagoModal={setTipoPagoModal} setMostrarPago={setMostrarPago}
                setItemAEliminar={setItemAEliminar} setTipoEliminacion={setTipoEliminacion} setMostrarConfirmacion={setMostrarConfirmacion}
            />
        )}

        {vistaActual === 'reportes' && (
            <Reportes 
                producto={producto} 
                exportarExcel={exportarExcel} 
                ventas={ventas} 
            />
        )}

      </main>

      <Navbar vistaActual={vistaActual} setVistaActual={setVistaActual} />

      {/* MODALES GLOBALES */}
      <ModalPago 
        isOpen={mostrarPago} onClose={() => setMostrarPago(false)} 
        transaccion={transaccionSeleccionada} 
        formPago={formPago} setFormPago={setFormPago} agregarPago={agregarPago} 
      />

      <ModalDevolucion 
        isOpen={mostrarDevolucion} onClose={() => setMostrarDevolucion(false)} 
        formDevolucion={formDevolucion} setFormDevolucion={setFormDevolucion} registrarDevolucion={registrarDevolucion} 
      />

      <ModalConfirmacion 
        isOpen={mostrarConfirmacion} onClose={() => setMostrarConfirmacion(false)} 
        eliminarItem={eliminarItem} 
      />

    </div>
  );
}